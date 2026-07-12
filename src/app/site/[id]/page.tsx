import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BUILDINGS, byId, nearby } from "@/lib/data";
import { archiveNo } from "@/lib/types";
import SiteActions from "@/components/site/SiteActions";
import { CheckinButtons, NotesBox } from "@/components/site/SitePlaceholders";

export function generateStaticParams() {
  return BUILDINGS.map((b) => ({ id: String(b.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const b = byId(Number(id));
  return { title: b ? `${b.name} — 山西访古档案` : "山西访古档案" };
}

function SectionTitle({ children }: { children: string }) {
  return (
    <p className="font-mono text-xs tracking-[0.25em] text-ink-faint">
      [ {children} ]
    </p>
  );
}

function Rule() {
  return <div className="dotted-rule my-10 h-px w-full" />;
}

/** 实用信息：暂无数据的字段显示 — */
const PRACTICAL: { label: string; value?: string }[] = [
  { label: "开放时间" },
  { label: "票价" },
  { label: "交通方式" },
  { label: "停车" },
];

export default async function SitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const b = byId(Number(id));
  if (!b) notFound();
  const near = nearby(b, 4);
  const navUrl = `https://uri.amap.com/marker?position=${b.lng},${b.lat}&name=${encodeURIComponent(
    b.name
  )}&coordinate=gaode&callnative=1`;

  return (
    <main className="paper-grain min-h-screen">
      {/* 顶部导航（fixed 三栏） */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-line bg-paper">
        <div className="mx-auto grid max-w-5xl grid-cols-3 items-center px-4 py-2.5 font-mono text-[11px] tracking-wider sm:px-6">
          <Link
            href="/#map"
            className="justify-self-start text-ink-soft transition-colors hover:text-cinnabar"
          >
            ← 返回地图
          </Link>
          <span className="justify-self-center text-ink-faint">
            SHANXI_ARCHIVE™
          </span>
          <a
            href={navUrl}
            target="_blank"
            rel="noreferrer"
            className="justify-self-end text-ink-soft transition-colors hover:text-cinnabar"
          >
            高德导航 →
          </a>
        </div>
      </nav>

      {/* 大图区（占位，等真实照片） */}
      <div className="relative mt-[41px] flex h-[50vh] items-center justify-center border-b border-line bg-paper-deep">
        <h1 className="px-6 text-center font-serif text-4xl font-bold text-ink sm:text-6xl">
          {b.name}
        </h1>
        <span className="absolute bottom-3 right-4 font-mono text-[10px] tracking-wider text-ink-faint">
          [ 建筑实景照片 · 待补 ]
        </span>
      </div>

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {/* 档案信息区 */}
        <div className="flex items-center gap-2 font-mono text-[11px] tracking-wider text-ink-faint">
          <span>{archiveNo(b.id)}</span>
          <span className="dotted-rule h-[1em] flex-1" />
          <span>
            {b.batch} · {b.year}年公布
          </span>
        </div>

        <div className="mt-6 flex items-start justify-between gap-4">
          <h2 className="font-serif text-4xl font-bold text-ink sm:text-5xl">
            {b.name}
          </h2>
          <span className="seal-stamp h-14 w-14 shrink-0 text-base">
            {b.tier}
          </span>
        </div>

        <p className="mt-4 font-mono text-sm text-ink-soft">
          {b.dynasty} · {b.city} · {b.county} · {b.type}
        </p>

        {b.yingzao && (
          <div className="mt-4 flex flex-wrap gap-2 font-mono text-[11px] tracking-wide text-seal">
            <span className="border border-seal/40 bg-seal/5 px-2 py-1">
              中国营造学社 · {b.yingzao}
            </span>
            <span className="border border-seal/40 bg-seal/5 px-2 py-1">
              {b.yingzao_source}
            </span>
          </div>
        )}

        <Rule />

        {/* 简介正文 */}
        <p className="font-serif text-base leading-loose text-ink">
          {b.description || "简介待补。"}
        </p>
        <p className="mt-3 font-mono text-[10px] text-ink-faint">
          位于{b.address}
          {b.geo_precision !== "high" &&
            ` · ⚠ 坐标为${b.geo_precision === "county" ? "区县" : "村镇"}级近似，实地前请再核实`}
        </p>

        <Rule />

        {/* 实用信息 */}
        <SectionTitle>实用信息</SectionTitle>
        <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-6">
          {PRACTICAL.map((item) => (
            <div key={item.label}>
              <p className="font-mono text-[11px] tracking-widest text-ink-faint">
                {item.label}
              </p>
              <p className="mt-1 font-serif text-sm text-ink">
                {item.value ?? "—"}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <SiteActions b={b} />
        </div>

        <Rule />

        {/* 周边古建 */}
        <SectionTitle>附近古建筑</SectionTitle>
        <ul className="mt-4">
          {near.map(({ b: n, km }) => (
            <li key={n.id}>
              <Link
                href={`/site/${n.id}`}
                className="group flex items-baseline gap-4 border-b border-line/70 py-3 transition-colors hover:bg-paper-card/70"
              >
                <span className="min-w-0 flex-1 truncate font-serif text-[15px] font-bold text-ink group-hover:text-cinnabar">
                  {n.name}
                </span>
                <span className="w-12 shrink-0 font-mono text-[11px] text-ink-soft">
                  {n.earliest_dynasty}
                </span>
                <span className="hidden shrink-0 font-mono text-[11px] text-ink-faint sm:inline">
                  {n.city}
                  {n.county}
                </span>
                <span className="w-16 shrink-0 text-right font-mono text-[11px] text-ink-soft">
                  约{km < 1 ? km.toFixed(1) : Math.round(km)}km
                </span>
                <span className="shrink-0 font-mono text-[11px] text-ink-faint group-hover:text-cinnabar">
                  [→]
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <Rule />

        {/* 访客笔记（占位） */}
        <SectionTitle>访客笔记</SectionTitle>
        <div className="mt-4">
          <NotesBox />
        </div>

        <Rule />

        {/* 分享区（占位） */}
        <SectionTitle>生成打卡卡片</SectionTitle>
        <div className="mt-4">
          <CheckinButtons />
        </div>
      </article>

      <footer className="border-t border-line px-6 py-8 text-center font-mono text-[11px] text-ink-faint">
        <p>SHANXI_ARCHIVE™ · {archiveNo(b.id)} · 坐标系 GCJ-02</p>
      </footer>
    </main>
  );
}
