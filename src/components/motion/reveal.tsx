"use client";
import { motion, type HTMLMotionProps } from "framer-motion";

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Fade-up on first view. Stagger children by passing `delay`. */
export function Reveal({ delay = 0, y = 24, children, ...props }: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: EASE, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
