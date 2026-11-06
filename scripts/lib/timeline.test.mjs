import assert from "node:assert/strict";
import { test } from "node:test";
import { audioTags, buildTimeline, clipsInHtml, duckLane, parseSceneFile, retimePlan } from "./timeline.mjs";
import { wordsFromAlignment, wordsFromScribe } from "./words.mjs";

test("parseSceneFile strips comments and reads the after directive", () => {
  const raw = "# hook: the result first\n# after: 1.2\nYour exam score,\n  before you sit the exam.\n";
  assert.deepEqual(parseSceneFile(raw), { text: "Your exam score, before you sit the exam.", after: 1.2 });
  assert.deepEqual(parseSceneFile("Just text."), { text: "Just text.", after: undefined });
});

test("buildTimeline places scenes end to end with lead, gap and per-scene pauses", () => {
  const timeline = buildTimeline(
    [
      { id: "01-hook", audio: "assets/vo/01-hook.mp3", duration: 2, words: [{ id: "w0", text: "Hi", start: 0.1, end: 0.4 }] },
      { id: "02-proof", audio: "assets/vo/02-proof.mp3", duration: 3, after: 1, words: [{ id: "w0", text: "Go", start: 0, end: 0.3 }] },
      { id: "03-end", audio: "assets/vo/03-end.mp3", duration: 1, words: [] },
    ],
    { lead: 0.5, gap: 0.25 },
  );
  assert.deepEqual(
    timeline.scenes.map(({ id, start, end }) => [id, start, end]),
    [["01-hook", 0.5, 2.5], ["02-proof", 2.75, 5.75], ["03-end", 6.75, 7.75]],
  );
  assert.equal(timeline.speechEnd, 7.75);
  assert.equal(timeline.total, 10.25);
  assert.deepEqual(
    timeline.scenes.map((s) => s.window),
    [{ start: 0, duration: 2.6 }, { start: 2.6, duration: 4 }, { start: 6.6, duration: 3.65 }],
  );
  assert.deepEqual(timeline.words, [
    { id: "w0", text: "Hi", start: 0.6, end: 0.9 },
    { id: "w1", text: "Go", start: 2.75, end: 3.05 },
  ]);
});

test("a silent scene takes its time, carries no voice and keeps the bed up", () => {
  assert.deepEqual(parseSceneFile("# payoff plays under music\n# silent: 3\nignored"), { text: "", silent: 3, after: undefined });
  const timeline = buildTimeline(
    [
      { id: "01-proof", audio: "assets/vo/01-proof.mp3", duration: 2, words: [] },
      { id: "02-payoff", audio: null, duration: 3, words: [] },
      { id: "03-end", audio: "assets/vo/03-end.mp3", duration: 1, words: [] },
    ],
    { lead: 0, gap: 0.5, preroll: 0, endHold: 2 },
  );
  assert.deepEqual(timeline.scenes.map(({ start, end }) => [start, end]), [[0, 2], [2.5, 5.5], [5.5, 6.5]]);
  assert.equal(audioTags(timeline).split("\n").length, 2);
  assert.deepEqual(duckLane(timeline.scenes, { high: 1, low: 0, attack: 0, release: 0, bridge: 0.1 }).lanes[0].points, [
    { t: 0, v: 0 }, { t: 2, v: 1 }, { t: 5.5, v: 0 }, { t: 6.5, v: 1 },
  ]);
});

// Replays a plan the way `hyperframes timeline apply` checks it: every edit, one at a time, must
// leave no two clips on a track overlapping.
function replay(clips, plan) {
  const at = new Map([...clips].map(([id, c]) => [id, { ...c }]));
  for (const edit of plan) {
    const clip = at.get(edit.ref.slice(1));
    if (edit.verb === "move") clip.start = Number(edit.time);
    if (edit.verb === "trim") clip.duration = Number(edit.duration);
    for (const [a, x] of at) for (const [b, y] of at) {
      if (a < b && x.track === y.track && x.start < y.start + y.duration && y.start < x.start + x.duration) {
        throw new Error(`${a} overlaps ${b} after ${JSON.stringify(edit)}`);
      }
    }
  }
  return at;
}

const threeScenes = (durations) =>
  buildTimeline(
    durations.map((d, i) => ({ id: `0${i + 1}`, audio: `assets/vo/0${i + 1}.mp3`, duration: d, words: [] })),
    { lead: 0.3, gap: 0.4, preroll: 0.1, endHold: 2 },
  );

