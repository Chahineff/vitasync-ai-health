import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

// Generate N evenly-spaced steps mapping [0,1] → [from, to]
function generateSteps(count: number, from: number, to: number): [number[], number[]] {
  const inputs = Array.from({ length: count }, (_, i) => i / (count - 1));
  const outputs = inputs.map(t => from + (to - from) * t);
  return [inputs, outputs];
}

const STEPS = 200;
const [opacityInputs, opacityOutputs] = generateSteps(STEPS, 1, 0.25);
const [colorInputs, colorOutputs] = generateSteps(STEPS, 0, 6);

const sectionColors = [
  "hsla(190, 100%, 50%, 0.15)",
  "hsla(190, 80%, 45%, 0.12)",
  "hsla(210, 80%, 50%, 0.14)",
  "hsla(170, 80%, 45%, 0.13)",
  "hsla(160, 70%, 40%, 0.12)",
  "hsla(200, 80%, 50%, 0.13)",
  "hsla(220, 60%, 40%, 0.10)",
];

export function SplineBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  const colorIndex = useTransform(scrollYProgress, colorInputs, colorOutputs);
  const hueShift = useTransform(scrollYProgress, [0, 1], [0, 30]);
  const splineOpacity = useTransform(scrollYProgress, opacityInputs, opacityOutputs);

  return (
    <div ref={ref} className="fixed inset-0 z-0 pointer-events-none">
      <motion.div className="absolute inset-0 hidden md:block" style={{ opacity: splineOpacity }}>
        <spline-viewer
          url="https://prod.spline.design/lp2LRzHKPG0tDDPn/scene.splinecode"
          style={{ width: "100%", height: "100%", pointerEvents: "none" }}
        />
      </motion.div>

      <motion.div className="absolute inset-0 md:hidden bg-gradient-mesh" style={{ opacity: splineOpacity }} />

      <motion.div
        className="absolute inset-0"
        style={{
          filter: useTransform(hueShift, (v) => `hue-rotate(${v}deg)`),
        }}
      />

      {sectionColors.map((color, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 140% 100% at 50% 50%, ${color}, transparent 80%)`,
            opacity: useTransform(
              colorIndex,
              [Math.max(0, i - 1.5), Math.max(0, i - 0.3), i, Math.min(6, i + 0.3), Math.min(6, i + 1.5)],
              [0, 0.3, 1, 0.3, 0]
            ),
          }}
        />
      ))}

      <div className="absolute inset-0 bg-background/70 dark:bg-background/60" />
    </div>
  );
}
