import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useMemo, useState, useEffect } from "react";

function generateSteps(count: number, from: number, to: number): [number[], number[]] {
  const inputs = Array.from({ length: count }, (_, i) => i / (count - 1));
  const outputs = inputs.map(t => from + (to - from) * t);
  return [inputs, outputs];
}

const sectionColors = [
  "hsla(190, 100%, 50%, 0.15)",
  "hsla(190, 80%, 45%, 0.12)",
  "hsla(210, 80%, 50%, 0.14)",
  "hsla(170, 80%, 45%, 0.13)",
  "hsla(160, 70%, 40%, 0.12)",
  "hsla(200, 80%, 50%, 0.13)",
  "hsla(220, 60%, 40%, 0.10)",
];

interface SplineBackgroundProps {
  steps?: number;
}

export function SplineBackground({ steps = 200 }: SplineBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const [splineReady, setSplineReady] = useState(false);

  const [colorInputs, colorOutputs] = useMemo(() => generateSteps(steps, 0, 6), [steps]);

  const colorIndex = useTransform(scrollYProgress, colorInputs, colorOutputs);
  const hueShift = useTransform(scrollYProgress, [0, 1], [0, 30]);

  // Defer Spline mount: wait for idle + intersection so we don't block LCP
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth < 768) return; // Mobile: never mount Spline
    const node = ref.current;
    if (!node) return;
    const mount = () => setSplineReady(true);
    const idle = (cb: () => void) =>
      "requestIdleCallback" in window
        ? (window as any).requestIdleCallback(cb, { timeout: 1500 })
        : setTimeout(cb, 600);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          idle(mount);
          io.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="fixed inset-0 z-0 pointer-events-none">
      {/* Static gradient placeholder — visible until Spline mounts (and on mobile) */}
      <div className="absolute inset-0 bg-gradient-mesh" />
      {splineReady && (
        <div className="absolute inset-0 hidden md:block">
          <spline-viewer
            url="https://prod.spline.design/lp2LRzHKPG0tDDPn/scene.splinecode"
            style={{ width: "100%", height: "100%", pointerEvents: "none" }}
          />
        </div>
      )}

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
