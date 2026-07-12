import Link from "next/link";
import { STATS } from "@/lib/data";
import BlurText from "@/components/bits/BlurText";
import CountUp from "@/components/bits/CountUp";
import HomeClient from "@/components/home/HomeClient";

function today(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function Stat({
  label,
  value,
  note,
  accent,
}: {
  label: string;
  value: number;
  note: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-ink-faint">{label}</p>
      <CountUp
        value={value}
        className={`mt-1 block text-2xl ${accent ? "text-cinnabar" : "text-ink"}`}
      />
      <p className="text-ink-faint">{note}</p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="paper-grain min-h-screen">
      {/* 档案表头 */}
      <header className="sticky top-0 z-50 frosted border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 font-mono text-[11px] tracking-wider text-ink-faint sm:px-6">
          <span className="shrink-0">SHANXI_ARCHIVE™</span>
          <span className="dotted-rule hidden h-[1em] flex-1 sm:block" />
          <span className="hidden md:inline">全国重点文物保护单位</span>
          <span className="dotted-rule hidden h-[1em] flex-1 md:block" />
          <span className="hidden sm:inline">{today()}</span>
          <span className="dotted-rule hidden h-[1em] w-8 sm:block" />
          <span>NO.001–532</span>
          <Link
            href="/map"
            className="shrink-0 border border-line-strong bg-paper-card px-3 py-1 text-ink transition-colors hover:border-cinnabar hover:text-cinnabar"
          >
            直接查阅地图 →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <p className="font-mono text-xs tracking-[0.3em] text-ink-faint">
          [ 山西省 · 古建筑访古档案 ]
        </p>
        <h1 className="mt-6 font-serif text-6xl font-bold leading-[1.05] tracking-tight text-ink sm:text-8xl md:text-9xl">
          <BlurText text={"山西\n访古档案"} stagger={0.09} />
        </h1>
        <div className="dotted-rule mt-10 h-px w-full" />
        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 font-mono text-xs text-ink-soft sm:grid-cols-5">
          <Stat label="收录" value={STATS.total} note="处国保单位" />
          <Stat
            label="唐构"
            value={STATS.tang}
            note="全国唐五代木构大半在此"
            accent
          />
          <Stat
            label="五代辽宋金"
            value={STATS.songjin}
            note="早期木构的黄金库"
          />
          <Stat label="元构" value={STATS.yuan} note="存量全国第一" />
          <Stat
            label="营造学社考察"
            value={STATS.yingzao}
            note="梁思成林徽因足迹"
          />
        </div>
        <p className="mt-16 max-w-xl font-serif text-base leading-relaxed text-ink-soft">
          中国现存元代以前木构建筑，八成在山西。这里不谈网红与打卡，
          只按档案的方式，把 532 处全国重点文物保护单位一一归档：
          从五台山中的唐代大殿，到浊漳河谷无人问津的五代小庙。
        </p>
      </section>

      {/* 档案袋 → 地图 + 索引 + 抽屉 */}
      <HomeClient />

      <footer className="border-t border-line px-6 py-8 text-center font-mono text-[11px] text-ink-faint">
        <p>数据来源：全国重点文物保护单位名单（第一至八批）· 坐标系 GCJ-02</p>
        <p className="mt-2">SHANXI_ARCHIVE™ · 为访古者而作 · 不蹭任何IP</p>
      </footer>
    </main>
  );
}
