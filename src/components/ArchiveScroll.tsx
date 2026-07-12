"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Building } from "@/lib/types";
import { archiveNo } from "@/lib/types";

/** 21张必去档案卡：滚动时依次滑出（IntersectionObserver + 状态驱动） */
export default function ArchiveScroll({ buildings }: { buildings: Building[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState<Set<number>>(new Set());

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let raf = 0;
    const check = () => {
      raf = 0;
      const cards = root.querySelectorAll<HTMLElement>("[data-card]");
      const vh = window.innerHeight;
      const ids: number[] = [];
      cards.forEach((c) => {
        const r = c.getBoundingClientRect();
        if (r.top < vh - 60 && r.bottom > 0) ids.push(Number(c.dataset.card));
      });
      if (ids.length)
        setShown((prev) => {
          if (ids.every((i) => prev.has(i))) return prev;
          const next = new Set(prev);
          ids.forEach((i) => next.add(i));
          return next;
        });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section ref={ref} className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
      <div className="mb-10 flex items-baseline gap-3 font-mono text-xs tracking-widest text-ink-faint">
        <span>卷宗 A</span>
        <span className="dotted-rule h-[1em] flex-1" />
        <span>必去 · {buildings.length} 处</span>
      </div>
      <div className="flex flex-col gap-8">
        {buildings.map((b, i) => {
          const isShown = shown.has(i);
          return (
            <Link
              key={b.id}
              href={`/map?id=${b.id}`}
              data-card={i}
              className="group block"
              style={{
                opacity: isShown ? 1 : 0,
                transform: isShown
                  ? `translateY(0) rotate(${i % 2 === 0 ? -0.6 : 0.7}deg)`
                  : "translateY(48px) rotate(0deg)",
                transition: `opacity 0.7s ease-out ${(i % 3) * 90}ms, transform 0.7s ease-out ${(i % 3) * 90}ms`,
              }}
            >
              <article className="border border-line-strong bg-paper-card p-5 shadow-[3px_4px_0_rgba(120,100,60,0.08)] transition-shadow group-hover:shadow-[5px_7px_0_rgba(176,58,46,0.12)] sm:p-6">
                <div className="flex items-center justify-between gap-3 border-b border-dashed border-line pb-3 font-mono text-[11px] tracking-wider text-ink-faint">
                  <span>{archiveNo(b.id)}</span>
                  <span className="dotted-rule h-[1em] flex-1" />
                  <span>
                    {b.batch} · {b.year}
                  </span>
                </div>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-ink sm:text-3xl">
                      {b.name}
                    </h2>
                    <p className="mt-2 font-mono text-xs text-ink-soft">
                      {b.dynasty} · {b.city}
                      {b.county} · {b.type}
                    </p>
                  </div>
                  <span className="seal-stamp h-12 w-12 shrink-0 text-sm">
                    必去
                  </span>
                </div>
                {b.description && (
                  <p className="mt-4 font-serif text-sm leading-relaxed text-ink-soft">
                    {b.description}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between gap-2 font-mono text-[11px] text-ink-faint">
                  {b.yingzao ? (
                    <span className="border border-line-strong px-2 py-0.5">
                      营造学社{b.yingzao} · {b.yingzao_source}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="shrink-0 text-cinnabar opacity-0 transition-opacity group-hover:opacity-100">
                    在地图上查看 →
                  </span>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
