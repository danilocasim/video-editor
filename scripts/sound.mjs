// ElevenLabs music bed and sound effects into <project>/assets/audio/.
//
//   npm run sound -- --project my-video music "confident minimal electronic pulse, 110 bpm"
//   npm run sound -- --project my-video music "<prompt>" --seconds 40
//   npm run sound -- --project my-video sfx "soft UI mouse click" --name click --seconds 0.5
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { parseArgs } from "node:util";
import { requireProject } from "./lib/projects.mjs";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    project: { type: "string" },
    name: { type: "string" },
    seconds: { type: "string" },
  },
});
values.project = requireProject(values.project);

const [kind, ...promptWords] = positionals;
const prompt = promptWords.join(" ").trim();
if (!["music", "sfx"].includes(kind) || !prompt) {
  console.error('Usage: npm run sound -- --project <video-name> music "<prompt>" [--seconds 40] | sfx "<prompt>" --name click [--seconds 0.5]');
  process.exit(1);
}

const client = new ElevenLabsClient(); // reads ELEVENLABS_API_KEY
const dir = join(values.project, "assets", "audio");
await mkdir(dir, { recursive: true });

let stream;
let seconds = values.seconds ? Number(values.seconds) : undefined;
if (kind === "music") {
  seconds ??= await bedLengthFromTimeline();
  stream = await client.music.compose({
    prompt,
    musicLengthMs: Math.round(seconds * 1000),
    modelId: "music_v2_5",
    forceInstrumental: true, // a bed under narration never sings
  });
} else {
  stream = await client.textToSoundEffects.convert({ text: prompt, durationSeconds: seconds });
}

const out = join(dir, `${values.name ?? (kind === "music" ? "bgm" : "sfx")}.mp3`);
await pipeline(Readable.fromWeb(stream), createWriteStream(out));
console.log(`${kind.padEnd(5)} ${out}${seconds ? ` (${seconds} s requested)` : ""}`);

async function bedLengthFromTimeline() {
  const file = join(values.project, "assets", "vo", "timeline.json");
  if (!existsSync(file)) return 45;
  const { total } = JSON.parse(await readFile(file, "utf8"));
  return Math.min(120, Math.ceil(total + 3)); // a little tail so the fade-out never runs dry
}
