"use client";

import type { Building } from "@/lib/types";
import { TIER_COLOR, archiveNo } from "@/lib/types";

export default function Sidebar({
  buildings,
  selectedId,
  onSelect,
  onClose,
}: {
  buildings: Building[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onClose: () => void;
}) {
  return (
    <aside className="pointer-events-auto absolute bottom-0 right-0 z-30 flex h-[45dvh] w-full flex-col border-t border-line frosted sm:top-[64px] sm:h-auto sm:w-80 sm:border-l sm:border-t-0">
      <div className="flex items-center justify-between border-b border-line px-4 py-2 font-mono text-[11px] text-ink-faint">
        <span>检索结果 · {buildings.length} 条</span>
        <button
          onClick={onClose}
          className="px-1 text-ink-soft hover:text-cinnabar"
          aria-label="关闭列表"
        >
          ✕
        </button>
      </div>
      <ul className="flex-1 overflow-y-auto">
        {buildings.map((b) => (
          <li key={b.id}>
            <button
              onClick={() => onSelect(b.id)}
              className={`flex w-full items-baseline gap-2 border-b border-line/60 px-4 py-2.5 text-left transition-colors hover:bg-paper-card/80 ${
                selectedId === b.id ? "bg-paper-card" : ""
              }`}
            >
              <span
                className="mt-1 h-2.5 w-2.5 shrink-0 self-center rounded-full"
                style={{ background: TIER_COLOR[b.tier] }}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-serif text-sm font-bold text-ink">
                  {b.name}
                  {b.yingzao && (
                    <span className="ml-1.5 align-middle font-mono text-[9px] text-seal">
                      [测]
                    </span>
                  )}
                </span>
                <span className="block font-mono text-[10px] text-ink-faint">
                  {b.earliest_dynasty} · {b.city}
                  {b.county} · {archiveNo(b.id)}
                </span>
              </span>
            </button>
          </li>
        ))}
        {buildings.length === 0 && (
          <li className="px-4 py-8 text-center font-mono text-xs text-ink-faint">
            没有符合条件的档案
          </li>
        )}
      </ul>
    </aside>
  );
}
