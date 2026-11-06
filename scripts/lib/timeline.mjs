// Lays per-scene voiceover takes end to end and derives everything HyperFrames needs to sync to them:
// scene windows, absolute word timings for captions, <audio> tags and a music duck lane.

const round = (s) => Math.round(s * 1000) / 1000;

// A scene file is narration text; lines starting with "#" are directives or notes, never spoken.
//   # after: 1.5     seconds of silence after this scene's line (default: the timeline gap)
//   # silent: 3      a scene with no voice that lasts this long (a payoff playing under music)
export function parseSceneFile(raw) {
  const directives = {};
  const spoken = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#")) {
      const match = trimmed.match(/^#\s*(after|silent):\s*([\d.]+)/i);
      if (match) directives[match[1].toLowerCase()] = Number(match[2]);
      continue;
    }
    spoken.push(trimmed);
  }
  const text = spoken.join(" ").replace(/\s+/g, " ").trim();
  if (directives.silent != null) return { text: "", silent: directives.silent, after: directives.after };
  return { text, after: directives.after };
}

// scenes: [{ id, audio (null when silent), duration, words (scene-local), after? }] in play order.
// Each scene also gets a visual window: windows tile the film with no gaps, cut `preroll` seconds
// before the scene's first word (the picture leads the voice), and the last one holds `endHold`.
export function buildTimeline(scenes, { lead = 0.3, gap = 0.4, preroll = 0.15, endHold = 2.5 } = {}) {
  let cursor = lead;
  const placed = scenes.map((scene) => {
    const start = cursor;
    const end = start + scene.duration;
    cursor = end + (scene.audio ? (scene.after ?? gap) : (scene.after ?? 0));
    return {
      id: scene.id,
      audio: scene.audio,
      start: round(start),
      duration: round(scene.duration),
      end: round(end),
      words: scene.words.map((w) => ({ ...w, start: round(start + w.start), end: round(start + w.end) })),
    };
  });
  const total = round((placed.at(-1)?.end ?? 0) + endHold);
  placed.forEach((scene, i) => {
    const from = i === 0 ? 0 : round(scene.start - preroll);
    const to = i === placed.length - 1 ? total : round(placed[i + 1].start - preroll);
    scene.window = { start: from, duration: round(to - from) };
  });
  const words = placed.flatMap((s) => s.words).map((w, i) => ({ ...w, id: `w${i}` }));
  const voiced = placed.filter((s) => s.audio);
  return { lead, gap, preroll, speechEnd: voiced.at(-1)?.end ?? 0, total, scenes: placed, words };
}

// A `hyperframes timeline apply` plan that retimes the scene hosts (#scene-<id>) and voice clips
// (#vo-<id>) found in `clips` (id → { start, duration, track }, as authored in the root).
// `apply` refuses any single edit that overlaps a neighbour on its track, so the plan never lets two
// clips touch mid-way: shrink every changing clip to a sliver, move each sliver once its target is
// free, then grow each to its final length (the final windows never overlap).
// The root's data-duration is not a clip: raise it to `total` before applying.
const SLIVER = 0.01;

export function retimePlan(timeline, clips) {
  const targets = [];
  for (const s of timeline.scenes) {
    targets.push({ id: `scene-${s.id}`, start: s.window.start, duration: s.window.duration });
    if (s.audio) targets.push({ id: `vo-${s.id}`, start: s.start, duration: s.duration });
  }
  const changing = targets.filter(({ id, start, duration }) => {
    const now = clips.get(id);
    return now && (now.start !== start || now.duration !== duration);
  });

  const at = new Map([...clips].map(([id, c]) => [id, { ...c }]));
  const plan = [];
  for (const { id } of changing) {
    plan.push({ verb: "trim", ref: `#${id}`, duration: String(SLIVER) });
    at.get(id).duration = SLIVER;
  }

  const overlaps = (id, start, end) =>
    [...at].some(([other, c]) => other !== id && c.track === at.get(id).track && c.start < end && start < c.start + c.duration);
  let pending = changing.filter(({ id, start }) => at.get(id).start !== start);
  while (pending.length) {
    const next = pending.find(({ id, start }) => !overlaps(id, start, start + SLIVER));
    if (!next) throw new Error(`retimePlan: no free move for ${pending.map((p) => p.id).join(", ")}`);
    plan.push({ verb: "move", ref: `#${next.id}`, time: String(next.start) });
    at.get(next.id).start = next.start;
    pending = pending.filter((p) => p !== next);
  }

  for (const { id, duration } of changing) plan.push({ verb: "trim", ref: `#${id}`, duration: String(duration) });
  return plan;
}

// Timed clips in an HTML file: id → { start, duration, track } from their authored attributes.
export function clipsInHtml(html) {
  const clips = new Map();
  for (const [tag] of html.matchAll(/<[a-z][^>]*\sid="[^"]+"[^>]*>/gi)) {
    // \s, not \b: HyperFrames stamps data-hf-id, which must not read as id.
    const attr = (name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
    const start = Number(attr("data-start"));
    const duration = Number(attr("data-duration"));
    if (Number.isFinite(start) && Number.isFinite(duration)) {
      clips.set(attr("id"), { start, duration, track: attr("data-track-index") ?? "" });
    }
  }
  return clips;
}

// Volume lane for a music bed starting at t=0: full under silence, ducked while the voice speaks.
// Pauses shorter than `bridge` seconds stay ducked so the bed doesn't pump between sentences.
export function duckLane(scenes, { high = 0.5, low = 0.14, attack = 0.15, release = 0.4, bridge = 0.8 } = {}) {
  const windows = [];
  for (const { start, end } of scenes.filter((s) => s.audio !== null)) {
    const last = windows.at(-1);
    if (last && start - last.end < bridge) last.end = end;
    else windows.push({ start, end });
  }
  const points = [{ t: 0, v: high }];
  for (const { start, end } of windows) {
    points.push({ t: round(Math.max(0, start - attack)), v: high }, { t: round(start), v: low });
    points.push({ t: round(end), v: low }, { t: round(end + release), v: high });
  }
  return { version: 1, lanes: [{ target: "volume", points: dedupe(points) }] };
}

// Two points at the same time: the later one wins (speech at t=0 starts the bed ducked).
function dedupe(points) {
  return points.reduce((out, p) => {
    if (out.length && out.at(-1).t >= p.t) out[out.length - 1] = { t: out.at(-1).t, v: p.v };
    else out.push(p);
    return out;
  }, []);
}

// Ready-to-paste <audio> elements for the root composition, one per scene, in a "voiceover" group.
export function audioTags(timeline, { trackIndex = 20 } = {}) {
  return timeline.scenes
    .filter((s) => s.audio)
    .map(
      (s) =>
        `<audio id="vo-${s.id}" class="clip" src="${s.audio}" data-start="${s.start}" data-duration="${s.duration}" data-track-index="${trackIndex}" data-volume="1" data-audio-group="voiceover"></audio>`,
    )
    .join("\n");
}
