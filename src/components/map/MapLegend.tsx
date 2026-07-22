export default function MapLegend() {
  return (
    <div className="pointer-events-none absolute bottom-2 left-2 z-10 hidden sm:block">
      <div className="frosted border border-line px-3 py-2 font-mono text-[10px] leading-relaxed text-ink-soft">
        <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-ink-soft align-[-1px]" />
        地点档案
        <span className="ml-3 mr-1 inline-block h-2.5 w-2.5 rotate-45 bg-ink-soft align-[-1px]" />
        石窟寺及石刻
        <span className="ml-3 border border-seal px-1 text-seal">测</span>
        营造学社
      </div>
    </div>
  );
}
