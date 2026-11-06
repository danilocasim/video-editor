# AI video authoring workspace

This repository is a prompt-to-video workspace for coding agents. The agent writes real HTML/GSAP compositions using the checked-in skills, previews them, and renders them with HyperFrames. The npm scripts alone do not call an LLM.

## Read the repository skills

Use the files under `.agents/skills/` in this checkout, not a same-named global skill. Read the relevant `SKILL.md` before authoring and follow its linked references on demand. If your client has no skill command, open the file directly; `/hyperframes` in upstream prose means the corresponding local skill, not a required slash-command API.

| Task | Read first |
| --- | --- |
| Any video, animation, or composition | `.agents/skills/hyperframes/SKILL.md` |
| Narrated app demo, promo, launch | `.agents/skills/app-showcase/SKILL.md` and the HyperFrames skill |
| Preview, check, snapshots, rendering | `.agents/skills/hyperframes-cli/SKILL.md` |
| Reusable effects, transitions, charts | `.agents/skills/hyperframes-registry/SKILL.md` |
| Images, fonts, audio, media processing | `.agents/skills/media-use/SKILL.md` |
| Supplied Figma design | `.agents/skills/figma/SKILL.md` |
| Live presentation | `.agents/skills/slideshow/SKILL.md` |
| Existing Remotion source | `.agents/skills/remotion-to-hyperframes/SKILL.md` |

Use only tools actually available in your agent. Browser, Figma, media providers, and coding-agent integrations are not installed by these Markdown skills. Do not claim a capture, visual review, listening check, or API call that you did not perform.

## Project layout and commands

Work from the repository root. Choose a lowercase hyphenated video name, such as `product-demo`.

```sh
npm run new -- product-demo
npm run dev -- product-demo
npm run check -- product-demo --json
npm run render -- product-demo --quality draft
```

`new` creates `videos/` and a complete `videos/product-demo/` project, and refuses an existing folder. If it exists, inspect and edit that project instead. Do not create a shared `video/` directory.

Everything for a film stays inside `videos/<name>/`: `BRIEF.md`, `HOOKS.md`, `STORYLINES.md`, `SPEC.md`, `REVIEW.md`, `script/`, `compositions/`, `assets/`, project-specific tools, and `renders/`. Every generated/downloaded artifact, snapshot, and log belongs there too. The whole directory is gitignored; it needs a separate backup.

The root wrappers pin HyperFrames **0.8.201** and prevent automatic skill installation. Use them instead of unversioned CLI commands. For an upstream command without a wrapper, run `npx --yes hyperframes@0.8.201 <command>` from `videos/<name>/`; for capture use an explicit output under `videos/`. Do not upgrade the CLI, refresh bundled skills, install dependencies, or alter agent configuration without permission. Repository paths and commands in this file take precedence over upstream examples using a different project layout or latest CLI.

## Authoring loop

1. Read the request and the matching skills. Establish content, duration, aspect, real assets, and audio requirements. Ask only for missing facts the repository and provided inputs cannot supply.
2. Create the named project if missing. For a narrative film, write its brief, hooks, storylines, and specification inside that folder before building; get a storyline choice unless the user authorized autonomous decisions.
3. Replace the native static `Title` starter with the requested finished content. Write actual scene markup, styling, deterministic paused timelines, and local assets. A starter render is not the requested film.
4. Use authentic product screenshots/recordings for product claims. Do not invent interfaces, numbers, customer data, or media. If essential assets are unavailable, request them rather than delivering placeholders.
5. Follow the HyperFrames composition contract: root `data-duration`; stable timed clip IDs; one paused timeline per composition; local asset paths; no timers or unseeded randomness. Keep it editable.
6. Run the check, inspect snapshots at representative scene/transition times, and fix errors. Use only visual-review tools your client actually provides. Record findings and limitations in the project's `REVIEW.md`.
7. Open the preview for review. Render when the user approves, explicitly asks for the MP4, or authorizes an uninterrupted delivery workflow. Verify the file with ffprobe and inspect decoded frames. Report the real output path and checks.

`npm run generate -- <name>` only initializes if missing and renders the current HTML. It is not a substitute for step 3 and does not invoke AI by itself.

## Optional audio

Audio generation is opt-in. No narration, captions, paid media, or new aspect ratio unless requested. The agent needs its own configured model account; local HyperFrames rendering needs no ElevenLabs key.

```sh
npm run voices -- --search narrator
npm run vo:scenes -- --project product-demo
npm run voiceover -- --project product-demo "Narration text"
npm run sound -- --project product-demo music "Instrumental pulse" --seconds 30
npm run sound -- --project product-demo sfx "Soft click" --name click --seconds 0.5
```

The tools load an optional `.env.local` and/or exported `ELEVENLABS_API_KEY`. Never open, print, copy, or commit credentials. If authorization fails, ask the user to configure their own account; do not run onboarding or inspect authentication state for them. Confirm before paid calls not already requested.

`vo:scenes` writes takes, word timings, `timeline.json`, `captions.json`, `audio.html`, and `retime.plan.json` under the selected project's `assets/vo/`. It does not build scene hosts, insert audio, or draw captions; implement and synchronize those in the composition using the app-showcase references.

The public skill snapshot intentionally omits the upstream Pixabay MP3 bank. Do not assume offline bundled SFX exists. Use cleared user assets, the documented Openverse search with required attribution, or the explicitly authorized ElevenLabs sound command. A failed/missing audio request is not a silent replacement for requested audio.

## Repository changes and publishing

- Preserve unrelated work and existing videos; never overwrite or delete a project to recreate it.
- Do not commit, push, deploy, publish media, or make paid calls without user authorization.
- Keep generated projects, credentials, personal agent settings, sessions, and caches out of Git.
- Keep the public skills, relative Claude links, source notices, and licenses in Git. Review skill changes as executable guidance; helper scripts can run commands and contact providers.
- For tooling changes, run `npm test` and exercise the affected workflow in a temporary project. Do not make paid API calls in tests.
