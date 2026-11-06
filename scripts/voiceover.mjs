// Script → ElevenLabs voiceover + word timings, written into the HyperFrames project's assets/.
//
//   npm run voiceover -- --project my-video "Text to speak"
//   npm run voiceover -- --project my-video --file script.txt --voice <voice_id> --name intro
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { wordsFromAlignment } from "./lib/words.mjs";
import { requireProject } from "./lib/projects.mjs";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    file: { type: "string" },
    voice: { type: "string", default: "JBFqnCBsd6RMkjVDRZzb" }, // George (narrative)
    model: { type: "string", default: "eleven_v4" },
    name: { type: "string", default: "voiceover" },
    project: { type: "string" },
  },
});
values.project = requireProject(values.project);

const text = values.file ? (await readFile(values.file, "utf8")).trim() : positionals.join(" ").trim();
if (!text) {
  console.error('Usage: npm run voiceover -- --project <video-name> "Text to speak" | --file script.txt [--voice id] [--model id] [--name voiceover]');
  process.exit(1);
}

const client = new ElevenLabsClient(); // reads ELEVENLABS_API_KEY
const result = await client.textToSpeech.convertWithTimestamps(values.voice, {
  text,
  modelId: values.model,
  outputFormat: "mp3_44100_128",
});

const words = wordsFromAlignment(result.alignment);
const assets = join(values.project, "assets");
const audioPath = join(assets, `${values.name}.mp3`);
const transcriptPath = join(assets, `${values.name}.transcript.json`);

await mkdir(assets, { recursive: true });
await writeFile(audioPath, Buffer.from(result.audioBase64, "base64"));
await writeFile(transcriptPath, JSON.stringify(words, null, 2) + "\n");

const duration = words.at(-1)?.end ?? 0;
console.log(`voice    ${audioPath} (${duration.toFixed(2)} s, ${words.length} words)`);
console.log(`captions ${transcriptPath}`);
