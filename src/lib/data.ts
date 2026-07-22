import raw from "@/data/buildings.json";
import { CITY_ORDER, type Building } from "./types";
import {
  formatBuildingValidationIssue,
  validateBuildings,
} from "./validate-buildings";

export function loadBuildings(input: unknown): Building[] {
  const result = validateBuildings(input);
  if (result.ok) return result.data;

  throw new Error(
    [
      "Invalid building runtime data:",
      ...result.issues.map(formatBuildingValidationIssue),
    ].join("\n"),
  );
}

export const BUILDINGS = loadBuildings(raw);

export function byId(id: number): Building | undefined {
  return BUILDINGS.find((b) => b.id === id);
}

/** 首页索引：按地市分组（数量降序），组内按年代→名称→稳定 ID 排序 */
export function groupByCity(list: Building[]): [string, Building[]][] {
  return CITY_ORDER.map((city) => {
    const items = list
      .filter((b) => b.city === city)
      .sort(
        (a, b) =>
          a.dynasty_sort - b.dynasty_sort ||
          a.name.localeCompare(b.name, "zh-CN") ||
          a.id - b.id
      );
    return [city, items] as [string, Building[]];
  }).filter(([, items]) => items.length > 0);
}

/** 球面距离（km） */
export function distanceKm(a: Building, b: Building): number {
  const R = 6371;
  const rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** 距离最近的古建（供详情页"附近古建筑"，只列古建筑与石窟） */
export function nearby(b: Building, n = 4): { b: Building; km: number }[] {
  return BUILDINGS.filter(
    (x) =>
      x.id !== b.id && ["古建筑", "石窟寺及石刻", "其他"].includes(x.type)
  )
    .map((x) => ({ b: x, km: distanceKm(b, x) }))
    .sort((a, c) => a.km - c.km)
    .slice(0, n);
}

export const STATS = {
  total: BUILDINGS.length,
  tang: BUILDINGS.filter(
    (b) => b.earliest_dynasty === "唐" && b.type === "古建筑"
  ).length,
  songjin: BUILDINGS.filter((b) =>
    ["宋", "北宋", "金", "辽", "五代"].includes(b.earliest_dynasty)
  ).length,
  yuan: BUILDINGS.filter((b) => b.earliest_dynasty === "元").length,
  mingqing: BUILDINGS.filter((b) =>
    ["明", "清", "明清"].includes(b.earliest_dynasty)
  ).length,
  yingzao: BUILDINGS.filter((b) => b.yingzao).length,
};
