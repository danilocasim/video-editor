# Script

The narration is the clock of the film. Write it per scene, to a word budget, in words that name what the viewer is looking at the moment they hear them.

## Length

Pick the length from the story, then hold the script to that length's budget. If the script runs over, cut words; never speed up the voice to make it fit.

| Length | Use when | Proof verbs | Spoken words |
| --- | --- | --- | --- |
| **30 s** | One feature, one task, one obvious result | 3 | 55–65 |
| **45 s** | One full flow (start → result) or a feature that needs one setup step | 4 | 85–95 |
| **60 s** | A flow with a wow moment plus a second proof, or onboarding → result | 5–6 | 110–125 |

These budgets assume about 2.5 spoken words a second, with the default 0.4 s pause between scenes, a silent payoff and a 2.5 s end-card hold. Going past 60 s means the film is about two things. Make two films.

## Scenes and beats

Each beat is one scene file in `videos/my-video/script/` (substitute the chosen video name), named `NN-beat.txt`. The scene files sort into play order. Times are approximate; the takes set the real ones.

| Beat | 30 s | 45 s | 60 s | Words | Job |
| --- | --- | --- | --- | --- | --- |
| `01-hook` | 0–3 | 0–3.5 | 0–4 | ≤ 10 | The hook (`hooks.md`) |
| `02-pain` | 3–7 | 3.5–8 | 4–10 | 8–15 | The old way fails on screen |
| `03-reveal` | 7–9 | 8–11 | 10–14 | 4–8 | The app named, already working |
| `04-proof-<verb>` … | 9–21 | 11–30 | 14–40 | 8–12 each | One verb each: *pick, answer, review, track* |
| `0N-payoff` | 21–25 | 30–37 | 40–49 | 0–6 | The result, biggest moment; often `# silent: 3` |
| `0N-claim` | — | 37–41 | 49–54 | ≤ 10 | The one thing to remember (folded into the end in a 30 s film) |
| `0N-end` | 25–30 | 41–45 | 54–60 | ≤ 10 | Name and call to action; held 2.5 s |

In a 60 s film, open one proof scene with a re-hook line (`hooks.md`).

A scene file looks like this:

```text
# 04-proof-review: the missed question comes back; cursor taps "Review missed"
# after: 0.6
Every question you miss comes back. Tap review, and it's first in line.
```

- Lines starting with `#` are never spoken. `# after: <s>` sets the pause after this line (default 0.4 s; use 0.6–1.0 s before a big reveal). `# silent: <s>` makes a scene with no voice that lasts that long, used for a payoff that plays under the music swell.
- The first comment line says what is on screen. The person reviewing the script reads it next to the words.

## Writing the lines

- **Say what the viewer sees, while they see it.** "Tap review" plays while the cursor taps Review. A word that names an action is that action's anchor (`sync.md`).
- **One idea per sentence, at most 12 words.** Use contractions, second person and present tense. Read it aloud; if you run out of breath, split it.
- **The screen never repeats the voice word for word.** On-screen titles carry the label or number; the voice carries the meaning. Captions are the exception: they are the voice, for people watching muted.
- **Write causes, not lists.** "…so it knows your weak spots, which means…" Never "Feature one. Feature two."
- **Use only real claims.** Every number comes from the app, its site or the person. Mark illustrative data as illustrative on screen.
- **Banned:** "Introducing" or "Meet" as the first word, "Hey guys", "In this video", "unlock", "seamless", "supercharge", "game-changer", "revolutionize", "effortless", and "in seconds" unless it was measured.
- **End on the call to action as an action**, using the person's real CTA: "Download it on the App Store", "Try it at <domain>", not "Check us out".

## Delivery with Eleven v4

- `eleven_v4` (the default) supports `stability` and `similarity_boost` only. It has no `speed` setting and no SSML, so control pace with word count and punctuation:
  - a comma is a short breath;
  - an em dash or "…" is a beat;
  - a full stop is a pause;
  - a question mark lifts the line.
- Audio tags such as `[excited]`, `[curious]`, `[whispers]` and `[laughs]` direct one line. Use at most two in a film, on the hook or the payoff, never on every line. They are never spoken, and the timing tools drop them from the captions.
- Write numbers the way they should be said when it matters: "eighty-nine percent", "twenty minutes a day".
- When a scene must be faster, or a word keeps coming out wrong, try `--model eleven_multilingual_v2` for that pass. It supports more voice settings, and its takes are the most stable over long text.

## Pronunciation audit

Run this before every `npm run vo:scenes -- --project my-video`. Search the scene files for the words below and fix them in the script, not in a pronunciation dictionary. Record project-specific decisions in `videos/my-video/script/PRONUNCIATION.md` (it is not a `.txt` file, so it is never spoken).

| Write | Instead of | Why |
| --- | --- | --- |
| "available", "out now" | "live" (adjective) | It's read as "liv" |
| "primary", "main" | "lead" (adjective) | It's read as the metal |
| "capture", "save" | "record" (verb) | The stress flips |
| "show" | "present" (verb) | The stress flips |
| "tiny" | "minute" (adjective) | It's read as the time unit |
| "A W S", "S A A C zero three" | AWS, SAA-C03 | Spell initialisms out with spaces |
| "A P I", "C L I", "eye O S", "S Q L" or "sequel" | API, CLI, iOS, SQL | Say it the way the brand says it |
| "okay" | OK | It's read inconsistently |
| AI | — | Keep it; it's read correctly |
| the domain as said aloud ("your app dot com") | a URL with slashes | It's read character by character |

A word that is a true initialism (each letter said) gets spaces. A word that is an English word ("fix", "run") stays a word. A vowel-stripped abbreviation ("cfg") is written out in full.

## After generating

`npm run vo:scenes -- --project my-video` prints every scene's voice window. For each scene, check:

- **Words per second:** 2.2–2.9. Below 2.2 drags; over 3.0 feels rushed. Fix it by cutting words, not by re-rolling.
- **The total:** within the chosen length ±10%.
- **The take:** listen to any scene the person flags (or check its duration against its neighbours). Re-roll only that scene with `--only <id>`; each re-roll is a new take, and stitching keeps it in tone with its neighbours.
