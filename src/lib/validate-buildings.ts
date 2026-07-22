import {
  CITIES,
  DESCRIPTION_SOURCES,
  GEO_PRECISIONS,
  HERITAGE_TYPES,
  type Building,
} from "./types";

const SHANXI_COORDINATE_ENVELOPE = {
  lat: { min: 34.58, max: 40.74 },
  lng: { min: 110.23, max: 114.56 },
} as const;

const BUILDING_FIELDS = new Set([
  "id",
  "name",
  "dynasty",
  "earliest_dynasty",
  "dynasty_sort",
  "address",
  "city",
  "county",
  "type",
  "batch",
  "batch_no",
  "year",
  "lat",
  "lng",
  "description",
  "desc_source",
  "geo_precision",
  "geo_source",
  "is_open",
  "yingzao",
  "yingzao_source",
  "tel",
  "rating",
  "wiki_url",
  "image",
]);

const IMAGE_FIELDS = new Set(["url", "thumb", "license", "artist"]);

export type BuildingValidationIssue = {
  code:
    | "expected_array"
    | "expected_non_empty_array"
    | "expected_record"
    | "expected_string"
    | "expected_non_empty_string"
    | "expected_number"
    | "expected_integer"
    | "expected_positive_integer"
    | "duplicate_id"
    | "expected_finite_number"
    | "unsupported_value"
    | "coordinate_out_of_range"
    | "expected_boolean_or_null"
    | "unsupported_rating"
    | "incomplete_pair"
    | "invalid_http_url"
    | "unknown_field";
  path: string;
  message: string;
  recordId?: unknown;
};

function appendUnknownFieldIssues({
  issues,
  record,
  allowedFields,
  basePath,
  objectLabel,
  recordId,
}: {
  issues: BuildingValidationIssue[];
  record: Record<string, unknown>;
  allowedFields: ReadonlySet<string>;
  basePath: string;
  objectLabel: "building" | "image";
  recordId: unknown;
}) {
  for (const field of Object.keys(record)
    .filter((field) => !allowedFields.has(field))
    .sort()) {
    issues.push({
      code: "unknown_field",
      path: `${basePath}.${field}`,
      message: `Unknown ${objectLabel} field ${JSON.stringify(field)}.`,
      recordId,
    });
  }
}

