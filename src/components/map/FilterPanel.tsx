"use client";

import type { Filters } from "./MapApp";
import type { Tier } from "@/lib/types";
import { CITIES, DYNASTY_GROUPS, TYPE_GROUPS } from "@/lib/types";

const TIERS: Tier[] = ["必去", "推荐", "小众", "可选"];

function Chip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`border px-2.5 py-1 font-mono text-[11px] transition-colors ${
        active
          ? "border-cinnabar bg-cinnabar text-paper-card"
          : "border-line-strong bg-paper-card/60 text-ink-soft hover:border-cinnabar hover:text-cinnabar"
      }`}
    >
      {label}
    </button>
  );
}

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

export default function FilterPanel({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  const row = "flex flex-wrap items-center gap-1.5";
  const label =
    "w-14 shrink-0 font-mono text-[11px] tracking-widest text-ink-faint";
  return (
    <div className="pointer-events-auto frosted max-h-[55vh] overflow-y-auto border border-line px-4 py-3">
      <div className="flex flex-col gap-2.5">
        <div className={row}>
          <span className={label}>等级</span>
          {TIERS.map((t) => (
            <Chip
              key={t}
              label={t}
              active={filters.tiers.includes(t)}
              onClick={() =>
                onChange({ ...filters, tiers: toggle(filters.tiers, t) })
              }
            />
          ))}
        </div>
        <div className={row}>
          <span className={label}>朝代</span>
          {DYNASTY_GROUPS.map((d) => (
            <Chip
              key={d}
              label={d}
              active={filters.dynasties.includes(d)}
              onClick={() =>
                onChange({
                  ...filters,
                  dynasties: toggle(filters.dynasties, d),
                })
              }
            />
          ))}
        </div>
        <div className={row}>
          <span className={label}>地市</span>
          {CITIES.map((c) => (
            <Chip
              key={c}
              label={c.replace("市", "")}
              active={filters.cities.includes(c)}
              onClick={() =>
                onChange({ ...filters, cities: toggle(filters.cities, c) })
              }
            />
          ))}
        </div>
        <div className={row}>
          <span className={label}>类型</span>
          {TYPE_GROUPS.map((t) => (
            <Chip
              key={t}
              label={t === "近现代/革命史迹" ? "近现代" : t}
              active={filters.types.includes(t)}
              onClick={() =>
                onChange({ ...filters, types: toggle(filters.types, t) })
              }
            />
          ))}
        </div>
        <div className={row}>
          <span className={label}>专题</span>
          <Chip
            label="营造学社足迹（梁思成·林徽因）"
            active={filters.yingzao}
            onClick={() => onChange({ ...filters, yingzao: !filters.yingzao })}
          />
          <button
            onClick={() =>
              onChange({
                dynasties: [],
                cities: [],
                tiers: [],
                types: ["古建筑", "石窟寺及石刻", "其他"],
                yingzao: false,
                q: "",
              })
            }
            className="ml-auto font-mono text-[11px] text-ink-faint underline-offset-2 hover:text-cinnabar hover:underline"
          >
            重置
          </button>
        </div>
      </div>
    </div>
  );
}
