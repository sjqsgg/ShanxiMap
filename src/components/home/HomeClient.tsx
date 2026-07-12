"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BUILDINGS, byId, groupByCity } from "@/lib/data";
import { dynastyGroup } from "@/lib/types";
import { useIsDesktop } from "@/lib/useIsDesktop";
import ArchiveBag, { EmergeFromBag } from "./ArchiveBag";
import FilterBar, { HOME_FILTER_EMPTY } from "./FilterBar";
import type { HomeFilter } from "./FilterBar";
import IndexList from "./IndexList";
import MapCanvas from "@/components/map/MapCanvas";
import PreviewDrawer from "@/components/map/PreviewDrawer";

/** 首页：档案袋 → 地图 + 索引列表 + 预览抽屉 */
export default function HomeClient() {
  const [filter, setFilter] = useState<HomeFilter>(HOME_FILTER_EMPTY);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const mapSecRef = useRef<HTMLElement>(null);
  const desktop = useIsDesktop();

  const filtered = useMemo(
    () =>
      BUILDINGS.filter((b) => {
        if (filter.type && b.type !== filter.type) return false;
        if (filter.tier && b.tier !== filter.tier) return false;
        if (filter.city && b.city !== filter.city) return false;
        if (filter.dynasty && dynastyGroup(b) !== filter.dynasty) return false;
        return true;
      }),
    [filter]
  );

  const groups = useMemo(() => groupByCity(filtered), [filtered]);
  const selected = selectedId ? (byId(selectedId) ?? null) : null;

  const onSelect = useCallback((id: number | null) => setSelectedId(id), []);
  // 索引列表点击：滚回地图区 + 选中（地图flyTo + 抽屉滑入）
  const pickFromIndex = useCallback((id: number) => {
    setSelectedId(id);
    mapSecRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <>
      <ArchiveBag />

      <EmergeFromBag>
        {/* 地图区：占满视口，顶部筛选栏 */}
        <section
          id="map"
          ref={mapSecRef}
          className="relative flex h-dvh scroll-mt-[42px] flex-col border-y border-line bg-paper"
        >
          <FilterBar filter={filter} onChange={setFilter} count={filtered.length} />
          <motion.div
            className="relative flex-1"
            animate={{ x: selected && desktop ? "-15vw" : "0vw" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <MapCanvas
              buildings={filtered}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          </motion.div>
          {/* 图例 */}
          <div className="pointer-events-none absolute bottom-2 left-2 z-10 hidden sm:block">
            <div className="frosted border border-line px-3 py-2 font-mono text-[10px] leading-relaxed text-ink-soft">
              <span className="mr-1 inline-block h-3 w-3 rounded-full bg-[#8B1A1A] align-[-2px]" />
              必去
              <span className="ml-3 mr-1 inline-block h-2.5 w-2.5 rounded-full bg-[#8B5E3C] align-[-1px]" />
              推荐
              <span className="ml-3 mr-1 inline-block h-2 w-2 rounded-full bg-[#999990]" />
              小众
              <span className="ml-3 mr-1 inline-block h-2 w-2 rotate-45 bg-[#999990]" />
              石窟
              <span className="ml-3 border border-seal px-1 text-seal">测</span>
              营造学社
            </div>
          </div>
        </section>

        {/* 索引列表 */}
        <IndexList groups={groups} onPick={pickFromIndex} />
      </EmergeFromBag>

      {/* 预览抽屉（fixed，必须在transform容器之外） */}
      <PreviewDrawer building={selected} onClose={() => onSelect(null)} />
    </>
  );
}
