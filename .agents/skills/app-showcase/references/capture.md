# Getting the real UI

Everything that claims to be the app is the app (`/hyperframes` `references/types/launch.md`). This file covers how to get the screens each beat needs and how to make them look good on camera.

## Sources, best first

1. **The person's own recording or screenshots.** Ask for them by beat: "For the proof scene I need the Review screen with three missed questions." Put the files in `videos/my-video/assets/ui/` (substitute the chosen video name).
2. **The app running locally or on a public URL.** Capture it yourself (see below). Never sign in with the person's credentials, and never use real customer data.
3. **`npx --yes hyperframes@0.8.201 capture <url> -o videos/my-video-capture --json`.** From the repository root, capture a public page into a fresh ignored project. Integrate usable assets into the chosen film only after success. If capture fails or writes `BLOCKED.md`, stop using that partial capture (`../hyperframes-cli/references/init-and-scaffold.md`, relative to the skill root).
4. **Figma frames (`/figma`).** For screens that aren't built yet. Rebuild them as states of one screen, so that moving between two frames is one real click.
5. **The repo.** Check today's labels, copy and colours in the code before you rebuild any piece of UI.

If an essential screen is missing, request that specific screen and stop that part of the build. Never draw an invented interface or deliver a placeholder as the requested app film.

## Capturing yourself

**Screenshots (web).** Capture at 2× device scale, so a 1.6–2× punch-in stays sharp. Use `npx --yes hyperframes@0.8.201 browser ensure` if Chrome is needed, or the browser tools actually connected to the coding agent.

**Scripted recording (web).** Playwright gives a repeatable take with clean timing. It's a dev dependency, so ask before installing it.

```js
// videos/my-video/tools/record.mjs → videos/my-video/assets/ui/*.webm
import { chromium } from "playwright";
const browser = await chromium.launch({ slowMo: 60 });
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
  recordVideo: { dir: "videos/my-video/assets/ui", size: { width: 1920, height: 1080 } },
});
const page = await context.newPage();
await page.goto(process.env.APP_URL);
await page.waitForTimeout(800);            // a still beat to cut on
await page.click("text=Review missed");    // one action per beat, with a hold after it
await page.waitForTimeout(1200);
await context.close();
await browser.close();
```

**iOS Simulator.** Run `xcrun simctl io booted recordVideo --codec h264 videos/my-video/assets/ui/ios-flow.mp4` (Ctrl-C stops it). Before recording, set a clean status bar: `xcrun simctl status_bar booted override --time 9:41 --batteryLevel 100 --cellularBars 4`.

**Android.** Record with `adb shell screenrecord /sdcard/flow.mp4`, then `adb pull /sdcard/flow.mp4 videos/my-video/assets/ui/`. Turn on demo mode first to get a clean status bar.

After recording, transcode footage with an unusual codec or variable frame rate, and let HyperFrames proxy it (`hyperframes.json` `media.autoProxy` is on).

## Preparing the app for camera

- **Demo data that tells the story.** Use realistic names, numbers and content: the spine object from the hook (one real question, one real topic) is in the data. Never use lorem ipsum, "Test User 1" or real customers' data.
- **A clean state.** No notification badges, toasts, cookie banners, dev overlays or debug borders. One theme (light or dark) for the whole film.
- **Hold still between actions.** Leave 0.8–1.2 s still after each action, so the editor has frames to cut on and the voice has room.

## Framing it in the film

These rules come from `launch.md`:

- **Show only the piece the beat uses**, at 1.6–2× its real size. Text stays at 26 px or more at 1080p after any push. Never put a small window in the middle of an empty canvas.
- **Move the camera between three framings:** the whole window on its ground, one pane, and a punch-in on one control. Moves take 0.4–0.6 s and arrive where the cursor needs to be.
- **Make the cursor big** (4–7% of the frame). It enters from off-screen, and its click causes the next thing on the same frame.
- **Mobile apps:** the screen is the hero. Use a plain device outline only when the brand uses one, and never tilt the product UI in 3D. On vertical, the phone screen can fill the frame.
- **Grades and blurs go through `npx --yes hyperframes@0.8.201 media-treatment`**, never CSS filters on footage.
