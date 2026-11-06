import { existsSync, lstatSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const workspaceDirectory = fileURLToPath(new URL("../../", import.meta.url));

/**
 * Resolve a local video name without allowing paths or symlink escapes.
 * @param {string} name Lowercase, hyphen-separated project name.
 * @param {string} [workspace] Workspace containing the videos directory.
 * @returns {string} Absolute project directory.
 */
export function projectDirectory(name, workspace = workspaceDirectory) {
  if (typeof name !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
    throw new Error("Use a video name such as my-video (lowercase letters, numbers, and hyphens), not a path.");
  }
  const videos = join(workspace, "videos");
  const project = join(videos, name);
  for (const directory of [videos, project]) {
    // lstat also catches dangling symlinks, which existsSync alone misses.
    const entry = lstatSync(directory, { throwIfNoEntry: false });
    if (entry && (!entry.isDirectory() || entry.isSymbolicLink())) {
      throw new Error(`Expected a real directory, not a file or symlink: ${directory}`);
    }
  }
  return project;
}

/**
 * Require an existing composition before generating project assets or rendering.
 * @param {string} name Video name, not a filesystem path.
 * @param {string} [workspace] Workspace containing the videos directory.
 * @returns {string} Absolute project directory.
 */
export function requireProject(name, workspace = workspaceDirectory) {
  const project = projectDirectory(name, workspace);
  if (!existsSync(join(project, "index.html"))) {
    throw new Error(`Video "${name}" has no index.html. Create it with: npm run new -- ${name}`);
  }
  return project;
}
