import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("CLI reports every validator issue for an invalid candidate and exits non-zero", (t) => {
  const temporaryDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "shanximap-validator-"),
  );
  t.after(() => fs.rmSync(temporaryDirectory, { recursive: true, force: true }));

  const candidatePath = path.join(temporaryDirectory, "invalid.json");
  fs.writeFileSync(
    candidatePath,
    JSON.stringify([{ id: 1, tier: "must_visit" }]),
  );

  const result = spawnSync(
    process.execPath,
    ["--import", "tsx", "scripts/validate-buildings.ts", candidatePath],
    { cwd: path.resolve("."), encoding: "utf8" },
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /\$\[0\]\.tier \(id 1\): Unknown building field/);
  assert.match(result.stderr, /\$\[0\]\.name \(id 1\): Expected a string/);
});
