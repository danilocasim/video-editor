// One ElevenLabs take per scene, laid end to end into a timeline HyperFrames syncs to.
//
//   npm run vo:scenes -- --project my-video                    # reuse unchanged takes
//   npm run vo:scenes -- --project my-video --only 03-proof     # re-roll one scene
//   npm run vo:scenes -- --project my-video --voice <id> --model eleven_multilingual_v2
//
// Writes into <project>/assets/vo/:
//   <scene>.mp3 + <scene>.json   the take and its scene-local word timings (cache key: text+voice+model)
//   timeline.json                voice windows, visual windows (#scene-<id>), absolute words, total length
//   captions.json                every word, absolute, in HyperFrames caption format
//   audio.html                   <audio> tags for the root, plus a ducked music bed
//   retime.plan.json             `hyperframes timeline apply` plan for the scene hosts and voice clips
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { parseArgs } from "node:util";
import { audioTags, buildTimeline, clipsInHtml, duckLane, parseSceneFile, retimePlan } from "./lib/timeline.mjs";
import { wordsFromAlignment } from "./lib/words.mjs";
import { requireProject } from "./lib/projects.mjs";

const { values } = parseArgs({
  options: {
    project: { type: "string" },
    dir: { type: "string" },
    only: { type: "string" },
    voice: { type: "string", default: "JBFqnCBsd6RMkjVDRZzb" }, // George (narrative)
    model: { type: "string", default: "eleven_v4" },
    lead: { type: "string", default: "0.3" },
    gap: { type: "string", default: "0.4" },
    "end-hold": { type: "string", default: "2.5" },
  },
});
values.project = requireProject(values.project);

const scriptDir = values.dir ?? join(values.project, "script");
const voDir = join(values.project, "assets", "vo");
const only = new Set(values.only?.split(",").map((s) => s.trim()) ?? []);

const files = (await readdir(scriptDir)).filter((f) => f.endsWith(".txt")).sort();
if (!files.length) {
  console.error(`No scene scripts in ${scriptDir}/ (expected 01-hook.txt, 02-….txt, …)`);
  process.exit(1);
}

const scenes = [];
for (const file of files) {
  const parsed = parseSceneFile(await readFile(join(scriptDir, file), "utf8"));
  if (parsed.text || parsed.silent) scenes.push({ id: basename(file, ".txt"), ...parsed });
}
for (const id of only) {
  if (!scenes.some((s) => s.id === id)) throw new Error(`--only ${id}: no ${scriptDir}/${id}.txt`);
}

await mkdir(voDir, { recursive: true });
const client = new ElevenLabsClient(); // reads ELEVENLABS_API_KEY
const spokenNeighbour = (from, step) => {
  for (let j = from + step; j >= 0 && j < scenes.length; j += step) if (scenes[j].text) return scenes[j].text;
};

for (const [i, scene] of scenes.entries()) {
  if (scene.silent) {
    Object.assign(scene, { audio: null, duration: scene.silent, words: [], status: "silent" });
    continue;
  }
  const audioFile = join(voDir, `${scene.id}.mp3`);
  const metaFile = join(voDir, `${scene.id}.json`);
  const hash = createHash("sha1").update(JSON.stringify([scene.text, values.voice, values.model])).digest("hex");
  const cached = existsSync(metaFile) && existsSync(audioFile) ? JSON.parse(await readFile(metaFile, "utf8")) : null;
  scene.audio = `assets/vo/${scene.id}.mp3`;

  if (cached && cached.hash === hash && !only.has(scene.id)) {
    Object.assign(scene, { duration: cached.duration, words: cached.words, status: "cached" });
    continue;
  }

  const result = await client.textToSpeech.convertWithTimestamps(values.voice, {
    text: scene.text,
    modelId: values.model,
    outputFormat: "mp3_44100_128",
    previousText: spokenNeighbour(i, -1), // stitching keeps tone continuous across separate takes
    nextText: spokenNeighbour(i, 1),
  });
  await writeFile(audioFile, Buffer.from(result.audioBase64, "base64"));

  const words = wordsFromAlignment(result.alignment);
  const duration = probeDuration(audioFile) ?? words.at(-1)?.end ?? 0;
  await writeFile(metaFile, JSON.stringify({ hash, text: scene.text, voice: values.voice, model: values.model, duration, words }, null, 2) + "\n");
  Object.assign(scene, { duration, words, status: "generated" });
}

const timeline = buildTimeline(
  scenes.map(({ id, audio, duration, words, after }) => ({ id, audio, duration, words, after })),
  { lead: Number(values.lead), gap: Number(values.gap), endHold: Number(values["end-hold"]) },
);
const plan = retimePlan(timeline, await rootClips(values.project));

await writeFile(join(voDir, "timeline.json"), JSON.stringify(timeline, null, 2) + "\n");
await writeFile(join(voDir, "captions.json"), JSON.stringify(timeline.words, null, 2) + "\n");
await writeFile(join(voDir, "retime.plan.json"), JSON.stringify(plan, null, 2) + "\n");
await writeFile(
  join(voDir, "audio.html"),
  [
    "<!-- Voiceover: one take per scene. Regenerated by npm run vo:scenes; paste into the root composition. -->",
    audioTags(timeline),
    "<!-- Music bed ducked under the voice: npm run sound -- music \"<prompt>\" writes assets/audio/bgm.mp3. -->",
    `<audio id="bgm" class="clip" src="assets/audio/bgm.mp3" data-start="0" data-duration="${timeline.total}" data-track-index="21" data-timeline-role="music" data-audio-group="music" data-fade-out="1.5" data-automation='${JSON.stringify(duckLane(timeline.scenes))}'></audio>`,
    "",
  ].join("\n"),
);

for (const s of timeline.scenes) {
  const status = scenes.find((x) => x.id === s.id).status;
  const voice = s.audio ? `voice ${s.start.toFixed(2)}–${s.end.toFixed(2)}` : "voice —          ";
  console.log(`${s.id.padEnd(16)} scene ${s.window.start.toFixed(2).padStart(6)} +${s.window.duration.toFixed(2).padEnd(6)} ${voice}  ${String(s.words.length).padStart(3)} words  ${status}`);
}
console.log(`total ${timeline.total.toFixed(2)} s (root data-duration) · speech ends ${timeline.speechEnd.toFixed(2)} s`);
console.log(`→ ${voDir}/timeline.json, captions.json, audio.html, retime.plan.json (${plan.length} edits)`);

function probeDuration(file) {
  try {
    const out = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" });
    return Math.round(Number(out.trim()) * 1000) / 1000 || null;
  } catch {
    return null;
  }
}

// Timed clips in the root composition, where the scene hosts and voice clips live.
async function rootClips(project) {
  const root = join(project, "index.html");
  return existsSync(root) ? clipsInHtml(await readFile(root, "utf8")) : new Map();
}
