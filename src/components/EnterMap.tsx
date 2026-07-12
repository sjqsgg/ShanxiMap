"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/** 磨砂玻璃过渡段：滚动进入视野时逐渐"擦亮"，引导进入完整地图 */
export default function EnterMap({ total }: { total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.9)));
      setProgress(p);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const blur = 18 - progress * 14;

  return (
    <div ref={ref} className="relative overflow-hidden border-y border-line">
      {/* 底层：山西轮廓与点阵示意 */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <svg viewBox="0 0 300 400" className="h-[90%] opacity-70" aria-hidden>
          <path
            d="M96,22 C120,10 150,26 162,44 C178,68 210,64 224,88 C240,116 228,150 238,182 C248,216 240,254 228,288 C216,322 196,352 164,368 C136,382 104,372 88,344 C70,314 78,276 66,242 C54,206 40,170 52,134 C62,102 74,36 96,22 Z"
            fill="rgba(236,226,201,0.9)"
            stroke="#b5a582"
            strokeWidth="1.5"
          />
          {[
            [150, 70], [128, 110], [168, 120], [110, 160], [150, 170],
            [190, 180], [96, 210], [140, 220], [180, 240], [120, 260],
            [160, 280], [200, 270], [104, 300], [148, 316], [186, 320],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={i % 5 === 0 ? 5 : 3}
              fill={i % 5 === 0 ? "#b03a2e" : i % 3 === 0 ? "#c87f41" : "#a89a7e"}
            />
          ))}
        </svg>
      </div>
      {/* 磨砂层：随滚动变透明 */}
      <div
        className="relative flex min-h-[70vh] flex-col items-center justify-center px-6 py-24 text-center"
        style={{
          backdropFilter: `blur(${blur}px) saturate(1.05)`,
          WebkitBackdropFilter: `blur(${blur}px) saturate(1.05)`,
          background: `rgba(243,236,220,${0.72 - progress * 0.35})`,
        }}
      >
        <p className="font-mono text-xs tracking-[0.3em] text-ink-faint">
          [ 卷宗 B–D · 其余 {total - 21} 处 ]
        </p>
        <h2 className="mt-6 font-serif text-4xl font-bold text-ink sm:text-5xl">
          完整档案，在地图上
        </h2>
        <p className="mt-4 max-w-md font-serif text-sm leading-relaxed text-ink-soft">
          按朝代、地市、访古等级筛选全部 {total} 处档案，
          追随营造学社的足迹，或钻进浊漳河谷寻找无人知晓的五代小庙。
        </p>
        <Link
          href="/map"
          className="mt-10 border-2 border-ink bg-paper-card px-10 py-4 font-serif text-lg font-bold text-ink transition-colors hover:border-cinnabar hover:bg-cinnabar hover:text-paper-card"
        >
          进入完整档案 →
        </Link>
      </div>
    </div>
  );
}
