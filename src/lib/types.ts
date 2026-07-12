export type Tier = "必去" | "推荐" | "小众" | "可选";

export type Building = {
  id: number;
  name: string;
  dynasty: string;
  earliest_dynasty: string;
  dynasty_sort: number;
  address: string;
  city: string;
  county: string;
  type: string;
  batch: string;
  batch_no: string;
  year: number;
  tier: Tier;
  lat: number;
  lng: number;
  description: string;
  desc_source?: "manual" | "template";
  geo_precision?: "high" | "approx" | "county";
  yingzao?: string;
  yingzao_source?: string;
};

export const TIER_COLOR: Record<Tier, string> = {
  必去: "#8B1A1A",
  推荐: "#8B5E3C",
  小众: "#999990",
  可选: "#b8b2a2",
};

/** 朝代筛选分组：把 北宋 归入 宋，近现代/明清等特殊值单独处理 */
export const DYNASTY_GROUPS = [
  "唐",
  "五代",
  "辽",
  "宋",
  "金",
  "元",
  "明",
  "清",
] as const;

export function dynastyGroup(b: Building): string | null {
  const d = b.earliest_dynasty;
  if (d === "北宋") return "宋";
  if (d === "明清") return "明";
  if ((DYNASTY_GROUPS as readonly string[]).includes(d)) return d;
  return null;
}

export const CITIES = [
  "太原市",
  "大同市",
  "朔州市",
  "忻州市",
  "阳泉市",
  "吕梁市",
  "晋中市",
  "长治市",
  "晋城市",
  "临汾市",
  "运城市",
] as const;

/** 首页索引列表的地市顺序（按国保数量降序） */
export const CITY_ORDER = [
  "运城市",
  "长治市",
  "晋城市",
  "晋中市",
  "临汾市",
  "吕梁市",
  "忻州市",
  "太原市",
  "大同市",
  "阳泉市",
  "朔州市",
] as const;

export const TIER_RANK: Record<Tier, number> = {
  必去: 0,
  推荐: 1,
  小众: 2,
  可选: 3,
};

export const TYPE_GROUPS = [
  "古建筑",
  "石窟寺及石刻",
  "古遗址",
  "古墓葬",
  "近现代/革命史迹",
] as const;

/** 地图默认显示的类型 */
export const DEFAULT_TYPES = new Set(["古建筑", "石窟寺及石刻", "其他"]);

export function archiveNo(id: number): string {
  return `档案 ${String(id).padStart(3, "0")}`;
}
