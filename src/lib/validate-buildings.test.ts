import assert from "node:assert/strict";
import test from "node:test";

import type { Building } from "./types";
import { validateBuildings } from "./validate-buildings";

const validBuilding = {
  id: 1,
  name: "佛光寺",
  dynasty: "唐、金、明、清",
  earliest_dynasty: "唐",
  dynasty_sort: 857,
  address: "山西省忻州市五台县豆村镇佛光村",
  city: "忻州市",
  county: "五台县",
  type: "古建筑",
  batch: "第一批全国重点文物保护单位",
  batch_no: "1-0080-3-033",
  year: 1961,
  lat: 38.868,
  lng: 113.387,
  description: "佛光寺东大殿是现存重要的唐代木构建筑。",
  desc_source: "manual",
  geo_precision: "high",
  geo_source: "项目人工核验",
  is_open: null,
  yingzao: "1937年营造学社调查",
  yingzao_source: "《中国建筑史》",
  tel: "0350-0000000",
  rating: "4.8",
  wiki_url: "https://zh.wikipedia.org/wiki/佛光寺_(五台)",
  image: {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Foguang_Temple.jpg",
    thumb: "https://upload.wikimedia.org/foguang-thumb.jpg",
    license: "CC BY-SA 4.0",
    artist: "示例作者",
  },
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

  const result = validateBuildings(input);
  assert.equal(result.ok, true);
  const building: Building = result.data[0];
  assert.equal(building.description, validBuilding.description);
  assert.deepEqual(result.data, input);
});

test("rejects a non-array collection", () => {
  assert.deepEqual(validationIssues({}), [
    { code: "expected_array", path: "$" },
  ]);
});

test("rejects an empty building collection", () => {
  assert.deepEqual(validationIssues([]), [
    { code: "expected_non_empty_array", path: "$" },
  ]);
});

test("rejects a collection item that is not a record", () => {
  assert.deepEqual(validationIssues([null]), [
    { code: "expected_record", path: "$[0]" },
  ]);
});

test("rejects unknown runtime fields in deterministic name order", () => {
  const input = [{ ...validBuilding, typo: true, tier: "must_visit" }];

  assert.deepEqual(validationIssues(input), [
    { code: "unknown_field", path: "$[0].tier", recordId: 1 },
    { code: "unknown_field", path: "$[0].typo", recordId: 1 },
  ]);
});

test("rejects unknown image fields", () => {
  const input = [
    {
      ...validBuilding,
      image: { ...validBuilding.image, caption: "未经审核的字段" },
    },
  ];

  assert.deepEqual(validationIssues(input), [
    {
      code: "unknown_field",
      path: "$[0].image.caption",
      recordId: 1,
    },
  ]);
});

test("accepts approved empty and optional field forms", () => {
  const buildingWithoutOptionalEnrichment = Object.fromEntries(
    Object.entries(validBuilding).filter(
      ([field]) => !["image", "tel", "wiki_url"].includes(field),
    ),
  );
  const input = [
    {
      ...buildingWithoutOptionalEnrichment,
      county: "",
      batch_no: "",
      yingzao: "",
      yingzao_source: "",
      rating: [],
    },
  ];

  assert.deepEqual(validateBuildings(input), { ok: true, data: input });
});

test("rejects missing, empty, and wrongly typed required fields in schema order", () => {
  const input = [
    {
      ...validBuilding,
      name: undefined,
      dynasty: null,
      earliest_dynasty: false,
      dynasty_sort: 857.5,
      address: "",
      city: 42,
      county: false,
      type: null,
      batch: "",
      batch_no: 1,
      year: Number.POSITIVE_INFINITY,
      description: "",
      desc_source: undefined,
      geo_precision: [],
      geo_source: "",
    },
  ];

  assert.deepEqual(validationIssues(input), [
    { code: "expected_string", path: "$[0].name", recordId: 1 },
    { code: "expected_string", path: "$[0].dynasty", recordId: 1 },
    {
      code: "expected_string",
      path: "$[0].earliest_dynasty",
      recordId: 1,
    },
    { code: "expected_integer", path: "$[0].dynasty_sort", recordId: 1 },
    {
      code: "expected_non_empty_string",
      path: "$[0].address",
      recordId: 1,
    },
    { code: "expected_string", path: "$[0].city", recordId: 1 },
    { code: "expected_string", path: "$[0].county", recordId: 1 },
    { code: "expected_string", path: "$[0].type", recordId: 1 },
    {
      code: "expected_non_empty_string",
      path: "$[0].batch",
      recordId: 1,
    },
    { code: "expected_string", path: "$[0].batch_no", recordId: 1 },
    { code: "expected_integer", path: "$[0].year", recordId: 1 },
    {
      code: "expected_non_empty_string",
      path: "$[0].description",
      recordId: 1,
    },
    { code: "expected_string", path: "$[0].desc_source", recordId: 1 },
    { code: "expected_string", path: "$[0].geo_precision", recordId: 1 },
    {
      code: "expected_non_empty_string",
      path: "$[0].geo_source",
      recordId: 1,
    },
  ]);
});

test("rejects unsupported behavior-driving enum values", () => {
  const input = [
    {
      ...validBuilding,
      city: "北京市",
      type: "旅游景点",
      desc_source: "generated",
      geo_precision: "exact",
    },
  ];

  assert.deepEqual(validationIssues(input), [
    { code: "unsupported_value", path: "$[0].city", recordId: 1 },
    { code: "unsupported_value", path: "$[0].type", recordId: 1 },
    { code: "unsupported_value", path: "$[0].desc_source", recordId: 1 },
    { code: "unsupported_value", path: "$[0].geo_precision", recordId: 1 },
  ]);
});

