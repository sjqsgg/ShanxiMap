"use client";

import { useEffect } from "react";
import { animate } from "framer-motion";
import { useOnScreen } from "./useOnScreen";

/** 数字进入视口时从0滚动到目标值 */
export default function CountUp({
  value,
  className,
  duration = 1.2,
}: {
  value: number;
  className?: string;
  duration?: number;
}) {
  const [ref, seen] = useOnScreen<HTMLSpanElement>(40);

  useEffect(() => {
    const el = ref.current;
    if (!seen || !el) return;
    const c = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => {
        el.textContent = String(Math.round(v));
      },
    });
    return () => c.stop();
  }, [seen, value, duration, ref]);

  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
}
