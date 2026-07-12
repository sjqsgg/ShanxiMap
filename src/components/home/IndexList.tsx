"use client";

import { useState } from "react";
import type { Building } from "@/lib/types";
import FadeContent from "@/components/bits/FadeContent";

const COLLAPSED_COUNT = 20;

function CityGroup({
  city,
  items,
  onPick,
}: {
  city: string;
  items: Building[];
  onPick: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const shown = open ? items : items.slice(0, COLLAPSED_COUNT);
  const rest = items.length - shown.length;

  return (
    <FadeContent className="py-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-serif text-lg font-bold text-ink">
          {city}
          <span className="ml-2 font-mono text-xs font-normal text-ink-faint">
            · {items.length}处
          </span>
        </p>
        {items.length > COLLAPSED_COUNT && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="shrink-0 font-mono text-[11px] text-ink-faint transition-colors hover:text-cinnabar"
          >
            [{open ? "收起" : "展开"}]
          </button>
        )}
      </div>
      <div className="mt-2 h-px bg-line" />
      <p className="mt-3 leading-loose">
        {shown.map((b) => (
          <button
            key={b.id}
            onClick={() => onPick(b.id)}
            className={`mr-4 inline font-serif text-[15px] transition-colors hover:text-cinnabar ${
              b.tier === "必去"
                ? "text-ink underline decoration-cinnabar decoration-2 underline-offset-4"
                : "text-ink-soft"
            }`}
          >
            {b.name}
          </button>
        ))}
        {rest > 0 && (
          <button
            onClick={() => setOpen(true)}
            className="inline font-mono text-xs text-ink-faint transition-colors hover:text-cinnabar"
          >
            ··· 还有{rest}处
          </button>
        )}
      </p>
    </FadeContent>
  );
}

/** 地图下方的索引列表：按地市分组平铺建筑名 */
export default function IndexList({
  groups,
  onPick,
}: {
  groups: [string, Building[]][];
  onPick: (id: number) => void;
}) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <div className="mb-6 flex items-baseline gap-3 font-mono text-xs tracking-widest text-ink-faint">
        <span>[ 总索引 ]</span>
        <span className="dotted-rule h-[1em] flex-1" />
        <span>按地市 · 国保数量降序</span>
      </div>
      {groups.map(([city, items]) => (
        <CityGroup key={city} city={city} items={items} onPick={onPick} />
      ))}
      {groups.length === 0 && (
        <p className="py-10 text-center font-mono text-xs text-ink-faint">
          没有符合条件的档案
        </p>
      )}
    </section>
  );
}
