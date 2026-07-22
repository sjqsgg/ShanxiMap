import assert from "node:assert/strict";
import test from "node:test";

import { groupByCity, loadBuildings } from "./data";
import type { Building } from "./types";

function building(
  id: number,
  name: string,
  dynastySort: number,
): Building {
  return {
    id,
    name,
    dynasty: "唐",
    earliest_dynasty: "唐",
    dynasty_sort: dynastySort,
    address: "山西省",
    city: "太原市",
    county: "",
    type: "古建筑",
    batch: "第一批全国重点文物保护单位",
    batch_no: "",
    year: 1961,
    lat: 37.8,
    lng: 112.5,
    description: "测试地点档案",
    desc_source: "manual",
    geo_precision: "high",
    geo_source: "测试坐标",
  };
}

test("city groups sort archives by chronology, name, and stable ID", () => {
  const groups = groupByCity([
    building(5, "Later", 200),
    building(9, "Beta", 100),
    building(7, "Alpha", 100),
    building(3, "Alpha", 100),
  ]);

  assert.deepEqual(
    groups[0]?.[1].map(({ id }) => id),
    [3, 7, 9, 5],
  );
});

test("application loading rejects invalid runtime data with every issue summary", () => {
  const input = [
    {
      ...building(1, "佛光寺", 857),
      name: undefined,
      tier: "must_visit",
    },
  ];

  assert.throws(
    () => loadBuildings(input),
    new Error(
      [
        "Invalid building runtime data:",
        '$[0].tier (id 1): Unknown building field "tier".',
        "$[0].name (id 1): Expected a string.",
      ].join("\n"),
    ),
  );
});
