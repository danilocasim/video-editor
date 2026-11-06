// Audio or video file → ElevenLabs Scribe word timings for HyperFrames captions.
//
//   npm run transcribe -- --project my-video videos/my-video/assets/clip.mp4
//   npm run transcribe -- --project my-video clip.mp4 --language eng --keyterms "product name"
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { createReadStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { parseArgs } from "node:util";
import { wordsFromScribe } from "./lib/words.mjs";
import { requireProject } from "./lib/projects.mjs";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    language: { type: "string" },
    keyterms: { type: "string" },
    project: { type: "string" },
  },
});
values.project = requireProject(values.project);

const [file] = positionals;
if (!file) {
  console.error('Usage: npm run transcribe -- --project <video-name> <audio-or-video> [--language eng] [--keyterms "a,b"]');
  process.exit(1);
}

const client = new ElevenLabsClient(); // reads ELEVENLABS_API_KEY
const result = await client.speechToText.convert({
  file: createReadStream(file),
  modelId: "scribe_v2",
  timestampsGranularity: "word",
  tagAudioEvents: false,
  languageCode: values.language,
  keyterms: values.keyterms?.split(",").map((t) => t.trim()),
});

const words = wordsFromScribe(result.words ?? []);
const assets = join(values.project, "assets");
const transcriptPath = join(assets, `${basename(file, extname(file))}.transcript.json`);

await mkdir(assets, { recursive: true });
await writeFile(transcriptPath, JSON.stringify(words, null, 2) + "\n");

console.log(`captions ${transcriptPath} (${words.length} words, ${result.languageCode ?? "unknown language"})`);
