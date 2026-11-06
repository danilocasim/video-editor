# AI Video Workspace

Generate editable videos by describing them to **OMP, Claude Code, Codex, or another coding agent**. This repository includes the agent skills, project instructions, and HyperFrames rendering tools—not just an MP4 renderer.

The agent plans the video, writes the HTML/GSAP scenes, gathers approved assets, checks the composition, previews it, and renders the result. Optional ElevenLabs tools add narration, word-synced captions, music, and sound effects.

All work for a video stays in **`videos/<video-name>/`**, including its MP4, source, assets, script, and planning files. That entire folder is gitignored. Your videos and credentials are not part of the public repository.

## Quick start: prompt → video

### 1. Install the prerequisites

- **Node.js 22.9+**, with npm and npx on your PATH.
- **FFmpeg and ffprobe** on your PATH: `brew install ffmpeg` on macOS or `sudo apt-get install ffmpeg` on Ubuntu.
- **Chrome/Chromium**; HyperFrames can provision a compatible browser with `npx --yes hyperframes@0.8.201 browser ensure`.
- **One coding agent**, installed and authenticated with your own model account: [OMP](https://github.com/can1357/oh-my-pi), [Claude Code](https://code.claude.com/docs/en/setup), or [Codex](https://developers.openai.com/codex/cli/).
- macOS or Linux. On Windows, use WSL2 and install everything inside WSL so Git's relative skill symlinks work normally.

The coding agent needs its own subscription, API credentials, or configured local model. **Local HyperFrames rendering does not require an ElevenLabs key or a hosted rendering account.** Optional media providers have separate setup, permissions, and costs. Internet access is needed for the first CLI download and the starter's pinned GSAP CDN script; vendor remote assets for offline rendering.

### 2. Clone and install

```sh
git clone https://github.com/danilocasim/video-editor.git
cd video-editor
npm ci
```

The skills are already checked in. No global skill installer, personal configuration, API token, or private plugin is required to load them.

### 3. Start your agent in this repository

Run **one** of these from the repository root:

```sh
omp
# or
claude
# or
codex
```

### 4. Give it this first prompt

```text
Read AGENTS.md and .agents/skills/hyperframes/SKILL.md from this checkout.

Create a finished 10-second 1920x1080, 30fps kinetic-typography video named
hello-ai. The message is "An idea. A prompt. A video." Use three distinct
animated beats and a final "Made with AI" end card. Choose a coherent palette
and readable typography. No narration, music, external images, or paid tools.

Create the project with npm run new -- hello-ai if it does not exist.
Author the actual composition; do not leave or render the static Title starter.
Keep all planning files, source, assets, checks, and renders in videos/hello-ai/.
Run the composition check, inspect representative snapshots, open the preview,
and render the finished MP4. I am requesting the file, so continue through
rendering without waiting for a separate preview approval. Report the output
path and the checks you actually performed.
```

Approve the necessary local file and command operations through your agent's normal permission prompts. The result belongs under `videos/hello-ai/renders/`; editable source remains alongside it. Rendering alone does not author the video—the coding agent performs that step using the bundled skills.

## Using your preferred agent

| Agent | Project instructions | Skill discovery and invocation |
| --- | --- | --- |
| **OMP** | Root `AGENTS.md` | Discovers project `.agents/skills/` and `.claude/skills/`; inspect with `omp skill list --json`. Use `/skill:<discovered-name>`, or ask it to read the repository skill path. |
| **Claude Code** | Root `CLAUDE.md` imports `AGENTS.md` | `.claude/skills/<name>` links to the shared pack. Use `/hyperframes` or `/app-showcase`, or the path-based prompt above. |
| **Codex** | Root `AGENTS.md` | Reads `.agents/skills/`. Use `/skills` to inspect the catalog and `$hyperframes` or `$app-showcase` to select a skill, or use the path-based prompt above. |
| **Other coding agents** | Ask the agent to read `AGENTS.md` | Point it to `.agents/skills/<name>/SKILL.md` and its linked references. Automatic discovery depends on the client. It must be able to edit files and run the local commands. |

Use an up-to-date agent release that supports project skills. Restart the agent after cloning or changing skill metadata. If a same-named global/plugin skill wins discovery, **use the files in this checkout**; OMP may expose the repository copy under a name such as `claude/hyperframes`. The physical paths in the first prompt avoid that ambiguity.

These are portable instructions and helper scripts, not a shared account or a hosted AI service. They do not install missing browser/Figma/MCP tools, configure your model, or bypass tool approvals. If your agent cannot inspect images, connect an appropriate visual-review tool or review the preview yourself; it should report that limitation rather than claim a visual check.

Discovery references: [OMP skills](https://github.com/can1357/oh-my-pi/blob/main/docs/skills.md), [Claude skills](https://code.claude.com/docs/en/skills), [Codex skills](https://developers.openai.com/codex/skills/), and [Codex project instructions](https://developers.openai.com/codex/guides/agents-md/).

## Included skills

The canonical packs are in [`.agents/skills/`](.agents/skills/). Claude's copies are **relative symlinks**, not duplicated source. OMP and Codex can use the same canonical files.

| Skill | Use it for |
| --- | --- |
| [`hyperframes`](.agents/skills/hyperframes/SKILL.md) | Story, scene composition, deterministic animation, typography, captions, and review |
| [`app-showcase`](.agents/skills/app-showcase/SKILL.md) | Narrated product demos with real UI, hooks, scene scripts, word-synced motion, captions, and a ducked music bed |
| [`hyperframes-cli`](.agents/skills/hyperframes-cli/SKILL.md) | Preview, checks, snapshots, timeline operations, rendering, and troubleshooting |
| [`hyperframes-registry`](.agents/skills/hyperframes-registry/SKILL.md) | Reusable effects, transitions, charts, and visual components |
| [`media-use`](.agents/skills/media-use/SKILL.md) | Media sourcing, audio, fonts, cutouts, grades, and provider setup |
| [`figma`](.agents/skills/figma/SKILL.md) | Supplied Figma designs; requires the relevant external integration |
| [`slideshow`](.agents/skills/slideshow/SKILL.md) | Live HTML decks and presenter workflows |
| [`remotion-to-hyperframes`](.agents/skills/remotion-to-hyperframes/SKILL.md) | Migrating an existing Remotion video |

The packs include their reference guides, examples, and helper scripts. Read only the references needed for the task. Review a helper before running it: some need additional software or contact external media services.

The upstream **Pixabay MP3 bank is not redistributed** as a reusable raw audio library. Its metadata and credits remain for provenance; a clean clone has no promised offline sound bank. Use your own cleared assets, documented Openverse retrieval with any required attribution, or explicitly authorized ElevenLabs generation. Bundled code-editorial fonts retain their accompanying OFL licenses. See [third-party notices](THIRD_PARTY_NOTICES.md).

### Example: narrated app showcase

First provide real screenshots/recordings or an accessible product URL, configure optional audio below, and ensure you are willing to spend the provider's credits. Then ask:

```text
Read .agents/skills/app-showcase/SKILL.md and its HyperFrames prerequisites.
Create a 30–45 second narrated showcase named product-demo for the app and
screens I supplied. Show one real user task from problem to result. Use my
provided CTA and brand assets; ask if essential information or screens are
missing. Keep every file in videos/product-demo/.

Write the brief, hooks, three storyline options, scene script, and timing spec.
Let me choose the storyline before generating paid audio. After that, sync the
real UI, captions, music ducking, and effects to the generated word timings.
Check it and show me the preview; wait for my approval before the final render.
```

For a revision, name the existing project and describe the change: “Edit `videos/product-demo/`: shorten the opening, keep the current voice, preserve my timeline edits, and show the updated preview.” Do not recreate an existing project to make edits.

## How generation works

1. **Prompt the agent.** It selects the relevant local skill and clarifies only missing requirements.
2. **Create the named project.** `npm run new -- <name>` automatically creates `videos/` and the project folder.
3. **Author the film.** The agent writes the requested content, scenes, styling, animation, and approved media—not just a starter file. Narrative work includes a brief, storylines, script, and specification.
4. **Check and inspect.** The agent runs HyperFrames checks, reviews snapshots, fixes errors, and records actual findings in `REVIEW.md` inside the project.
5. **Preview and render.** Review the editor before delivery, unless you explicitly asked the agent to continue through rendering. Verify and keep the MP4 alongside its source and assets.

No root `video/` folder is used. `videos/` is not checked into Git and is **not backed up by a push**; back up your projects separately. Clones do not include the original Pilimon Connect or Cue Showcase videos.

## Commands and project layout

Run these from the repository root. Names use lowercase letters, digits, and hyphens, such as `product-demo`; pass the **name**, not `videos/product-demo`.

| Command | Purpose |
| --- | --- |
| `npm run new -- <name>` | Create a missing editable project; refuse existing folders |
| `npm run dev -- <name>` | Preview in the local HyperFrames editor |
| `npm run check -- <name> --json` | Check the composition, runtime, layout, and contrast |
| `npm run render -- <name> --quality draft` | Render existing authored HTML into the project's `renders/` |
| `npm run generate -- <name>` | Initialize if missing, then render current HTML; **does not call an LLM** |
| `npm run new -- --help` | Workspace usage |
| `npm test` | Deterministic tooling tests; no model or paid media calls |

`new` uses HyperFrames' **static 10-second Title starter**. The agent must replace it with your requested film. Calling `generate` immediately without AI authoring only renders that starter.

```text
video-editor/
├── AGENTS.md                  # Shared AI workflow, commands, privacy rules
├── CLAUDE.md                  # Imports the shared instructions
├── .agents/skills/            # Eight public skill packs and supporting files
├── .claude/skills/            # Relative links for Claude Code discovery
├── skills-lock.json           # Upstream acquisition metadata
├── LICENSES/                  # Third-party license texts
├── scripts/                   # Named-project workflow and audio tools
├── .env.example               # Empty optional audio setup
└── videos/                    # Created on demand; entirely gitignored
    └── product-demo/
        ├── BRIEF.md, STORYLINES.md, SPEC.md, REVIEW.md
        ├── index.html, hyperframes.json, package.json
        ├── compositions/
        ├── script/
        ├── assets/
        ├── renders/
        └── .hyperframes/      # Project history, snapshots, check artifacts
```

For portrait video, have the agent create `npm run new -- vertical-demo --resolution portrait`. Other options after the name are forwarded to HyperFrames. `generate` forwards **render** options; use `new` first for initialization options.

By default, exports use timestamped filenames in `renders/`. An explicit `--output renders/final.mp4` reuses—and may overwrite—that filename. Preview/check/render paths are project-relative; `new --video` and `new --audio` inputs are relative to `videos/`, so absolute input paths are less ambiguous.

The wrappers pin **HyperFrames 0.8.201** and set `HYPERFRAMES_SKIP_SKILLS=1` so initialization does not replace the bundled skill snapshot. For commands without wrappers, use `npx --yes hyperframes@0.8.201 <command>` from the named project. Do not follow upstream examples by silently upgrading the CLI or refreshing committed skills. Update deliberately and review the resulting changes. `skills-lock.json` records acquisition provenance, not a guarantee that locally adapted skill bodies still match upstream hashes.

## Optional ElevenLabs audio

Only do this if you want narration, transcription, generated music, or generated SFX:

```sh
cp .env.example .env.local
# Set ELEVENLABS_API_KEY yourself in .env.local; do not paste it into agent chat.
npm run voices -- --search narrator
```

You can instead export `ELEVENLABS_API_KEY` in your shell. An exported value takes precedence over `.env.local`. Never commit it or put it in HTML/assets. Do not give the repository another person's account/session files. Every uncached generation may spend credits.

Create the named project first. All asset commands select it with **`--project <name>`**:

```sh
npm run voiceover -- --project product-demo "Welcome to the demo."
npm run voiceover -- --project product-demo --file narration.txt --name intro
npm run transcribe -- --project product-demo videos/product-demo/assets/clip.mp4 --language eng
npm run sound -- --project product-demo music "Minimal instrumental pulse" --seconds 30
npm run sound -- --project product-demo sfx "Soft UI click" --name click --seconds 0.5
```

| Tool | Output under the selected project |
| --- | --- |
| `voiceover` | `assets/<name>.mp3` and `assets/<name>.transcript.json`; default stem `voiceover` |
| `transcribe` | `assets/<input-stem>.transcript.json` |
| `sound music` | `assets/audio/bgm.mp3`, or the `--name` stem |
| `sound sfx` | `assets/audio/sfx.mp3`, or the `--name` stem |

Audio input paths (`--file`, transcription input, `--dir`) are repository-root-relative, unlike the raw HyperFrames CLI's project-relative paths. Use a simple stem for `--name`, not a path. These commands reuse their output names; choose a new stem to keep variations. They generate files, **not** the audio/caption elements—the agent must add those to the composition.

The existing TTS defaults are voice George (`JBFqnCBsd6RMkjVDRZzb`) and model `eleven_v4`. Use `--voice` and `--model` for a voice/model available to your account, for example `--model eleven_multilingual_v2` where appropriate. Provider availability and account permissions vary.

### Per-scene narration and synchronization

The app-showcase skill writes `videos/product-demo/script/01-hook.txt`, `02-proof.txt`, etc. Files sort lexically. Lines starting with `#` are notes, not spoken. `# after: 1.2` adds a pause after a voiced scene; `# silent: 3` creates a three-second unvoiced scene.

```sh
npm run vo:scenes -- --project product-demo
npm run vo:scenes -- --project product-demo --only 02-proof
```

Unchanged text/voice/model combinations reuse cached takes. `--only` forces those scene takes to regenerate; other missing/changed scenes still generate when needed.

The command writes per-scene MP3/JSON files, `timeline.json`, word-level `captions.json`, `audio.html`, and `retime.plan.json` in `assets/vo/`. The agent then:

1. Authors `scene-<script-stem>` hosts, `vo-<script-stem>` audio clips, scenes, and caption elements.
2. Sets the root `data-duration` to the actual timeline `total` and adds the generated audio tags.
3. From the project directory, applies `npx --yes hyperframes@0.8.201 timeline apply assets/vo/retime.plan.json` to the already-authored hosts and clips.
4. Anchors animation and captions to word timings, previews, and checks again.

The plan does not create missing scenes. `audio.html` includes a music-bed tag: generate `assets/audio/bgm.mp3` if music was requested, or omit the tag. Without `--seconds`, music requests the timeline duration plus three seconds (capped at 120 seconds), or 45 seconds without a timeline.

## Troubleshooting

- **The agent renders “Title”:** it only ran the renderer. Ask it to load the local HyperFrames skill and author the requested scenes before rendering, using the first prompt above.
- **Skills not found:** start in the clone's root, restart the client, inspect its skill catalog, and use `.agents/skills/<name>/SKILL.md` directly. For Claude, verify the relative `.claude/skills/` links survived checkout; use WSL rather than Windows' placeholder symlink files.
- **A global skill overrides this checkout:** use the physical repository paths; OMP's `omp skill list --json` shows the source and any namespaced aliases. Do not edit your global configuration just to use this repo.
- **FFmpeg/browser missing:** confirm `ffmpeg -version` and `ffprobe -version`, then provision the browser if needed.
- **Static warning:** the native starter is still unless the agent authors motion. For an intentional still, use `data-no-timeline`; do not suppress the warning for a requested animation.
- **No `index.html` / partial initialization:** preserve the partial folder and use a new name, or repair its source intentionally. Never overwrite an existing film to retry setup.
- **Paid media authorization failure:** configure your own provider key, quota, voice/model access, and consent. The agent must not inspect your credential files or substitute missing audio silently.
- **No offline SFX bank:** intentional licensing exclusion. Supply cleared audio or authorize a documented provider; metadata alone is not a sound file.
- **Remote assets fail:** check network access or vendor the script/font/media into the project.
- **No videos in Git:** intentional. `videos/` stays private and needs its own backup.

## Contributing and open-source licenses

The workspace tooling, shared project instructions, and `app-showcase` workflow are [MIT licensed](LICENSE). The seven bundled HeyGen HyperFrames skill packs retain **Apache-2.0**, and included fonts retain **SIL OFL 1.1**. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), [LICENSES/Apache-2.0.txt](LICENSES/Apache-2.0.txt), and the font license files. These licenses do not grant rights to third-party brands or media, or make paid AI providers free.

Issues and pull requests are welcome. Use `npm ci` and `npm test`; smoke-test the changed workflow with an actual authored composition. For skill changes, verify discovery, supporting paths, relative Claude links, privacy rules, and the agent-facing commands. Keep the public skill packs and their license notices in Git; keep private videos, credentials, personal agent configuration, sessions, raw restricted audio, and generated caches out. Never add paid API/model calls to the deterministic test suite.
