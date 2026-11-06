// Converts ElevenLabs timing data into the word list HyperFrames captions use:
// [{ id: "w0", text: "Hello", start: 0.0, end: 0.5 }, …]

const round = (s) => Math.round(s * 1000) / 1000;

// TTS returns one timing per character; a word runs from its first to its last non-space character.
// Audio tags such as [excited] direct the delivery and are never spoken, so they never become words.
export function wordsFromAlignment({ characters, characterStartTimesSeconds, characterEndTimesSeconds }) {
  const words = [];
  let current = null;
  let inTag = false;
  characters.forEach((ch, i) => {
    if (ch === "[") inTag = true;
    const skip = inTag || /\s/.test(ch);
    if (ch === "]") inTag = false;
    if (skip) {
      current = null;
      return;
    }
    if (!current) {
      current = { text: "", start: characterStartTimesSeconds[i], end: characterEndTimesSeconds[i] };
      words.push(current);
    }
    current.text += ch;
    current.end = characterEndTimesSeconds[i];
  });
  return words.map((w, i) => ({ id: `w${i}`, text: w.text, start: round(w.start), end: round(w.end) }));
}

// Scribe returns words, spacing and audio events; captions only want the spoken words.
export function wordsFromScribe(words) {
  return words
    .filter((w) => w.type === "word" && w.start != null && w.end != null)
    .map((w, i) => ({ id: `w${i}`, text: w.text.trim(), start: round(w.start), end: round(w.end) }));
}
