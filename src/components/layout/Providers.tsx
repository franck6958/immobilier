"use client";

import { MotionConfig, useReducedMotion } from "motion/react";
import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <MotionConfig reducedMotion="user">
      {reduce ? (
        children
      ) : (
        <ReactLenis root options={{ lerp: 0.1, wheelMultiplier: 1, anchors: { offset: -96 } }}>
          {children}
        </ReactLenis>
      )}
    </MotionConfig>
  );
}
