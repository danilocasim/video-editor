# Syncing the picture to the voice

`npm run vo:scenes -- --project my-video` turns the scene scripts into a timeline. Substitute the chosen video name consistently. The film is built on that timeline: one HyperFrames scene per script scene, and every move inside a scene timed to one of that scene's words.

## What the generator writes (`videos/my-video/assets/vo/`)

| File | Holds |
| --- | --- |
| `timeline.json` | `total` (the root `data-duration`), `speechEnd`, and per scene: `start`/`end`/`duration` of the voice, `window` (the scene host's `start` and `duration`) and `words` with absolute times |
| `captions.json` | Every word, absolute: `[{ "id": "w0", "text": "Exam's", "start": 0.31, "end": 0.58 }, …]` |
| `audio.html` | One `<audio id="vo-<scene>">` per voiced scene, plus `<audio id="bgm">` with a duck lane, ready to paste into the root |
| `retime.plan.json` | `hyperframes timeline apply` edits that move and trim `#scene-<id>` and `#vo-<id>` to the timeline |
| `<scene>.mp3`, `<scene>.json` | The take and its scene-local words; the cache for re-rolls |

The scene windows tile the film with no gaps. Each one cuts `preroll` (0.15 s) before its scene's first word, so the picture leads the voice. The first window starts at 0, and the last one holds `endHold` (2.5 s) past the final word.

## The root composition

```html
<div id="root" data-composition-id="main" data-start="0" data-duration="<timeline.total>" data-width="1920" data-height="1080">
  <!-- one host per scene; id = composition id = timeline key = "scene-" + the script file's name -->
  <div id="scene-01-hook" data-composition-id="scene-01-hook" data-composition-src="compositions/01-hook.html"
       data-start="<window.start>" data-duration="<window.duration>" data-track-index="1" data-track-kind="graphics"
       data-width="1920" data-height="1080"></div>
  …
  <!-- one host holding every caption group -->
  <div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html"
       data-start="0" data-duration="<timeline.total>" data-track-index="10" data-track-kind="captions"
       data-width="1920" data-height="1080"></div>
  <!-- paste assets/vo/audio.html here: the vo-* clips and the ducked bgm -->
</div>
```

- Name scene hosts `scene-<file name>` so `retime.plan.json` can find them, and keep that id on the host, the scene root and the `window.__timelines` key (a mismatch makes renders wait 45 s per scene).
- Scenes are cut by their windows. A transition that overlaps two scenes goes on a short overlay host, never on a gap between windows.

## Anchoring moves to words

A scene's clock starts at its window start, so a move inside a scene is timed at `word.start - window.start`. This command prints a scene's words in scene-local time:

```bash
jq -r --arg id 04-proof-review '.scenes[] | select(.id == $id) | .window.start as $w
  | .words[] | "\(((.start - $w) * 100 | round) / 100)\t\(.text)"' videos/my-video/assets/vo/timeline.json
```

Write each anchor into `videos/my-video/SPEC.md`'s SHOTS line, then time the scene's tweens to it:

```js
// 04-proof-review: "Every question you miss comes back. Tap review, and it's first in line."
const A = { miss: 0.62, back: 1.24, tap: 1.71, first: 2.58 }; // from the jq output above
tl.fromTo("#p4-missed", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power3.out" }, A.miss - 0.05);
tl.fromTo("#p4-queue", { x: 0 }, { x: -220, duration: 0.5, ease: "power2.inOut" }, A.back - 0.05);
tl.fromTo("#p4-cursor", { x: 900, y: 700 }, { x: 612, y: 418, duration: 0.45, ease: "power2.out" }, A.tap - 0.45);
tl.fromTo("#p4-review-btn", { scale: 1 }, { scale: 0.94, duration: 0.08, yoyo: true, repeat: 1 }, A.tap);
tl.fromTo("#p4-first", { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.6)" }, A.first - 0.03);
```

The timing rules:

- **The picture lands 1–2 frames (0.03–0.07 s) before its word.** Light before sound reads as one event; a picture after its word feels late.
- **A click lands on the verb** ("Tap"). The cursor arrives during the words before it and stops; the press, the click sound and the UI response share one frame.
- **A result appears on its noun** ("…first in line"): the object moves when it is named.
- **Titles land on their anchor word and then hold still** while they are read.
- **One hero move per anchor.** Secondary moves follow 0.1–0.2 s later and travel less far.
- **Leave no gap of more than 3 s without a new picture.** When the voice runs long over one shot, add a beat on a word in the middle: a punch-in to the control being named, a row changing, a counter ticking (`retention-checklist.md`).
- **Payoff scenes (`# silent:`) have no words.** Time their moves to the music instead: from `videos/my-video/`, run `npx --yes hyperframes@0.8.201 beats --json`, then land the hero moment on the strong beat nearest the window start + 0.3 s.
- **The end card's call to action lands with the last spoken word** and holds until `total`.

Because anchors are scene-local, re-rolling one scene moves its window but leaves every other scene's anchors correct. Only the re-rolled scene's `A` table changes.

## Captions

Build caption groups from `captions.json` following `/hyperframes` `references/captions.md`: 3–5 words per group, one group visible at a time, groups breaking at sentence ends and at pauses of 150 ms or more, and a hard kill at each group's end. For a showcase:

- **Keep captions off the hero UI.** Landscape: 90–120 px from the bottom. Vertical: about 640 px from the bottom, inside the title-safe box. When the product fills that band, move the shot, not the captions.
- **Highlight the active word** in the accent colour as it is spoken (time it to each word's `start`). It's optional, and only if the accent isn't already used in that shot.
- Captions are on by default for vertical and social cuts, and optional for a landing-page hero that plays with sound. Say which in the brief's assumption line.
- Caption times are absolute. After a re-roll, rebuild the groups from the re-rolled scene to the end.

## Sound

- **Voice:** the `vo-*` clips from `audio.html`, in the `voiceover` audio group, at volume 1.
- **Bed:** `npm run sound -- --project my-video music "<prompt>"` from the repository root writes `videos/my-video/assets/audio/bgm.mp3`, as long as the film plus 3 s (capped at 120 s). Its `data-automation` lane in `audio.html` holds it at 0.5 under silence, ducks it to 0.14 under speech, and lifts it into silent payoffs. Write the prompt as feel, tempo and the one change: "confident minimal electronic pulse, 110 bpm, holds back, then opens bright at the halfway point". Don't describe the app's subject.
- **Effects:** follow `/hyperframes` `references/sound.md` §4. A click goes on each real cursor click, and a whoosh only on large moves or cuts. Use two or three takes of any repeated sound (`--name click-1`, `click-2`), place each file's peak one frame after its picture, and give each `<audio>` an `id` and `data-audio-group="sfx"`.
- **Check the mix** from the project folder with `npx --yes hyperframes@0.8.201 audio <render-path> --json`: the voice present, peaks at −1 dBTP or lower, and the mix around −16 to −14 LUFS.

## Re-rolling after a change

1. From the repository root, run `npm run vo:scenes -- --project my-video`. It re-records only the changed scenes and prints the new `total`.
2. If `total` grew, raise the root's `data-duration` to it first. `apply` refuses any clip that would end past the root, and no timeline command changes the root.
3. From `videos/my-video/`, preview the plan with `npx --yes hyperframes@0.8.201 timeline apply assets/vo/retime.plan.json --plan --json`, read it, then run it again without `--plan`.
4. Set the root's `data-duration` to `total`. Update the `bgm` clip's `data-duration`, and paste the new duck lane from `audio.html`.
5. From the repository root, run `npm run vo:scenes -- --project my-video` again. It should report `0 edits`, which confirms every host and voice clip is on the timeline.
6. Re-anchor the re-rolled scene's moves, and rebuild the captions from that scene onward.

The plan never lets two clips overlap mid-way: it shrinks each changing clip, moves it, then grows it. So it applies cleanly whichever way the scenes shift. If the person moved clips by hand in Studio, the plan moves them back; say so before applying it.