test("retimePlan reaches the timeline without any intermediate overlap, whichever way scenes move", () => {
  const html = `
    <div id="scene-01" data-start="0" data-duration="2" data-track-index="1"></div>
    <div id="scene-02" data-start="2" data-duration="2" data-track-index="1"></div>
    <div id="scene-03" data-start="4" data-duration="2" data-track-index="1"></div>
    <audio id="vo-01" class="clip" data-start="0.3" data-duration="1.5" data-track-index="20"></audio>
    <audio id="vo-02" class="clip" data-start="2.3" data-duration="1.5" data-track-index="20"></audio>
    <audio id="vo-03" class="clip" data-start="4.3" data-duration="1.5" data-track-index="20"></audio>`;
  for (const durations of [[3, 1, 2], [1, 3, 1], [1, 1, 1], [4, 4, 4]]) {
    const timeline = threeScenes(durations);
    const final = replay(clipsInHtml(html), retimePlan(timeline, clipsInHtml(html)));
    for (const s of timeline.scenes) {
      assert.deepEqual(final.get(`scene-${s.id}`), { start: s.window.start, duration: s.window.duration, track: "1" });
      assert.deepEqual(final.get(`vo-${s.id}`), { start: s.start, duration: s.duration, track: "20" });
    }
  }
});

test("retimePlan leaves clips already in place, and ignores ids the project doesn't have", () => {
  const timeline = threeScenes([1.5, 1.5, 1.5]);
  const clips = new Map(timeline.scenes.map((s) => [`scene-${s.id}`, { ...s.window, track: "1" }]));
  assert.deepEqual(retimePlan(timeline, clips), []);
});

test("clipsInHtml reads authored timing in any attribute order and skips expressions", () => {
  const clips = clipsInHtml(`<div data-duration="2" id="a" data-start="1.5" data-track-index="3"></div>
    <div id="b" data-start="a + 0.5" data-duration="1"></div><p id="c">untimed</p>`);
  assert.deepEqual([...clips], [["a", { start: 1.5, duration: 2, track: "3" }]]);
});

test("clipsInHtml reads the real id when HyperFrames has stamped data-hf-id first", () => {
  const clips = clipsInHtml(
    '<div data-hf-id="hf-h4g0" id="scene-01-hook" data-composition-id="scene-01-hook" data-start="0" data-duration="2.95" data-track-index="1"></div>',
  );
  assert.deepEqual([...clips], [["scene-01-hook", { start: 0, duration: 2.95, track: "1" }]]);
});

test("duckLane dips under speech and bridges short pauses", () => {
  const lane = duckLane([{ start: 1, end: 3 }, { start: 3.4, end: 5 }, { start: 8, end: 9 }], { high: 0.5, low: 0.1, attack: 0.2, release: 0.5, bridge: 0.8 });
  assert.deepEqual(lane.lanes[0].points, [
    { t: 0, v: 0.5 }, { t: 0.8, v: 0.5 }, { t: 1, v: 0.1 }, { t: 5, v: 0.1 }, { t: 5.5, v: 0.5 },
    { t: 7.8, v: 0.5 }, { t: 8, v: 0.1 }, { t: 9, v: 0.1 }, { t: 9.5, v: 0.5 },
  ]);
});

test("duckLane starts ducked when speech starts at t=0", () => {
  const { points } = duckLane([{ start: 0, end: 1 }], { high: 0.5, low: 0.1, release: 0.5 }).lanes[0];
  assert.deepEqual(points, [{ t: 0, v: 0.1 }, { t: 1, v: 0.1 }, { t: 1.5, v: 0.5 }]);
});

test("audioTags writes one timed, grouped <audio> per scene", () => {
  const tags = audioTags({ scenes: [{ id: "01-hook", audio: "assets/vo/01-hook.mp3", start: 0.3, duration: 2.1 }] });
  assert.equal(
    tags,
    '<audio id="vo-01-hook" class="clip" src="assets/vo/01-hook.mp3" data-start="0.3" data-duration="2.1" data-track-index="20" data-volume="1" data-audio-group="voiceover"></audio>',
  );
});

test("wordsFromAlignment groups characters into words", () => {
  const chars = [..."Hi there"];
  const words = wordsFromAlignment({
    characters: chars,
    characterStartTimesSeconds: chars.map((_, i) => i * 0.1),
    characterEndTimesSeconds: chars.map((_, i) => i * 0.1 + 0.1),
  });
  assert.deepEqual(words, [
    { id: "w0", text: "Hi", start: 0, end: 0.2 },
    { id: "w1", text: "there", start: 0.3, end: 0.8 },
  ]);
});

test("wordsFromAlignment drops audio tags", () => {
  const chars = [..."[very excited] Go now"];
  const words = wordsFromAlignment({
    characters: chars,
    characterStartTimesSeconds: chars.map((_, i) => i),
    characterEndTimesSeconds: chars.map((_, i) => i + 1),
  });
  assert.deepEqual(words.map((w) => w.text), ["Go", "now"]);
  assert.deepEqual([words[0].start, words[0].end], [15, 17]);
});

test("wordsFromScribe keeps only spoken words", () => {
  const words = wordsFromScribe([
    { text: "Hello", type: "word", start: 0, end: 0.4 },
    { text: " ", type: "spacing", start: 0.4, end: 0.45 },
    { text: "(laughs)", type: "audio_event", start: 0.5, end: 1 },
    { text: "world", type: "word", start: 1, end: 1.3 },
  ]);
  assert.deepEqual(words, [
    { id: "w0", text: "Hello", start: 0, end: 0.4 },
    { id: "w1", text: "world", start: 1, end: 1.3 },
  ]);
});