export type BuildingValidationResult =
  | { ok: true; data: Building[] }
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

  if (input.length === 0) {
    return {
      ok: false,
      issues: [
        {
          code: "expected_non_empty_array",
          path: "$",
          message: "Expected at least one building record.",
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
    appendUnknownFieldIssues({
      issues,
      record,
      allowedFields: BUILDING_FIELDS,
      basePath: `$[${index}]`,
      objectLabel: "building",
      recordId: record.id,
    });

    if (
      typeof record.image === "object" &&
      record.image !== null &&
      !Array.isArray(record.image)
    ) {
      appendUnknownFieldIssues({
        issues,
        record: record.image as Record<string, unknown>,
        allowedFields: IMAGE_FIELDS,
        basePath: `$[${index}].image`,
        objectLabel: "image",
        recordId: record.id,
      });
    }

    const recordId = record.id;
    const addIssue = (
      code: BuildingValidationIssue["code"],
      field: string,
      message: string,
    ) => {
      issues.push({
        code,
        path: `$[${index}].${field}`,
        message,
        recordId,
      });
    };
    const requireString = (field: string, allowEmpty = false) => {
      const fieldValue = record[field];
      if (typeof fieldValue !== "string") {
        addIssue("expected_string", field, "Expected a string.");
      } else if (!allowEmpty && fieldValue.length === 0) {
        addIssue(
          "expected_non_empty_string",
          field,
          "Expected a non-empty string.",
        );
      }
    };
    const requireInteger = (field: string) => {
      if (!Number.isFinite(record[field]) || !Number.isInteger(record[field])) {
        addIssue("expected_integer", field, "Expected a finite integer.");
      }
    };
    const requireEnum = (
      field: string,
      supportedValues: readonly string[],
    ) => {
      const fieldValue = record[field];
      if (
        typeof fieldValue === "string" &&
        !supportedValues.includes(fieldValue)
      ) {
        addIssue(
          "unsupported_value",
          field,
          `Expected one of: ${supportedValues.join(", ")}.`,
        );
      }
    };
    const isHttpUrl = (fieldValue: string) => {
      try {
        const url = new URL(fieldValue);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    };
    const requireOptionalString = (field: string) => {
      if (record[field] !== undefined && typeof record[field] !== "string") {
        addIssue("expected_string", field, "Expected a string when present.");
      }
    };
    const requireOptionalHttpUrl = (field: string) => {
      const fieldValue = record[field];
      if (fieldValue === undefined) return;
      if (typeof fieldValue !== "string") {
        addIssue("expected_string", field, "Expected a string when present.");
      } else if (fieldValue.length === 0) {
        addIssue(
          "expected_non_empty_string",
          field,
          "Expected a non-empty string.",
        );
      } else if (!isHttpUrl(fieldValue)) {
        addIssue("invalid_http_url", field, "Expected an HTTP(S) URL.");
      }
    };

    if (typeof recordId !== "number") {
      issues.push({
        code: "expected_number",
        path: `$[${index}].id`,
        message: "Expected a number.",
        recordId,
      });
    } else if (!Number.isInteger(recordId) || recordId <= 0) {
      addIssue(
        "expected_positive_integer",
        "id",
        "Expected a positive integer.",
      );
    } else if (firstIndexById.has(recordId)) {
      const firstIndex = firstIndexById.get(recordId);
      issues.push({
        code: "duplicate_id",
        path: `$[${index}].id`,
        message: `Duplicate building id ${recordId}; first seen at $[${firstIndex}].id.`,
        recordId,
      });
    } else {
      firstIndexById.set(recordId, index);
    }

    requireString("name");
    requireString("dynasty");
    requireString("earliest_dynasty");
    requireInteger("dynasty_sort");
    requireString("address");
    requireString("city");
    requireEnum("city", CITIES);
    requireString("county", true);
    requireString("type");
    requireEnum("type", HERITAGE_TYPES);
    requireString("batch");
    requireString("batch_no", true);
    requireInteger("year");

    for (const field of ["lat", "lng"] as const) {
      const coordinate = record[field];
      if (typeof coordinate !== "number" || !Number.isFinite(coordinate)) {
        addIssue("expected_finite_number", field, "Expected a finite number.");
      } else {
        const { min, max } = SHANXI_COORDINATE_ENVELOPE[field];
        if (coordinate < min || coordinate > max) {
          addIssue(
            "coordinate_out_of_range",
            field,
            `Expected ${field} within the broad Shanxi envelope ${min}–${max}; passing this range check does not prove coordinate accuracy.`,
          );
        }
      }
    }

    requireString("description");
    requireString("desc_source");
    requireEnum("desc_source", DESCRIPTION_SOURCES);
    requireString("geo_precision");
    requireEnum("geo_precision", GEO_PRECISIONS);
    requireString("geo_source");

    if (
      record.is_open !== undefined &&
      record.is_open !== null &&
      typeof record.is_open !== "boolean"
    ) {
      addIssue(
        "expected_boolean_or_null",
        "is_open",
        "Expected a boolean or null when present.",
      );
    }

    requireOptionalString("yingzao");
    requireOptionalString("yingzao_source");
    const hasYingzao = record.yingzao !== undefined;
    const hasYingzaoSource = record.yingzao_source !== undefined;
    if (hasYingzao !== hasYingzaoSource) {
      const missingField = hasYingzao ? "yingzao_source" : "yingzao";
      addIssue(
        "incomplete_pair",
        missingField,
        "Expected Yingzao Society evidence and its source to be present together.",
      );
    } else if (
      typeof record.yingzao === "string" &&
      typeof record.yingzao_source === "string"
    ) {
      if (record.yingzao.length > 0 && record.yingzao_source.length === 0) {
        addIssue(
          "incomplete_pair",
          "yingzao_source",
          "Expected a source when Yingzao Society evidence is present.",
        );
      } else if (
        record.yingzao.length === 0 &&
        record.yingzao_source.length > 0
      ) {
        addIssue(
          "incomplete_pair",
          "yingzao",
          "Expected Yingzao Society evidence when a source is present.",
        );
      }
    }

    requireOptionalString("tel");

    if (record.rating !== undefined) {
      const validEmptyArray =
        Array.isArray(record.rating) && record.rating.length === 0;
      if (typeof record.rating !== "string" && !validEmptyArray) {
        addIssue(
          "unsupported_rating",
          "rating",
          "Expected a string or the transitional empty-array value.",
        );
      }
    }

    requireOptionalHttpUrl("wiki_url");

    if (record.image !== undefined) {
      if (
        typeof record.image !== "object" ||
        record.image === null ||
        Array.isArray(record.image)
      ) {
        addIssue("expected_record", "image", "Expected an image record.");
      } else {
        const image = record.image as Record<string, unknown>;
        for (const field of ["url", "thumb", "license", "artist"] as const) {
          const fieldValue = image[field];
          const path = `image.${field}`;
          if (typeof fieldValue !== "string") {
            addIssue("expected_string", path, "Expected a string.");
          } else if (fieldValue.length === 0) {
            addIssue(
              "expected_non_empty_string",
              path,
              "Expected a non-empty string.",
            );
          } else if (
            (field === "url" || field === "thumb") &&
            !isHttpUrl(fieldValue)
          ) {
            addIssue("invalid_http_url", path, "Expected an HTTP(S) URL.");
          }
        }
      }
    }
  });

  if (issues.length > 0) return { ok: false, issues };

  return { ok: true, data: input as Building[] };
}
