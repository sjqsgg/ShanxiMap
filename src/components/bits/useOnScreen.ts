"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

/** rAF+getBoundingClientRect 的进入视口检测（IntersectionObserver 在部分环境不可靠） */
export function useOnScreen<T extends HTMLElement>(
  margin = 60
): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (seen) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const check = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight - margin && r.bottom > 0) setSeen(true);
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
  }, [seen, margin]);

  return [ref, seen];
}
