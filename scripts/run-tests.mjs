import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function findTypeScriptTests(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return findTypeScriptTests(entryPath);
    return entry.name.endsWith(".test.ts") ? [entryPath] : [];
  });
}

const testFiles = findTypeScriptTests(path.resolve("src"));

if (testFiles.length === 0) {
  console.error("No TypeScript tests found under src/.");
  process.exitCode = 1;
} else {
  const result = spawnSync(
    process.execPath,
    ["--import", "tsx", "--test", ...testFiles],
    { stdio: "inherit" },
  );
  process.exitCode = result.status ?? 1;
}
