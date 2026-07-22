import type { Building } from "./types";

export type ValidatedBuilding = Pick<
  Building,
  | "id"
  | "name"
  | "city"
  | "type"
  | "earliest_dynasty"
  | "lat"
  | "lng"
>;

export type BuildingValidationIssue = {
  code:
    | "expected_array"
    | "expected_record"
    | "expected_string"
    | "expected_number"
    | "duplicate_id"
    | "expected_finite_number";
  path: string;
  message: string;
  recordId?: unknown;
};

export type BuildingValidationResult =
  | { ok: true; data: ValidatedBuilding[] }
  | { ok: false; issues: BuildingValidationIssue[] };

export function validateBuildings(input: unknown): BuildingValidationResult {
  if (!Array.isArray(input)) {
    return {
      ok: false,
      issues: [
        {
          code: "expected_array",
          path: "$",
          message: "Expected an array of buildings.",
        },
      ],
    };
  }

  const issues: BuildingValidationIssue[] = [];
  const firstIndexById = new Map<number, number>();

  input.forEach((value, index) => {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      issues.push({
        code: "expected_record",
        path: `$[${index}]`,
        message: "Expected a building record.",
      });
      return;
    }

    const record = value as Record<string, unknown>;
    if (typeof record.id !== "number") {
      issues.push({
        code: "expected_number",
        path: `$[${index}].id`,
        message: "Expected a number.",
        recordId: record.id,
      });
    } else if (firstIndexById.has(record.id)) {
      const firstIndex = firstIndexById.get(record.id);
      issues.push({
        code: "duplicate_id",
        path: `$[${index}].id`,
        message: `Duplicate building id ${record.id}; first seen at $[${firstIndex}].id.`,
        recordId: record.id,
      });
    } else {
      firstIndexById.set(record.id, index);
    }

    for (const field of ["name", "city", "type", "earliest_dynasty"]) {
      if (typeof record[field] !== "string") {
        issues.push({
          code: "expected_string",
          path: `$[${index}].${field}`,
          message: "Expected a string.",
          recordId: record.id,
        });
      }
    }

    for (const field of ["lat", "lng"]) {
      if (typeof record[field] !== "number" || !Number.isFinite(record[field])) {
        issues.push({
          code: "expected_finite_number",
          path: `$[${index}].${field}`,
          message: "Expected a finite number.",
          recordId: record.id,
        });
      }
    }
  });

  if (issues.length > 0) return { ok: false, issues };

  return { ok: true, data: input as ValidatedBuilding[] };
}
