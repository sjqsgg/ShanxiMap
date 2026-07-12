"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BUILDINGS, byId } from "@/lib/data";
import type { Building, Tier } from "@/lib/types";
import { DEFAULT_TYPES, dynastyGroup } from "@/lib/types";
import MapCanvas from "./MapCanvas";
import FilterPanel from "./FilterPanel";
import Sidebar from "./Sidebar";
import DetailCard from "./DetailCard";

export type Filters = {
  dynasties: string[];
  cities: string[];
  tiers: Tier[];
  types: string[];
  yingzao: boolean;
  q: string;
};

const EMPTY: Filters = {
  dynasties: [],
  cities: [],
  tiers: [],
  types: Array.from(DEFAULT_TYPES),
  yingzao: false,
  q: "",
};

function parseFilters(sp: URLSearchParams): Filters {
  const list = (k: string) =>
    sp.get(k)?.split(",").filter(Boolean) ?? [];
  const types = list("type");
  return {
    dynasties: list("dyn"),
    cities: list("city"),
    tiers: list("tier") as Tier[],
    types: types.length ? types : EMPTY.types,
    yingzao: sp.get("yz") === "1",
    q: sp.get("q") ?? "",
  };
}

export default function MapApp() {
  const router = useRouter();
  const sp = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() => parseFilters(sp));
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    const id = Number(sp.get("id"));
    return Number.isFinite(id) && id > 0 ? id : null;
  });
  const [panelOpen, setPanelOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  // 从URL打开某个点时，把它所属类型自动并入筛选，避免"点开却看不见"
  const initial = useRef(true);
  useEffect(() => {
    if (!initial.current) return;
    initial.current = false;
    if (selectedId) {
      const b = byId(selectedId);
      if (b && !filters.types.includes(b.type)) {
        setFilters((f) => ({ ...f, types: [...f.types, b.type] }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // URL 同步（replace，不产生历史记录）
  useEffect(() => {
    const p = new URLSearchParams();
    if (selectedId) p.set("id", String(selectedId));
    if (filters.dynasties.length) p.set("dyn", filters.dynasties.join(","));
    if (filters.cities.length) p.set("city", filters.cities.join(","));
    if (filters.tiers.length) p.set("tier", filters.tiers.join(","));
    const defaultTypes =
      filters.types.length === EMPTY.types.length &&
      EMPTY.types.every((t) => filters.types.includes(t));
    if (!defaultTypes) p.set("type", filters.types.join(","));
    if (filters.yingzao) p.set("yz", "1");
    if (filters.q) p.set("q", filters.q);
    const qs = p.toString();
    router.replace(`/map${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [filters, selectedId, router]);

  const filtered = useMemo(() => {
    const q = filters.q.trim();
    return BUILDINGS.filter((b) => {
      if (!filters.types.includes(b.type)) return false;
      if (filters.tiers.length && !filters.tiers.includes(b.tier)) return false;
      if (filters.cities.length && !filters.cities.includes(b.city))
        return false;
      if (filters.dynasties.length) {
        const g = dynastyGroup(b);
        if (!g || !filters.dynasties.includes(g)) return false;
      }
      if (filters.yingzao && !b.yingzao) return false;
      if (q && !`${b.name}${b.city}${b.county}${b.dynasty}`.includes(q))
        return false;
      return true;
    });
  }, [filters]);

  const selected = selectedId ? byId(selectedId) ?? null : null;
  const onSelect = useCallback((id: number | null) => setSelectedId(id), []);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-paper">
      <MapCanvas
        buildings={filtered}
        selectedId={selectedId}
        onSelect={onSelect}
      />

      {/* 顶栏 */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-2 p-3 sm:p-4">
        <div className="pointer-events-auto frosted flex items-center gap-2 border border-line px-3 py-2 sm:gap-3 sm:px-4">
          <Link
            href="/"
            className="shrink-0 font-mono text-[11px] text-ink-faint transition-colors hover:text-cinnabar"
          >
            ← 档案馆
          </Link>
          <span className="hidden font-serif text-sm font-bold text-ink sm:inline">
            山西访古档案
          </span>
          <input
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            placeholder="检索名称 / 区县 / 朝代…"
            className="min-w-0 flex-1 border-b border-line bg-transparent px-1 py-1 font-serif text-sm text-ink outline-none placeholder:text-ink-faint focus:border-cinnabar"
          />
          <button
            onClick={() => setPanelOpen((v) => !v)}
            className={`shrink-0 border px-2.5 py-1 font-mono text-[11px] transition-colors ${
              panelOpen
                ? "border-cinnabar bg-cinnabar text-paper-card"
                : "border-line-strong text-ink-soft hover:border-cinnabar hover:text-cinnabar"
            }`}
          >
            筛选
          </button>
          <button
            onClick={() => setListOpen((v) => !v)}
            className={`shrink-0 border px-2.5 py-1 font-mono text-[11px] transition-colors ${
              listOpen
                ? "border-ink bg-ink text-paper-card"
                : "border-line-strong text-ink-soft hover:border-ink"
            }`}
          >
            列表 {filtered.length}
          </button>
        </div>
        {panelOpen && (
          <FilterPanel filters={filters} onChange={setFilters} />
        )}
      </header>

      {/* 列表侧栏 */}
      {listOpen && (
        <Sidebar
          buildings={filtered}
          selectedId={selectedId}
          onSelect={(id) => {
            onSelect(id);
          }}
          onClose={() => setListOpen(false)}
        />
      )}

      {/* 档案卡 */}
      {selected && (
        <DetailCard building={selected} onClose={() => onSelect(null)} />
      )}

      {/* 图例 */}
      <div className="pointer-events-none absolute bottom-2 right-2 z-10 hidden sm:block">
        <div className="frosted border border-line px-3 py-2 font-mono text-[10px] leading-relaxed text-ink-soft">
          <p>
            <span className="mr-1 inline-block h-3 w-3 rounded-full bg-cinnabar align-[-2px]" />
            必去
            <span className="ml-3 mr-1 inline-block h-2.5 w-2.5 rounded-full bg-ochre align-[-1px]" />
            推荐
            <span className="ml-3 mr-1 inline-block h-2 w-2 rounded-full bg-stone" />
            小众
            <span className="ml-3 border border-seal px-1 text-seal">测</span>
            营造学社
          </p>
        </div>
      </div>
    </div>
  );
}
