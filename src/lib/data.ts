import raw from "@/data/buildings.json";
import type { Building } from "./types";

export const BUILDINGS: Building[] = raw as unknown as Building[];

export const MUST_SEE: Building[] = BUILDINGS.filter(
  (b) => b.tier === "必去"
).sort((a, b) => a.dynasty_sort - b.dynasty_sort);

export function byId(id: number): Building | undefined {
  return BUILDINGS.find((b) => b.id === id);
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
