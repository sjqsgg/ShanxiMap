"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/** 档案袋：滚动时封口盖翻开，内页从袋口抽出 */
export default function ArchiveBag() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // 封口盖旋转打开
  const lidRotate = useTransform(scrollYProgress, [0.08, 0.38], [0, -110]);
  // 内页从袋里抽出
  const sheetY = useTransform(scrollYProgress, [0.3, 0.75], ["58%", "-34%"]);
  const sheetOpacity = useTransform(scrollYProgress, [0.3, 0.42], [0, 1]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  return (
    <section ref={ref} className="relative h-[180vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
        <div
          className="relative w-[min(560px,86vw)]"
          style={{ perspective: 900 }}
        >
          {/* 内页：从袋口抽出的"舆图" */}
          <motion.div
            className="absolute inset-x-8 top-0 z-0 border border-line-strong bg-paper-card px-6 py-5 shadow-[3px_4px_0_rgba(120,100,60,0.08)]"
            style={{ y: sheetY, opacity: sheetOpacity }}
          >
            <p className="font-mono text-[10px] tracking-[0.3em] text-ink-faint">
              [ 内页 · 山西全域舆图 ]
            </p>
            <p className="mt-2 font-serif text-2xl font-bold text-ink">
              532 处国保 · 一图归档
            </p>
            <p className="mt-1 font-mono text-[10px] text-ink-faint">
              继续滚动展开 ↓
            </p>
          </motion.div>

          {/* 封口盖 */}
          <motion.div
            className="relative z-20 mx-auto h-16 w-[88%] origin-top border border-b-0 border-line-strong bg-paper-deep"
            style={{
              rotateX: lidRotate,
              transformOrigin: "top center",
              borderRadius: "10px 10px 0 0",
            }}
          >
            <div className="absolute left-1/2 top-10 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-line-strong bg-paper" />
          </motion.div>

          {/* 袋身 */}
          <div className="relative z-10 rounded-b-lg rounded-t-sm border border-line-strong bg-paper-deep px-8 pb-10 pt-8 shadow-[4px_6px_0_rgba(120,100,60,0.1)]">
            {/* 绳扣 */}
            <div className="absolute -top-2.5 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-line-strong bg-paper" />
            <svg
              className="absolute -top-1 left-1/2 -translate-x-1/2"
              width="60"
              height="26"
              aria-hidden
            >
              <path
                d="M30 3 C 44 8, 50 16, 44 23 M30 3 C 16 8, 10 16, 16 23"
                fill="none"
                stroke="#b5a582"
                strokeWidth="1.5"
              />
            </svg>
            <p className="mt-4 text-center font-mono text-[10px] tracking-[0.35em] text-ink-faint">
              SHANXI_ARCHIVE™ · 卷宗全集
            </p>
            <p className="mt-3 text-center font-serif text-3xl font-bold text-ink sm:text-4xl">
              山西访古档案袋
            </p>
            <p className="mt-2 text-center font-mono text-[11px] text-ink-soft">
              全国重点文物保护单位 · 第一至八批 · NO.001–532
            </p>
            <div className="dotted-rule mx-auto mt-5 h-px w-3/4" />
            <p className="mt-4 text-center font-serif text-sm text-ink-soft">
              地图与索引封存于此袋
            </p>
          </div>
        </div>

        <motion.p
          className="mt-8 font-mono text-xs tracking-widest text-ink-faint"
          style={{ opacity: hintOpacity }}
        >
          ↓ 向下滚动，开启档案袋
        </motion.p>
      </div>
    </section>
  );
}

/** 档案袋展开后的内容区：进入视口时从袋口"长出"（scale + 上移） */
export function EmergeFromBag({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.28"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [72, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div ref={ref}>
      <motion.div style={{ scale, y, opacity, transformOrigin: "top center" }}>
        {children}
      </motion.div>
    </div>
  );
}
