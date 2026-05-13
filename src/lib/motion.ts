/**
 * VitaSync Motion System v2
 * Centralized durations, easings, and Framer Motion variants.
 * All variants honor `prefers-reduced-motion` via `prefersReducedMotion()`.
 */
import type { Transition, Variants } from "framer-motion";

export const DURATION = {
  fast: 0.16,
  base: 0.24,
  slow: 0.48,
  cinematic: 0.9,
} as const;

export const EASE = {
  standard: [0.2, 0.8, 0.2, 1] as [number, number, number, number],
  emphasized: [0.16, 1, 0.3, 1] as [number, number, number, number],
  exit: [0.4, 0, 1, 1] as [number, number, number, number],
  spring: { type: "spring", stiffness: 220, damping: 26, mass: 0.9 } as Transition,
} as const;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const safe = <T extends Transition>(t: T): T =>
  prefersReducedMotion() ? ({ duration: 0 } as T) : t;

/* ---------- Reusable variants ---------- */

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: safe({ duration: DURATION.base, ease: EASE.standard }),
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: safe({ duration: DURATION.slow, ease: EASE.emphasized }),
  },
};

export const fadeInBlur: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: safe({ duration: DURATION.cinematic, ease: EASE.emphasized }),
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: safe({ duration: DURATION.base, ease: EASE.standard }),
  },
};

export const stagger = (delayChildren = 0.05, staggerChildren = 0.08): Variants => ({
  hidden: {},
  visible: {
    transition: safe({ delayChildren, staggerChildren }),
  },
});

export const hoverLift: Transition = safe({
  duration: DURATION.fast,
  ease: EASE.standard,
});

export const motion2 = {
  DURATION,
  EASE,
  fadeIn,
  fadeInUp,
  fadeInBlur,
  scaleIn,
  stagger,
  hoverLift,
  prefersReducedMotion,
};

export default motion2;