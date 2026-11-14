"use client";

import { motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

/**
 * Transition de page : un rideau ébène se retire à chaque navigation côté client.
 * Pas de rideau au tout premier chargement (préserve le LCP).
 */
let firstLoad = true;

export default function Template({ children }: { children: ReactNode }) {
  const [curtain] = useState(() => !firstLoad);

  useEffect(() => {
    firstLoad = false;
  }, []);

  return (
    <>
      {curtain && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[70] origin-top bg-ink"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1 bg-accent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ originX: 0 }}
          />
        </motion.div>
      )}
      <motion.div
        initial={curtain ? { opacity: 0, y: 40 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
      >
        {children}
      </motion.div>
    </>
  );
}
