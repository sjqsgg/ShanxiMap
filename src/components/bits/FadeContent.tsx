"use client";

import type { ReactNode } from "react";
import { useOnScreen } from "./useOnScreen";

/** 滚动进入视口时淡入上移，React Bits FadeContent 的本地实现 */
export default function FadeContent({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const [ref, seen] = useOnScreen<HTMLDivElement>(60);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: seen ? 1 : 0,
        transform: seen ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.5s ease-out ${delay}ms, transform 0.5s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
