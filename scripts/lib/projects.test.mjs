import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { projectDirectory, requireProject } from "./projects.mjs";

async function workspace(t) {
  const directory = await mkdtemp(join(tmpdir(), "video-editor-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

test("video names cannot escape the private videos directory", () => {
  for (const name of [undefined, "", "../private", "/tmp/video", "a/b", "a\\b", "--help", "Two Words"]) {
    assert.throws(() => projectDirectory(name), /video name/);
  }
});

test("an incomplete project is rejected before media generation", async (t) => {
  const root = await workspace(t);
  await mkdir(join(root, "videos", "unfinished"), { recursive: true });
  assert.throws(() => requireProject("unfinished", root), /has no index.html/);
});

test("symlinked project and videos directories cannot redirect generated files", async (t) => {
  const root = await workspace(t);
  const outside = join(root, "outside");
  await mkdir(outside);
  await writeFile(join(outside, "index.html"), "preserve this composition");
  await mkdir(join(root, "videos"));
  await symlink(outside, join(root, "videos", "linked"), "dir");
  assert.throws(() => requireProject("linked", root), /symlink/);
  await symlink(join(root, "missing"), join(root, "videos", "dangling"), "dir");
  assert.throws(() => projectDirectory("dangling", root), /symlink/);
  assert.equal(await readFile(join(outside, "index.html"), "utf8"), "preserve this composition");
  const otherRoot = await workspace(t);
  await symlink(outside, join(otherRoot, "videos"), "dir");
  assert.throws(() => projectDirectory("new-video", otherRoot), /symlink/);
});
