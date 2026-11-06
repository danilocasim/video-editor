# Sound effects (SFX)

> Repository adaptation: the upstream Pixabay MP3 bank is deliberately excluded from this public repository. No offline fallback is promised by a clean clone. This guide documents the retained helper's online path and optional user-supplied library, not a redistribution grant for upstream sound files.

The shared audio engine (`scripts/audio.mjs` → `scripts/lib/sfx.mjs`) searches [Openverse](https://openverse.org)'s free audio API per cue, downloading sounds rather than generating them. Its optional offline fallback requires separately supplied audio that you have rights to use.

The retained `assets/sfx/manifest.json` is metadata only in a public clone. Do not assume its listed MP3s exist, and do not reinstall a raw bank as a licensing workaround. If Openverse fails or returns no suitable sound, tell the user. Use cleared user assets, or `npm run sound -- --project <name> sfx "<prompt>"` from the repository root only when ElevenLabs generation was explicitly authorized.

There is no `npx hyperframes sfx` command. The repository's ElevenLabs `sound` command is a separate generator; the upstream resolver is search-and-download. Follow the repository's pinned CLI instructions rather than unversioned examples.

## Licences

Only **CC0** and **CC BY** sounds are used: never NonCommercial, ShareAlike or NoDerivatives. Each CC BY sound is credited in the project's `assets/sfx/CREDITS.md` (title, creator, licence, source link; for `resolve`, in a `CREDITS.md` beside the sound files it saves) and its `audio_meta.sfx[]` entry carries `license` and `credit`. Tell the person to include those credits wherever the video is published.

## Cues — request → meta

Each line names the effects it wants: `lines[].sfx: ["whoosh", "ui click"]`. The engine flattens these into cues, resolves each, dedupes identical `(id, name)` pairs (the same effect named twice downloads/copies once), and writes `audio_meta.sfx[]`:

```jsonc
{
  "id": "3",                       // joins the cue to the caller's model (frame / scene / segment)
  "name": "whoosh",
  "file": "assets/sfx/whoosh.mp3", // downloaded or copied, relative to project root
  "source": "openverse" | "local", // which route resolved it
  "offset_s": 0,                   // delay from the line's start
  "duration_s": 0.57,
  "volume": 0.35,                  // SFX sit UNDER voice + BGM
  "license": "by",                 // Openverse only: "cc0" or "by"
  "credit": "\"Swoosh\" by Ana is licensed under CC BY 4.0. …" // Openverse only
}
```

A cue that matches nothing is **skipped** (recorded as an anomaly); SFX never blocks a render. Neither route replaces a file of yours already at the output name: the cue gets the next free name (`whoosh-2.mp3`), reported as an anomaly, and `file` carries the real path.

## Openverse

One search per distinct effect name (20 results, `license=cc0,by`; each result's licence is checked again). The pick keeps Openverse's relevance order, prefers clips that fit a cue (15 s at most; past ~4 s ranks lower) and CC0 over CC BY when they are close. The file lands at `assets/sfx/<slug>.<ext>` and `duration_s` comes from the result. Name effects concretely (`glass shatter`, not `dramatic sound`). Anonymous service limits may apply; an unavailable provider does not imply that the missing offline bank is usable.

## Optional offline library

The upstream metadata lists named cues in `assets/sfx/manifest.json` with `{ file, duration, description }` entries. Raw Pixabay MP3s are not part of this repository. If you supply your own cleared library, keep its files, actual durations, and credits consistent with the manifest. The helper can match manifest keys, file basenames, or their slugs. Do not present a metadata-only match as a downloaded or generated audio file.

## Rules

- **Volume ~0.35.** SFX must sit under narration and BGM, not fight them.
- **No match → report the missing effect.** The upstream helper records an anomaly and can continue, but do not call a requested soundtrack complete until each required sound is present or the user agrees to omit it.
- **Use the configured route.** The upstream helper retrieves licensed sounds; the repository's optional ElevenLabs tool generates them only with authorization.
- **One asset per distinct name.** Reuse across lines is deduped to a single search and download, many cues.
- **Credit CC BY sounds.** `CREDITS.md` lists them; keep it with the project.
