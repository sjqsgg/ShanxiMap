import assert from "node:assert/strict";
import test from "node:test";

import { groupByCity } from "./data";
import type { Building } from "./types";

function building(
  id: number,
  name: string,
  dynastySort: number,
  tier: Building["tier"],
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
    tier,
    lat: 37.8,
    lng: 112.5,
    description: "测试地点档案",
  };
}

test("city groups sort archives by chronology, name, and stable ID", () => {
  const groups = groupByCity([
    building(5, "Later", 200, "必去"),
    building(9, "Beta", 100, "推荐"),
    building(7, "Alpha", 100, "必去"),
    building(3, "Alpha", 100, "可选"),
  ]);

  assert.deepEqual(
    groups[0]?.[1].map(({ id }) => id),
    [3, 7, 9, 5],
  );
});
