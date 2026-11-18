"use client";
import { useEffect } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Page transition for client-side route changes: a navy curtain with the sun logo lifts away
 * while the new page fades in. Skipped on the very first load (server HTML shows immediately,
 * good LCP, works before JS) and for visitors who prefer reduced motion. Transform/opacity only.
 */
let firstLoad = true;
const EASE = [0.76, 0, 0.24, 1] as const;

export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const animateIn = !firstLoad;
  useEffect(() => { firstLoad = false; }, []);
  return (
    <>
      {animateIn && !reduce && (
        <motion.div aria-hidden className="pointer-events-none fixed inset-0 z-[80] grid place-items-center bg-navy"
          initial={{ y: "0%" }} animate={{ y: "-100%" }} transition={{ duration: 0.75, ease: EASE, delay: 0.2 }}>
          <motion.span className="relative grid place-items-center" initial={{ opacity: 1, scale: 1 }} animate={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.35, delay: 0.1 }}>
            <span className="absolute size-40 rounded-full bg-[radial-gradient(circle,rgb(255_199_44/0.45),transparent_65%)]" />
            <Image src="/brand/mark-64.png" alt="" width={64} height={64} className="relative" />
          </motion.span>
        </motion.div>
      )}
      <motion.div
        initial={animateIn ? { opacity: 0, y: reduce ? 0 : 16 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: animateIn && !reduce ? 0.35 : 0 }}
      >
        {children}
      </motion.div>
    </>
  );
}
