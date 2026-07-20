import assert from "node:assert/strict";
import test from "node:test";

import { validateBuildings } from "./validate-buildings";

const validBuilding = {
  id: 1,
  name: "佛光寺",
  city: "忻州市",
  type: "古建筑",
  earliest_dynasty: "唐",
  tier: "必去",
  lat: 38.868,
  lng: 113.387,
};

function validationIssues(input: unknown) {
  const result = validateBuildings(input);
  assert.equal(result.ok, false);
  return result.issues.map(({ code, path, recordId }) =>
    recordId === undefined ? { code, path } : { code, path, recordId },
  );
}

test("accepts a valid building collection", () => {
  const input = [validBuilding];

  assert.deepEqual(validateBuildings(input), { ok: true, data: input });
});

test("rejects a non-array collection", () => {
  assert.deepEqual(validationIssues({}), [
    { code: "expected_array", path: "$" },
  ]);
});

test("rejects a collection item that is not a record", () => {
  assert.deepEqual(validationIssues([null]), [
    { code: "expected_record", path: "$[0]" },
  ]);
});

test("rejects missing and wrongly typed text fields", () => {
  const input = [
    {
      ...validBuilding,
      name: undefined,
      city: 42,
      type: null,
      earliest_dynasty: false,
    },
  ];

  assert.deepEqual(validationIssues(input), [
      {
        code: "expected_string",
        path: "$[0].name",
        recordId: 1,
      },
      {
        code: "expected_string",
        path: "$[0].city",
        recordId: 1,
      },
      {
        code: "expected_string",
        path: "$[0].type",
        recordId: 1,
      },
      {
        code: "expected_string",
        path: "$[0].earliest_dynasty",
        recordId: 1,
      },
  ]);
});

test("rejects a non-numeric building identifier", () => {
  const input = [{ ...validBuilding, id: "1" }];

  assert.deepEqual(validationIssues(input), [
      {
        code: "expected_number",
        path: "$[0].id",
        recordId: "1",
      },
  ]);
});

test("rejects a duplicate building identifier", () => {
  const input = [validBuilding, { ...validBuilding, name: "南禅寺" }];

  assert.deepEqual(validationIssues(input), [
      {
        code: "duplicate_id",
        path: "$[1].id",
        recordId: 1,
      },
  ]);
});

test("rejects non-finite coordinates", () => {
  const input = [{ ...validBuilding, lat: Number.POSITIVE_INFINITY, lng: NaN }];

  assert.deepEqual(validationIssues(input), [
      {
        code: "expected_finite_number",
        path: "$[0].lat",
        recordId: 1,
      },
      {
        code: "expected_finite_number",
        path: "$[0].lng",
        recordId: 1,
      },
  ]);
});

test("rejects an unsupported visit tier", () => {
  const input = [{ ...validBuilding, tier: "顶级" }];

  assert.deepEqual(validationIssues(input), [
      {
        code: "unsupported_tier",
        path: "$[0].tier",
        recordId: 1,
      },
  ]);
});
