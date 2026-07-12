"use client";

import { useState } from "react";
import type { Building } from "@/lib/types";
import { archiveNo } from "@/lib/types";

export default function DetailCard({
  building: b,
  onClose,
}: {
  building: Building;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const coord = `${b.lat.toFixed(6)}, ${b.lng.toFixed(6)}`;
  const navUrl = `https://uri.amap.com/marker?position=${b.lng},${b.lat}&name=${encodeURIComponent(
    b.name
  )}&coordinate=gaode&callnative=1`;

  return (
    <div className="pointer-events-auto absolute bottom-0 left-0 z-40 w-full sm:bottom-6 sm:left-4 sm:w-[380px]">
      <article className="frosted-card border border-line-strong shadow-[4px_6px_0_rgba(120,100,60,0.1)]">
        {/* 档案表头 */}
        <div className="flex items-center gap-2 border-b border-dashed border-line px-4 py-2 font-mono text-[10px] tracking-wider text-ink-faint">
          <span>{archiveNo(b.id)}</span>
          <span className="dotted-rule h-[1em] flex-1" />
          <span>
            {b.batch} · {b.year}年公布
          </span>
          <button
            onClick={onClose}
            className="ml-1 px-1 text-sm text-ink-soft hover:text-cinnabar"
            aria-label="关闭档案卡"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[52dvh] overflow-y-auto px-4 py-3 sm:max-h-[60vh]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl font-bold leading-snug text-ink">
                {b.name}
              </h2>
              <p className="mt-1.5 font-mono text-[11px] text-ink-soft">
                {b.dynasty} · {b.city}
                {b.county} · {b.type}
              </p>
            </div>
            <span className="seal-stamp h-11 w-11 shrink-0 text-[13px]">
              {b.tier}
            </span>
          </div>

          {b.description && (
            <p className="mt-3 font-serif text-[13.5px] leading-relaxed text-ink-soft">
              {b.description}
            </p>
          )}

          {b.yingzao && (
            <div className="mt-3 border border-seal/40 bg-seal/5 px-3 py-2">
              <p className="font-mono text-[10px] tracking-wider text-seal">
                中国营造学社 · {b.yingzao}
              </p>
              <p className="mt-0.5 font-serif text-xs text-ink-soft">
                {b.yingzao_source}
              </p>
            </div>
          )}

          {b.geo_precision !== "high" && (
            <p className="mt-3 font-mono text-[10px] text-ochre">
              ⚠ 坐标为{b.geo_precision === "county" ? "区县" : "村镇"}
              级近似，实地前请再核实
            </p>
          )}

          <div className="mb-1 mt-4 flex items-center gap-2">
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
              {copied ? "已复制 ✓" : `复制坐标`}
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
        </div>
      </article>
    </div>
  );
}
