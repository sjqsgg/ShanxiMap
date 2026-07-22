"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { BUILDINGS, byId } from "@/lib/data";
import {
  filterBuildingsByMapFilters,
  parseMapFilters,
  serializeMapFilters,
} from "@/lib/map-filters";
import type { MapFilters } from "@/lib/map-filters";
import { useIsDesktop } from "@/lib/useIsDesktop";
import MapCanvas from "./MapCanvas";
import FilterPanel from "./FilterPanel";
import MapLegend from "./MapLegend";
import Sidebar from "./Sidebar";
import PreviewDrawer from "./PreviewDrawer";

export default function MapApp() {
  const router = useRouter();
  const sp = useSearchParams();
  const [filters, setFilters] = useState<MapFilters>(() => parseMapFilters(sp));
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

  // URL 同步（replace，不产生历史记录）；详情深链已迁移至 /site/[id]，不再写 id
  useEffect(() => {
    const p = serializeMapFilters(filters);
    const qs = p.toString();
    router.replace(`/map${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [filters, selectedId, router]);

  const filtered = useMemo(
    () => filterBuildingsByMapFilters(BUILDINGS, filters),
    [filters],
  );

  const selected = selectedId ? byId(selectedId) ?? null : null;
  const onSelect = useCallback((id: number | null) => setSelectedId(id), []);
  const desktop = useIsDesktop();

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-paper">
      <motion.div
        className="absolute inset-0"
        animate={{ x: selected && desktop ? "-15vw" : "0vw" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        <MapCanvas
          buildings={filtered}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      </motion.div>

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

      {/* 预览抽屉 */}
      <PreviewDrawer building={selected} onClose={() => onSelect(null)} />

      <MapLegend />
    </div>
  );
}
