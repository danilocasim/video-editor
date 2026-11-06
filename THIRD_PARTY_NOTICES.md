# Third-party notices

## First-party workspace

The root workspace tooling, `AGENTS.md`, `CLAUDE.md`, README, and the `app-showcase` skill and references are distributed under this repository's [MIT license](LICENSE).

## HeyGen HyperFrames skills

These directories contain the installed open-source skill snapshot from [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes/tree/main/skills):

- `.agents/skills/hyperframes/`
- `.agents/skills/hyperframes-cli/`
- `.agents/skills/hyperframes-registry/`
- `.agents/skills/media-use/`
- `.agents/skills/figma/`
- `.agents/skills/slideshow/`
- `.agents/skills/remotion-to-hyperframes/`

Copyright 2026 HeyGen, Inc. Distributed under the **Apache License, Version 2.0**. The full upstream license and copyright notice are preserved in [LICENSES/Apache-2.0.txt](LICENSES/Apache-2.0.txt). The MIT license for the workspace does not replace this license.

`skills-lock.json` retains the original installer acquisition metadata (source, skill paths, and computed hashes). It is provenance, not an update policy or a claim that the adapted files still match those hashes. This repository does not automatically update the snapshot when initializing a video. `.claude/skills/` contains relative aliases to these same directories and to the first-party app-showcase skill; it is not a separate copy.

### Repository adaptations

The media-use `SKILL.md`, `audio/references/sfx.md`, and `audio/assets/sfx/CREDITS.md` have prominent repository-adaptation notes. They explain that the upstream Pixabay MP3 bank is not redistributed and distinguish the upstream search/download helper from this workspace's optional ElevenLabs generator. The underlying upstream helper code is retained; a clean public checkout has no promised offline audio fallback.

The first-party `app-showcase` workflow and its references have been adapted to the named `videos/<name>/` layout, explicit project arguments, pinned CLI, portable agent tooling, and public credential boundaries.

## Bundled fonts

The code-editorial frame preset includes Inter, EB Garamond, and JetBrains Mono font files under **SIL Open Font License 1.1**, not MIT or Apache. The original copyright statements and complete licenses are retained beside the fonts:

- [Inter OFL](.agents/skills/hyperframes/assets/frame-presets/code-editorial/fonts/OFL-inter.txt)
- [EB Garamond OFL](.agents/skills/hyperframes/assets/frame-presets/code-editorial/fonts/OFL-eb-garamond.txt)
- [JetBrains Mono OFL](.agents/skills/hyperframes/assets/frame-presets/code-editorial/fonts/OFL-jetbrains-mono.txt)

Do not strip these notices when copying the preset.

## Audio and other media

The upstream SFX credits identify a Pixabay-sourced bank. The raw `.mp3` files under `.agents/skills/media-use/audio/assets/sfx/` are intentionally excluded from this repository. Their metadata and adapted credits remain for provenance; neither the repository's licenses nor those credits grant a right to redistribute the raw sounds as a standalone library.

Use cleared user assets, properly licensed Openverse downloads with required attribution, or an explicitly authorized generation provider. Media downloaded/generated for a project belongs under its gitignored `videos/<name>/` folder. Provider service terms, per-asset licenses, trademark rights, and publication rights remain the user's responsibility.

HyperFrames, GSAP, ElevenLabs, coding-agent clients, optional media providers, and installed npm dependencies retain their own licenses and terms. Open-sourcing these instructions does not bundle a provider account or transfer rights to personal project assets.
