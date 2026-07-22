import fs from "node:fs";
import path from "node:path";

import { validateBuildings } from "../src/lib/validate-buildings";

const runtimeDataPath = path.resolve(
  process.argv[2] ?? "src/data/buildings.json",
);

let input: unknown;
try {
  input = JSON.parse(fs.readFileSync(runtimeDataPath, "utf8"));
} catch (error) {
  console.error(`Could not read ${runtimeDataPath}:`, error);
  process.exitCode = 1;
}

if (input !== undefined) {
  const result = validateBuildings(input);

  if (result.ok) {
    console.log(`Validated ${result.data.length} building records.`);
  } else {
    for (const issue of result.issues) {
      const id = issue.recordId === undefined ? "" : ` (id ${issue.recordId})`;
      console.error(`${issue.path}${id}: ${issue.message}`);
    }
    process.exitCode = 1;
  }
}
