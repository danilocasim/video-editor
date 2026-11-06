---
name: app-showcase
description: Create a narrated app showcase, product demo, feature launch, or promo with HyperFrames and optional ElevenLabs audio. Use real app screens, a scene-by-scene script, word-synced animation, captions, a ducked music bed, and an end card in a private videos/<name>/ project.
license: MIT
---

# App showcase: HyperFrames + ElevenLabs

A showcase sells one app through one viewer doing one real task. Use real product screens, a clear hook, and one observable result; never a feature list with invented UI. Normally 30–60 seconds, decided by the story, not padded.

## When to load

Use for narrated app demos, launch films, product promos, and explicit requests to sync speech to HyperFrames scenes.

## When NOT to load

For silent typography, charts, or a general animation, use the sibling `hyperframes` skill instead. Do not add narration or paid audio to a request that did not ask for it.

## Read first

Read `../hyperframes/SKILL.md`, `../hyperframes/references/types/launch.md`, and `../hyperframes/references/story.md`. Their composition and story contracts apply. Skill slash names in those references are aliases for local sibling skill files; use your agent's actual tools rather than assuming a particular client API.

## Project and commands

Run from the repository root. In the examples, the video name is `my-video`; substitute the chosen name consistently. Create it once with `npm run new -- my-video`. All film-specific files, including briefs, storylines, specifications, review notes, captured UI, scripts, and renders, stay in **`videos/my-video/`**. Never create a shared `video/` folder or write film planning documents in the repository root.

| Path under `videos/my-video/` | Purpose |
| --- | --- |
| `index.html`, `compositions/`, `assets/` | Editable HyperFrames source and media |
| `BRIEF.md`, `HOOKS.md`, `STORYLINES.md`, `SPEC.md`, `REVIEW.md` | Planning decisions and verification |
| `script/NN-name.txt` | One narration file per scene, with optional `# after:` or `# silent:` directives |
| `assets/vo/` | Takes, timeline, word timings, audio tags, retiming plan |
| `assets/audio/` | Music bed and effects |

| Command from repository root | Purpose |
| --- | --- |
| `npm run voices -- --search narrator` | List voices available to the configured account |
| `npm run vo:scenes -- --project my-video` | Generate missing/changed takes and rebuild timing metadata |
| `npm run vo:scenes -- --project my-video --only 04-proof` | Force one scene to regenerate; other missing/changed scenes still generate |
| `npm run sound -- --project my-video music "Instrumental pulse"` | Generate a music bed |
| `npm run sound -- --project my-video sfx "Soft click" --name click --seconds 0.5` | Generate an effect |
| `npm run dev -- my-video` | Preview |
| `npm run check -- my-video --json` | Check |
| `npm run render -- my-video --quality draft` | Render when approved or requested |

For additional CLI operations, use `npx --yes hyperframes@0.8.201 <command>` from `videos/my-video/`. Do not upgrade the pin or refresh checked-in skills as part of authoring.

The audio commands use an exported `ELEVENLABS_API_KEY` or optional `.env.local`. Never open or print the key. If the account is unconfigured or unauthorized, tell the user what prerequisite is missing; do not inspect credentials or run onboarding. Audio calls may spend credits and require authorization.

## Workflow

1. **Brief.** Write `BRIEF.md`: app, one viewer, one task, real proof, CTA, length, aspect, and requested audio/captions. Ask once for missing real screens, CTA, or destination. Use `references/script.md` to choose the word budget.
2. **Hook.** Write `HOOKS.md`: five materially different hooks from `references/hooks.md`, score them, retain the best two. Each has a spoken line, frame-zero picture, and promised payoff.
3. **Storylines.** Write three different films in `STORYLINES.md` using the HyperFrames story guide. Recommend one and wait for a choice unless autonomous decisions were authorized.
4. **Script.** Write one file per beat in `script/`. Apply `references/script.md`, including pronunciation and pacing checks. Generate takes with `npm run vo:scenes -- --project my-video` only when narration is requested and configured. Choose a voice with the user when it matters; don't spend credits comparing voices without permission.
5. **Real UI.** Gather the specific screens each beat proves, using `references/capture.md`. If required screens are unavailable, ask for them rather than delivering placeholders or invented UI.
6. **Spec.** Write `SPEC.md` from the actual `assets/vo/timeline.json`: scene windows, anchor words and times, framing, and one hero move per anchor. Follow the HyperFrames spec guide.
7. **Build.** Follow `references/sync.md`. Author the root's scene hosts, voice clips, caption host, ducked bed, and the scene-local timelines. The timing scripts do not create these for you.
8. **Sound.** If requested, generate the bed from the chosen storyline and add effects only to visible causes. The public repository does not redistribute the upstream offline Pixabay sound bank; use cleared assets or an authorized provider.
9. **QA.** Run the named-project check, inspect scene/transition snapshots, and apply `references/retention-checklist.md`. Write actual findings in `REVIEW.md`. Audio metrics are measurements, not proof you listened.
10. **Preview and deliver.** Show the preview first. Render only after approval or an explicit request for the file/uninterrupted delivery. Inspect the output and report its path under `renders/`.

## Editing after the first cut

- **A line changes:** edit its text and run the named `vo:scenes` command. Follow `references/sync.md` to update the root duration, apply the plan, re-anchor that scene, and regenerate affected caption groups.
- **A voice changes:** `npm run vo:scenes -- --project my-video --voice <voice-id>` regenerates all voiced scenes. Re-synchronize the whole composition.
- **Pacing is slow:** cut words rather than speeding speech or hiding pauses below 0.25 seconds.
- **The user edited the preview:** read the current timeline and preserve their changes. Explain before applying a retiming plan that would move clips they placed by hand.

## References

| Need | Read |
| --- | --- |
| Hooks and re-hooks | `references/hooks.md` |
| Narration length, beats, pronunciation | `references/script.md` |
| Real UI capture and framing | `references/capture.md` |
| Word anchors, captions, sound, retiming | `references/sync.md` |
| Pre-delivery review | `references/retention-checklist.md` |

## Minimal example

After the user supplies app screens, requests narration, and configures their account: create `my-video`, write the brief/story/script inside it, run `npm run vo:scenes -- --project my-video`, author and synchronize the actual scenes, inspect snapshots, preview, then render the approved film. A native `Title` starter or a timing JSON file alone is not the deliverable.
