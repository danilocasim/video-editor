// Voices this ElevenLabs account can use, to pick a narrator for npm run vo:scenes -- --voice <id>.
//
//   npm run voices
//   npm run voices -- --search "warm narrator"
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { parseArgs } from "node:util";

const { values } = parseArgs({ options: { search: { type: "string" } } });

const client = new ElevenLabsClient(); // reads ELEVENLABS_API_KEY
const { voices } = await client.voices.search({ search: values.search, pageSize: 50 });

for (const v of voices) {
  const labels = Object.values(v.labels ?? {}).join(", ");
  console.log(`${v.voiceId}  ${(v.name ?? "").padEnd(28)} ${labels}`);
}
