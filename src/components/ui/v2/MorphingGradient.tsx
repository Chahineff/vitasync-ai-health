import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/motion";

interface MorphingGradientProps {
  className?: string;
  intensity?: "subtle" | "medium" | "vivid";
  /** Disable animation entirely (use static gradient). */
  static?: boolean;
}

const intensityOpacity = {
  subtle: 0.5,
  medium: 0.75,
  vivid: 1,
} as const;

/**
 * Ambient morphing gradient backdrop.
 * Uses CSS tokens (--v2-primary / --v2-violet / --v2-mint) so it adapts
 * automatically to light/dark themes.
 */
export function MorphingGradient({
  className,
  intensity = "subtle",
  static: isStatic = false,
}: MorphingGradientProps) {
  const reduced = prefersReducedMotion() || isStatic;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      style={{ opacity: intensityOpacity[intensity] }}
    >
      <motion.div
        className="v2-morphing-gradient absolute inset-[-20%]"
        animate={
          reduced
            ? undefined
            : {
                scale: [1, 1.08, 1],
                rotate: [0, 8, 0],
              }
        }
        transition={
          reduced
            ? undefined
            : { duration: 22, ease: "easeInOut", repeat: Infinity }
        }
      />
    </div>
  );
}

export default MorphingGradient;