test("keeps display and provenance text open to future values", () => {
  const input = [
    {
      ...validBuilding,
      dynasty: "未来经审核的复合年代标签",
      earliest_dynasty: "未来经审核的年代标签",
      address: "新的来源地址文本",
      geo_source: "未来经审核的坐标来源",
    },
  ];

  assert.deepEqual(validateBuildings(input), { ok: true, data: input });
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

test("rejects non-integer and non-positive building identifiers", () => {
  const input = [
    { ...validBuilding, id: 1.5 },
    { ...validBuilding, id: 0 },
    { ...validBuilding, id: -2 },
  ];

  assert.deepEqual(validationIssues(input), [
    { code: "expected_positive_integer", path: "$[0].id", recordId: 1.5 },
    { code: "expected_positive_integer", path: "$[1].id", recordId: 0 },
    { code: "expected_positive_integer", path: "$[2].id", recordId: -2 },
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

test("accepts coordinates on the broad Shanxi envelope boundaries", () => {
  const input = [
    { ...validBuilding, id: 7, lng: 110.23, lat: 34.58 },
    { ...validBuilding, id: 100, lng: 114.56, lat: 40.74 },
  ];

  assert.deepEqual(validateBuildings(input), { ok: true, data: input });
});

test("rejects out-of-envelope and swapped coordinates without claiming accuracy", () => {
  const input = [
    { ...validBuilding, id: 1, lat: 41, lng: 109 },
    { ...validBuilding, id: 2, lat: 112.5, lng: 37.5 },
  ];

  const result = validateBuildings(input);
  assert.equal(result.ok, false);
  assert.deepEqual(
    result.issues.map(({ code, path, recordId }) => ({ code, path, recordId })),
    [
      { code: "coordinate_out_of_range", path: "$[0].lat", recordId: 1 },
      { code: "coordinate_out_of_range", path: "$[0].lng", recordId: 1 },
      { code: "coordinate_out_of_range", path: "$[1].lat", recordId: 2 },
      { code: "coordinate_out_of_range", path: "$[1].lng", recordId: 2 },
    ],
  );
  for (const issue of result.issues) {
    assert.match(issue.message, /does not prove coordinate accuracy/i);
  }
});

test("rejects unpaired Yingzao Society evidence", () => {
  const input = [
    { ...validBuilding, id: 1, yingzao_source: "" },
    { ...validBuilding, id: 2, yingzao: "" },
    { ...validBuilding, id: 3, yingzao: "", yingzao_source: undefined },
    { ...validBuilding, id: 4, yingzao: undefined, yingzao_source: "" },
  ];

  assert.deepEqual(validationIssues(input), [
    { code: "incomplete_pair", path: "$[0].yingzao_source", recordId: 1 },
    { code: "incomplete_pair", path: "$[1].yingzao", recordId: 2 },
    { code: "incomplete_pair", path: "$[2].yingzao_source", recordId: 3 },
    { code: "incomplete_pair", path: "$[3].yingzao", recordId: 4 },
  ]);
});

test("accepts Yingzao Society fields when both are absent", () => {
  const input = [
    { ...validBuilding, yingzao: undefined, yingzao_source: undefined },
  ];

  assert.deepEqual(validateBuildings(input), { ok: true, data: input });
});

test("rejects unsupported practical-information shapes", () => {
  const input = [
    {
      ...validBuilding,
      is_open: "yes",
      tel: 12345,
      rating: ["4.8"],
    },
  ];

  assert.deepEqual(validationIssues(input), [
    {
      code: "expected_boolean_or_null",
      path: "$[0].is_open",
      recordId: 1,
    },
    { code: "expected_string", path: "$[0].tel", recordId: 1 },
    { code: "unsupported_rating", path: "$[0].rating", recordId: 1 },
  ]);
});

test("accepts the approved practical-information compatibility forms", () => {
  const input = [
    { ...validBuilding, id: 1, is_open: true, rating: "0" },
    { ...validBuilding, id: 2, is_open: false, rating: [] },
    { ...validBuilding, id: 3, is_open: null, rating: undefined },
  ];

  assert.deepEqual(validateBuildings(input), { ok: true, data: input });
});

test("rejects invalid Wikipedia and image URLs", () => {
  const input = [
    {
      ...validBuilding,
      wiki_url: "ftp://example.com/archive",
      image: {
        ...validBuilding.image,
        url: "not a URL",
        thumb: "file:///tmp/thumb.jpg",
      },
    },
  ];

  assert.deepEqual(validationIssues(input), [
    { code: "invalid_http_url", path: "$[0].wiki_url", recordId: 1 },
    { code: "invalid_http_url", path: "$[0].image.url", recordId: 1 },
    { code: "invalid_http_url", path: "$[0].image.thumb", recordId: 1 },
  ]);
});

test("rejects invalid or incomplete image metadata", () => {
  const input = [
    {
      ...validBuilding,
      image: { url: 42, thumb: "", license: "", artist: null },
    },
  ];

  assert.deepEqual(validationIssues(input), [
    { code: "expected_string", path: "$[0].image.url", recordId: 1 },
    {
      code: "expected_non_empty_string",
      path: "$[0].image.thumb",
      recordId: 1,
    },
    {
      code: "expected_non_empty_string",
      path: "$[0].image.license",
      recordId: 1,
    },
    { code: "expected_string", path: "$[0].image.artist", recordId: 1 },
  ]);
});

test("rejects a non-object image value", () => {
  const input = [{ ...validBuilding, image: [] }];

  assert.deepEqual(validationIssues(input), [
    { code: "expected_record", path: "$[0].image", recordId: 1 },
  ]);
});
