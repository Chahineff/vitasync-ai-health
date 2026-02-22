import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const sectionColors = [
  "hsla(190, 100%, 50%, 0.07)",  // Hero - cyan
  "hsla(190, 80%, 45%, 0.06)",   // ProductPreview - cyan/teal
  "hsla(210, 80%, 50%, 0.08)",   // HowItWorks - blue
  "hsla(170, 80%, 45%, 0.07)",   // Features - teal/green
  "hsla(160, 70%, 40%, 0.06)",   // Pricing - green
  "hsla(200, 80%, 50%, 0.07)",   // FAQ - blue
  "hsla(220, 60%, 40%, 0.05)",   // Footer - deep blue
];

export function SplineBackground() {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();

  // Map scroll to color index (0-6 sections)
  const colorIndex = useTransform(scrollYProgress, [0, 0.15, 0.3, 0.5, 0.7, 0.85, 1], [0, 1, 2, 3, 4, 5, 6]);

  // Subtle rotation for visual movement
  const hueShift = useTransform(scrollYProgress, [0, 1], [0, 30]);

  // Spline opacity fades as user scrolls down
  const splineOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.4, 0.15]);

  return (
    <div ref={ref} className="fixed inset-0 z-0 pointer-events-none">
      {/* Spline 3D scene - hidden on mobile, fades with scroll */}
      <motion.div className="absolute inset-0 hidden md:block" style={{ opacity: splineOpacity }}>
        <spline-viewer
          url="https://prod.spline.design/lp2LRzHKPG0tDDPn/scene.splinecode"
          style={{ width: "100%", height: "100%", pointerEvents: "none" }}
        />
      </motion.div>

      {/* Mobile fallback gradient */}
      <motion.div className="absolute inset-0 md:hidden bg-gradient-mesh" style={{ opacity: splineOpacity }} />

      {/* Color overlay that shifts with scroll */}
      <motion.div
        className="absolute inset-0"
        style={{
          filter: useTransform(hueShift, (v) => `hue-rotate(${v}deg)`),
        }}
      />

      {/* Dynamic tinted overlay - transitions between section colors */}
      {sectionColors.map((color, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 120% 80% at 50% 50%, ${color}, transparent 70%)`,
            opacity: useTransform(
              colorIndex,
              [Math.max(0, i - 0.8), i, Math.min(6, i + 0.8)],
              [0, 1, 0]
            ),
          }}
        />
      ))}

      {/* Base overlay for readability - adapts to theme */}
      <div className="absolute inset-0 bg-background/85 dark:bg-background/75" />
    </div>
  );
}
