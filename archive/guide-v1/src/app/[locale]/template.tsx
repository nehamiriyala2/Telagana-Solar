"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";

/**
 * Page transition: soft fade-up on client-side route changes.
 * Skipped on the very first load so server HTML is visible immediately (good LCP, works before JS).
 */
let firstLoad = true;

export default function Template({ children }: { children: React.ReactNode }) {
  const animateIn = !firstLoad;
  useEffect(() => { firstLoad = false; }, []);
  return (
    <motion.div
      initial={animateIn ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
