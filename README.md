# Video Editor

A local-first workspace for editable [HyperFrames](https://hyperframes.heygen.com/) videos, with optional ElevenLabs voiceover, word timings, transcription, music, and sound effects.

Every video has its own `videos/<video-name>/` directory containing its composition, assets, scripts, and rendered files. The entire `videos/` directory is gitignored: this repository shares the tooling, not your projects or media.

## Requirements

- **Node.js 22.9 or newer**, with npm and npx on your PATH.
- **FFmpeg and ffprobe**, on your PATH, for local rendering and audio durations.
- **Chrome/Chromium**. HyperFrames can install a compatible browser when needed.
- macOS or Linux; on Windows, use **WSL2** and install the tools inside WSL.
- Internet access for the first HyperFrames CLI download and the starter's pinned GSAP CDN script. Vendor remote assets before relying on offline rendering.

For example, install FFmpeg with `brew install ffmpeg` on macOS or `sudo apt-get install ffmpeg` on Ubuntu. Get Node.js from [nodejs.org](https://nodejs.org/).

**No API key is needed to create, edit, preview, or render a local video.** The optional audio commands use your own ElevenLabs account and may incur charges. Hosted HyperFrames services have separate account/plan requirements and are not needed for this workflow.

## Quick start

```sh
git clone https://github.com/danilocasim/video-editor.git
cd video-editor
npm ci

# Creates videos/ automatically, then videos/my-first-video/.
npm run new -- my-first-video

# Edit videos/my-first-video/index.html, then open the timeline editor.
npm run dev -- my-first-video
```

Stop the preview with Ctrl+C. After editing and reviewing the preview:

```sh
npm run check -- my-first-video
npm run render -- my-first-video --quality draft
```

The MP4 is written under `videos/my-first-video/renders/`. HyperFrames uses timestamped filenames by default, so ordinary re-renders keep previous exports.

For a one-command creation/render smoke run:

```sh
npm run generate -- hello-video --quality draft
```

`generate` creates a missing project and renders it; if the project already exists, it renders the existing composition without reinitializing it. The default HyperFrames starter is a **10-second static title**, not an automatically authored film. Replace its title, styles, and timeline with your content. A static-motion warning from `check` is expected until you add animation or intentionally mark a still composition with `data-no-timeline`.

## Commands

Run these from the repository root. Names use lowercase letters, digits, and single hyphens, such as `product-launch`. Names are not paths; do not pass `videos/product-launch` as the video name. Existing project folders are never overwritten by `new`.

| Command | Purpose |
| --- | --- |
| `npm run new -- <name>` | Create an editable project in `videos/<name>/` |
| `npm run generate -- <name>` | Create if missing, then render |
| `npm run dev -- <name>` | Open the local HyperFrames timeline editor |
| `npm run check -- <name>` | Check composition, runtime, layout, and contrast |
| `npm run render -- <name>` | Render an existing project |
| `npm run new -- --help` | Show workspace command usage |
| `npm test` | Run the deterministic local test suite, without API calls |

Options after the name are passed to the corresponding HyperFrames command. `generate` forwards **render** options; use `new` first for initialization options:

```sh
npm run new -- vertical-demo --resolution portrait
npm run new -- promo-demo --example kinetic-type
npm run render -- promo-demo --quality delivery
npm run render -- promo-demo --output renders/final.mp4
npm run check -- promo-demo --json
```

An explicit `--output renders/final.mp4` overwrites that named file on a later render. Preview, check, and render options such as `--output` and `--variables-file` resolve relative paths from the project folder. Initialization runs from `videos/`, so use absolute paths for `new --video` or `new --audio` inputs (or paths relative to `videos/`). Keep output paths inside the project folder to retain the private layout.

The wrapper pins **HyperFrames 0.8.201**, matching the original projects. It downloads through npx on first use; no global installation is required. To inspect upstream options:

```sh
npx --yes hyperframes@0.8.201 init --help
npx --yes hyperframes@0.8.201 render --help
```

## Project layout

```text
video-editor/
├── scripts/                   # Shared video and optional audio tooling
├── package.json
├── package-lock.json
├── .env.example               # Empty optional audio configuration
├── .env.local                 # Your API key; ignored
└── videos/                    # Created on demand; entirely ignored
    └── product-launch/
        ├── index.html         # Root composition and paused timeline
        ├── hyperframes.json
        ├── package.json       # Native HyperFrames project commands
        ├── compositions/      # Optional scene HTML files
        ├── assets/            # Images, fonts, video, and generated audio
        ├── script/            # Optional per-scene narration text
        ├── renders/           # Rendered videos
        └── .hyperframes/      # Local history and render/check artifacts
```

Keep briefs, storylines, specifications, reviews, and project-specific tools alongside that project's `index.html`. A new clone contains **no personal videos**, including the original Pilimon Connect and Cue Showcase projects. Ignored files are not backed up by Git: back up `videos/` separately.

### Editing a composition

Edit `index.html` directly or use an AI coding agent with the [HyperFrames authoring guide](https://hyperframes.heygen.com/). The native scaffold includes project authoring instructions; installing agent skills is optional and is not required to render.

- The root's `data-duration` is the video length in seconds; the default canvas is 1920×1080 at 30 fps.
- Put reusable scenes in `compositions/` and media in `assets/`.
- Register a paused GSAP timeline as `window.__timelines["main"]` for deterministic seeking. Do not use wall-clock timers or random animation.
- Keep fonts and media local for portable projects. The starter loads GSAP from a pinned CDN URL.
- Preview before delivery and run `check` after composition changes.

This workspace organizes and renders HTML compositions; it does not turn a prompt into a finished video without an author or a separately configured coding agent.

## Optional ElevenLabs audio

Only set up credentials if you need voiceover, transcription, music, or sound effects:

```sh
cp .env.example .env.local
# Edit .env.local and set ELEVENLABS_API_KEY to your own key.
npm run voices -- --search narrator
```

Existing shell environment variables also work; `.env.local` is optional and does not override an already-exported key. Never put a key in HTML, assets, prompts, or source control. Use a voice/model available to your account; the scripts' default voice is George (`JBFqnCBsd6RMkjVDRZzb`) and default TTS model is `eleven_v4`. Override with `--voice` and `--model` when needed.

Audio tools require an existing project and an explicit `--project <name>`:

```sh
npm run voiceover -- --project product-launch "Welcome to the launch."
npm run voiceover -- --project product-launch --file narration.txt --name intro
npm run transcribe -- --project product-launch videos/product-launch/assets/clip.mp4 --language eng
npm run sound -- --project product-launch music "Minimal instrumental electronic pulse" --seconds 30
npm run sound -- --project product-launch sfx "Soft UI click" --name click --seconds 0.5
```

Unlike the HyperFrames wrapper, audio tools resolve **input** paths (`--file`, transcription input, and `--dir`) from the repository root. Their output always targets the selected project's assets directory. Use a simple filename stem for `--name`, not a path.

| Tool | Output inside `videos/<name>/` |
| --- | --- |
| `voiceover` | `assets/<name>.mp3` and `assets/<name>.transcript.json` (default stem: `voiceover`) |
| `transcribe` | `assets/<input-stem>.transcript.json` |
| `sound music` | `assets/audio/bgm.mp3` (or `--name`) |
| `sound sfx` | `assets/audio/sfx.mp3` (or `--name`) |

These files are not automatically inserted into your composition. Add timed `<audio>` clips and caption elements yourself. Single-file voiceover and sound commands overwrite the same output stem; choose a new `--name` to keep variations. Check your account's permissions, quotas, service terms, and rights to generated media before using paid commands.

### Per-scene narration and synchronization

Write narration files such as `videos/product-launch/script/01-hook.txt` and `02-proof.txt`. Files are processed in lexical order. Comment lines begin with `#`; supported timing directives are:

```text
# after: 1.2
A spoken line, followed by a 1.2-second pause.
```

For a scene with no narration, use a file containing `# silent: 3` (three seconds).

```sh
npm run vo:scenes -- --project product-launch
npm run vo:scenes -- --project product-launch --only 02-proof
```

Unchanged text/voice/model combinations reuse cached takes. `--only` forces the named scene takes to regenerate; other missing or changed scenes still generate as necessary. This command may call the paid API for each uncached scene.

Outputs in `assets/vo/` include per-scene MP3s and metadata, `timeline.json`, word-level `captions.json`, `audio.html`, and `retime.plan.json`. To synchronize an authored composition:

1. Create scene hosts named `scene-01-hook`, `scene-02-proof`, etc., and voice clips named `vo-01-hook`, `vo-02-proof`, etc.
2. Set the root `data-duration` to the generated timeline's `total`; paste the generated audio tags into the root and build captions from `captions.json`.
3. From `videos/product-launch/`, run `npx --yes hyperframes@0.8.201 timeline apply assets/vo/retime.plan.json`.
4. Preview and check again. The retiming plan only updates hosts/clips that already exist; it does not author scenes or captions.

The generated `audio.html` also includes a music-bed tag for `assets/audio/bgm.mp3`. Generate that track with `sound music`, or omit the tag. Without `--seconds`, music requests the timeline duration plus three seconds (capped at 120 seconds), or 45 seconds if no timeline exists.

## Troubleshooting

- **FFmpeg not found:** install FFmpeg, reopen the terminal, and confirm `ffmpeg -version` and `ffprobe -version` work.
- **Browser missing:** run `npx --yes hyperframes@0.8.201 browser ensure`.
- **No `index.html`:** create the project with `npm run new -- <name>` first. A failed native initialization can leave a partial folder; preserve it and choose a new name rather than overwriting it.
- **Project already exists:** use `dev`, `check`, or `render`, or choose another name.
- **API authorization/model error:** check your own key, quota, voice access, and model availability; preview/render do not require ElevenLabs.
- **No animation / `sweep_static`:** the default starter is intentionally static. Author a seekable timeline or mark an intentional still with `data-no-timeline`.
- **Remote script or font fails:** check network access or vendor the asset locally and update its URL.
- **Nothing appears in Git:** `videos/` is intentionally ignored. Do not force-add private projects or credentials to the public repository.

## Contributing

Issues and pull requests are welcome. Use `npm ci`, run `npm test`, and smoke-test project creation plus a draft render for workflow changes. Keep tests deterministic and offline; do not make paid API calls in tests. Preserve the named-project layout and keep generated media, installed skills, credentials, and machine-specific paths out of commits. Update this README when changing commands.

## License

[MIT](LICENSE) for this repository's tooling. HyperFrames, GSAP, ElevenLabs, fonts, and any imported or generated media retain their respective licenses and service terms. The MIT license does not grant rights to someone else's brand assets or media.
