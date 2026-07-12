"use client";

import { motion } from "framer-motion";

/** 文字从模糊渐清入场（逐字），React Bits BlurText 的本地实现 */
export default function BlurText({
  text,
  className,
  delay = 0,
  stagger = 0.05,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  return (
    <span className={className} aria-label={text}>
      {Array.from(text).map((ch, i) =>
        ch === "\n" ? (
          <br key={i} />
        ) : (
          <motion.span
            key={i}
            aria-hidden
            className="inline-block"
            initial={{ opacity: 0, y: 10, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              duration: 0.5,
              delay: delay + i * stagger,
              ease: "easeOut",
            }}
          >
            {ch}
          </motion.span>
        )
      )}
    </span>
  );
}
