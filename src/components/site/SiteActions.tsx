"use client";

import { useState } from "react";
import type { Building } from "@/lib/types";

/** 详情页操作行：复制坐标 / 高德导航 / 坐标系标注 */
export default function SiteActions({ b }: { b: Building }) {
  const [copied, setCopied] = useState(false);
  const coord = `${b.lat.toFixed(6)}, ${b.lng.toFixed(6)}`;
  const navUrl = `https://uri.amap.com/marker?position=${b.lng},${b.lat}&name=${encodeURIComponent(
    b.name
  )}&coordinate=gaode&callnative=1`;

  return (
    <div className="flex items-center gap-3">
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
        className="border border-line-strong px-4 py-2 font-mono text-xs text-ink-soft transition-colors hover:border-ink hover:text-ink"
      >
        {copied ? "已复制 ✓" : "复制坐标"}
      </button>
      <a
        href={navUrl}
        target="_blank"
        rel="noreferrer"
        className="border border-cinnabar bg-cinnabar px-4 py-2 font-mono text-xs text-paper-card transition-opacity hover:opacity-85"
      >
        高德导航 →
      </a>
      <span className="ml-auto font-mono text-[10px] text-ink-faint">
        GCJ-02
      </span>
    </div>
  );
}
