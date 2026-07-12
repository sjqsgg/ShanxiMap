"use client";

import type { Tier } from "@/lib/types";
import { CITIES, DYNASTY_GROUPS } from "@/lib/types";

export type HomeFilter = {
  dynasty: string | null;
  city: string | null;
  type: string | null;
  tier: Tier | null;
};

export const HOME_FILTER_EMPTY: HomeFilter = {
  dynasty: null,
  city: null,
  type: null,
  tier: null,
};

const TYPES = ["古建筑", "石窟寺及石刻", "古遗址", "古墓葬", "近现代/革命史迹"];
const TIERS: Tier[] = ["必去", "推荐", "小众"];

function Row({
  label,
  options,
  value,
  onPick,
  short,
}: {
  label: string;
  options: readonly string[];
  value: string | null;
  onPick: (v: string | null) => void;
  short?: (v: string) => string;
}) {
  const btn = (active: boolean) =>
    `shrink-0 px-2 py-0.5 font-mono text-[11px] transition-colors ${
      active
        ? "bg-ink text-paper-card"
        : "text-ink-soft hover:text-cinnabar"
    }`;
  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-line/70 px-3 py-1.5 last:border-b-0 sm:px-4">
      <span className="w-10 shrink-0 font-mono text-[10px] tracking-widest text-ink-faint">
        {label}
      </span>
      <button className={btn(value === null)} onClick={() => onPick(null)}>
        全部
      </button>
      {options.map((o) => (
        <button key={o} className={btn(value === o)} onClick={() => onPick(o)}>
          {short ? short(o) : o}
        </button>
      ))}
    </div>
  );
}

/** 首页地图区顶部筛选栏：朝代 / 地市 / 类型 / 访古等级（单选） */
export default function FilterBar({
  filter,
  onChange,
  count,
}: {
  filter: HomeFilter;
  onChange: (f: HomeFilter) => void;
  count: number;
}) {
  return (
    <div className="frosted border-b border-line">
      <div className="flex items-center justify-between border-b border-line/70 px-3 py-1.5 font-mono text-[10px] tracking-widest text-ink-faint sm:px-4">
        <span>[ 检索条件 ]</span>
        <span>命中 {count} 处</span>
      </div>
      <Row
        label="朝代"
        options={DYNASTY_GROUPS}
        value={filter.dynasty}
        onPick={(v) => onChange({ ...filter, dynasty: v })}
      />
      <Row
        label="地市"
        options={CITIES}
        value={filter.city}
        onPick={(v) => onChange({ ...filter, city: v })}
        short={(c) => c.replace("市", "")}
      />
      <Row
        label="类型"
        options={TYPES}
        value={filter.type}
        onPick={(v) => onChange({ ...filter, type: v })}
        short={(t) => (t === "近现代/革命史迹" ? "近现代" : t)}
      />
      <Row
        label="等级"
        options={TIERS}
        value={filter.tier}
        onPick={(v) => onChange({ ...filter, tier: v as Tier | null })}
      />
    </div>
  );
}
