# Retention checklist

Go through every line before showing the preview. Use the chosen project under `videos/<name>/`; the raw CLI examples below run from that folder. Each line is measured, not judged by feel. Fix every failure, then report which checks could only be estimated.

## Opening

- [ ] **Frame 0 is the thumbnail.** The real app is visible, the headline (6 words or fewer) is readable, it isn't black, and it isn't a logo alone. Check with `npx --yes hyperframes@0.8.201 snapshot --at 0`.
- [ ] **The first word starts by 0.4 s,** and the hook line ends by 3.0 s (from `timeline.json`).
- [ ] **Motion begins on frame 0.** Nothing fades in from an empty frame.
- [ ] **The hook's promise is kept.** Name the shot in the payoff scene that answers it.

## Flow

- [ ] **Something new every 3 s or less.** List every hero move's time across the film; no gap is longer than 3 s, except the end-card hold.
- [ ] **No static foreground for more than 4 s.** Ambient drift, grain and glow pulses don't count as change.
- [ ] **Every spoken claim has its picture.** For each anchor word, the matching visual lands within 0.07 s before it (`--at` snapshots on the anchor times).
- [ ] **Words per second** in every voiced scene is 2.2–2.9.
- [ ] **The reveal lands at 20–30%** of `total`, the payoff at 60–80%, and the payoff plays at normal speed.
- [ ] **A re-hook every 8–12 s** in films over 30 s (`hooks.md`).
- [ ] **One spine object** (the hook's question, file or number) appears in every beat until the payoff.
- [ ] **No dead air** over 0.8 s between voiced scenes, except before a reveal or a silent payoff.

## Picture

- [ ] **It's real UI only;** missing essential screens have been obtained before delivery, not replaced by invented UI or placeholders.
- [ ] **The hero fills at least 40% of the frame** in every shot. UI text is 26 px or more after punch-ins.
- [ ] **Nothing from `/hyperframes` `spec.md` "BANNED by default"** made it in. Name any that did and fix them.
- [ ] **Captions:** 3–5 words a group, one group at a time, never over the hero UI, inside title-safe.

## Sound

- [ ] **The voice clips sit exactly on their windows.** `npx --yes hyperframes@0.8.201 timeline --json` shows `vo-*` at the `timeline.json` times.
- [ ] **The bed ducks under every line** and lifts into silent payoffs; its lane matches the current `audio.html`.
- [ ] **Every effect has a cause on screen** and peaks one frame after its picture. No identical whoosh repeats.
- [ ] **The render measures right.** `npx --yes hyperframes@0.8.201 audio <render-path> --json` shows the voice present, peaks at −1 dBTP or lower, and the mix at −16 to −14 LUFS.

## Ending

- [ ] **The call to action lands with the last spoken word** and holds at least 2 s, with every animation finished 0.3 s before the hold.
- [ ] **The last frame passes the topic test:** a stranger seeing only it could name the app and what it does.
- [ ] **Vertical only:** the last frame flows back into frame 0 when the video loops.

## The two blind tests

- [ ] **Muted:** watch the snapshots in order with no sound. The captions and titles still tell the story.
- [ ] **Audio only:** read the script with no pictures. It still makes sense and never says "as you can see" without saying what.
