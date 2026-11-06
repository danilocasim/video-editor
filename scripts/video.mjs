import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { projectDirectory, requireProject, workspaceDirectory } from "./lib/projects.mjs";

// Match the CLI version used by the original projects; do not silently upgrade.
const hyperframes = "hyperframes@0.8.201";
const [command, name, ...options] = process.argv.slice(2);
const usage = `Usage:
  npm run new -- <video-name> [init options]
  npm run generate -- <video-name> [render options]
  npm run dev -- <video-name> [preview options]
  npm run check -- <video-name> [check options]
  npm run render -- <video-name> [render options]

Projects and all default outputs live in videos/<video-name>/.
new refuses existing folders. generate creates a missing project, then renders it.
For a new project's resolution/example options, use new before generate.
Options are forwarded to HyperFrames. Init input paths are relative to videos/;
preview, check, and render paths are relative to videos/<video-name>/.`;

function run(args, cwd) {
  const result = spawnSync("npx", ["--yes", hyperframes, ...args], {
    cwd,
    stdio: "inherit",
    // This repository owns the bundled skill snapshot; init must not replace it.
    env: { ...process.env, HYPERFRAMES_SKIP_SKILLS: "1" },
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

async function createProject(project, initOptions) {
  await mkdir(join(workspaceDirectory, "videos"), { recursive: true });
  run(["init", name, "--non-interactive", "--skip-transcribe", "--skip-skills", ...initOptions], join(workspaceDirectory, "videos"));
  requireProject(name);
  for (const directory of ["assets", "compositions", "script", "renders"]) {
    await mkdir(join(project, directory), { recursive: true });
  }
  console.log(`Created videos/${name}/. Edit index.html, then run: npm run dev -- ${name}`);
}

try {
  if (!command || command === "--help" || name === "--help") {
    console.log(usage);
  } else {
    if (!["new", "generate", "preview", "check", "render"].includes(command)) throw new Error(usage);
    if (!name) throw new Error(usage);
    const project = projectDirectory(name);
    if (command === "new") {
      if (existsSync(project)) throw new Error(`videos/${name}/ already exists; choose another name. Existing work was not changed.`);
      await createProject(project, options);
    } else {
      if (command === "generate" && !existsSync(project)) await createProject(project, []);
      requireProject(name);
      run([command === "generate" ? "render" : command, ...options], project);
    }
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
