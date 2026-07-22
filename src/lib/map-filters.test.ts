import assert from "node:assert/strict";
import test from "node:test";

import type { Building } from "./types";
import {
  filterBuildingsByMapFilters,
  parseMapFilters,
  serializeMapFilters,
} from "./map-filters";

function building(id: number, type: Building["type"] = "古建筑"): Building {
  return {
    id,
    name: `地点 ${id}`,
    dynasty: "唐",
    earliest_dynasty: "唐",
    dynasty_sort: 618,
    address: "山西省",
    city: "太原市",
    county: "",
    type,
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

test("legacy tier query state is ignored and is not shared again", () => {
  const filters = parseMapFilters(
    new URLSearchParams("tier=必去,推荐&dyn=唐&city=太原市"),
  );

  assert.deepEqual(filters.dynasties, ["唐"]);
  assert.deepEqual(filters.cities, ["太原市"]);
  assert.equal(serializeMapFilters(filters).has("tier"), false);
});

test("map discovery returns every archive matching factual filters", () => {
  const filters = parseMapFilters(new URLSearchParams("type=古建筑"));
  const matches = filterBuildingsByMapFilters(
    [building(1), building(2), building(3, "古遗址")],
    filters,
  );

  assert.deepEqual(
    matches.map(({ id }) => id),
    [1, 2],
  );
});
