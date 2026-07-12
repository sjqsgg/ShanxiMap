"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { Building } from "@/lib/types";
import { archiveNo } from "@/lib/types";

export const DRAWER_WIDTH = "clamp(280px, 30vw, 420px)";

function Actions({ b }: { b: Building }) {
  const [copied, setCopied] = useState(false);
  const coord = `${b.lat.toFixed(6)}, ${b.lng.toFixed(6)}`;
  const navUrl = `https://uri.amap.com/marker?position=${b.lng},${b.lat}&name=${encodeURIComponent(
    b.name
  )}&coordinate=gaode&callnative=1`;
  return (
    <div className="flex items-center gap-2 border-t border-line px-4 py-3">
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(coord);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          } catch {
            /* 剪贴板不可用时静默失败 */
          }
        }}
        className="border border-line-strong px-3 py-1.5 font-mono text-[11px] text-ink-soft transition-colors hover:border-ink hover:text-ink"
      >
        {copied ? "已复制 ✓" : "复制坐标"}
      </button>
      <a
        href={navUrl}
        target="_blank"
        rel="noreferrer"
        className="border border-cinnabar bg-cinnabar px-3 py-1.5 font-mono text-[11px] text-paper-card transition-opacity hover:opacity-85"
      >
        高德导航 →
      </a>
      <span className="ml-auto font-mono text-[9px] text-ink-faint">
        GCJ-02
      </span>
    </div>
  );
}

/** 右侧预览抽屉：点击地图标记/索引建筑名滑入 */
export default function PreviewDrawer({
  building,
  onClose,
}: {
  building: Building | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {building && (
        <motion.aside
          key="drawer"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed inset-y-0 right-0 z-[60] flex w-[85vw] flex-col border-l border-line-strong bg-paper paper-grain shadow-[-6px_0_24px_rgba(61,49,32,0.12)] sm:w-[clamp(280px,30vw,420px)]"
        >
          {/* 顶部操作行 */}
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <Link
              href={`/site/${building.id}`}
              className="font-mono text-[11px] tracking-wider text-ink-soft transition-colors hover:text-cinnabar"
            >
              查看完整档案 →
            </Link>
            <button
              onClick={onClose}
              aria-label="关闭预览"
              className="border border-line px-2 py-0.5 text-sm leading-none text-ink-soft transition-colors hover:border-cinnabar hover:text-cinnabar"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* 缩略图占位（16:9） */}
            <div className="relative flex aspect-video items-center justify-center border-b border-line bg-paper-deep">
              <span className="font-serif text-lg text-ink-faint">
                {building.name}
              </span>
              <span className="absolute bottom-2 right-3 font-mono text-[9px] tracking-wider text-ink-faint">
                [ 影像待补 ]
              </span>
            </div>

            <div className="px-4 py-3">
              {/* 档案头 */}
              <div className="flex items-center gap-2 font-mono text-[10px] tracking-wider text-ink-faint">
                <span>{archiveNo(building.id)}</span>
                <span className="dotted-rule h-[1em] flex-1" />
                <span>
                  {building.batch} · {building.year}年公布
                </span>
              </div>

              <div className="mt-3 flex items-start justify-between gap-3">
                <h2 className="font-serif text-2xl font-bold leading-snug text-ink">
                  {building.name}
                </h2>
                <span className="seal-stamp h-11 w-11 shrink-0 text-[13px]">
                  {building.tier}
                </span>
              </div>

              <p className="mt-2 font-mono text-[11px] text-ink-soft">
                {building.dynasty} · {building.city}
                {building.county} · {building.type}
              </p>

              {building.yingzao && (
                <p className="mt-3 inline-block border border-seal/40 bg-seal/5 px-2 py-1 font-mono text-[10px] tracking-wide text-seal">
                  中国营造学社 · {building.yingzao}　{building.yingzao_source}
                </p>
              )}

              {building.description && (
                <div className="relative mt-4 border-t border-dashed border-line pt-3">
                  <p className="max-h-[6.4em] overflow-hidden font-serif text-[13.5px] leading-relaxed text-ink-soft">
                    {building.description}
                  </p>
                  {/* 渐变遮罩截断，不用省略号 */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-paper to-transparent" />
                </div>
              )}

              {building.geo_precision !== "high" && (
                <p className="mt-3 font-mono text-[10px] text-ochre">
                  ⚠ 坐标为
                  {building.geo_precision === "county" ? "区县" : "村镇"}
                  级近似，实地前请再核实
                </p>
              )}
            </div>
          </div>

          <Actions b={building} />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
