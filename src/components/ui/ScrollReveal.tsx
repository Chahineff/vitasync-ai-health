import { motion, useInView } from "framer-motion";
import { useRef, ReactNode, useMemo } from "react";
import { useReducedMotion } from "framer-motion";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}

export function ScrollReveal({ 
  children, 
  className = "", 
  delay = 0,
  direction = "up" 
}: ScrollRevealProps) {
  const ref = useRef(null);
  // Trigger a bit earlier so reveals feel consistent across viewport heights
  const isInView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px", amount: 0.15 });
  const prefersReducedMotion = useReducedMotion();

  const initialPos = useMemo(() => {
    switch (direction) {
      case "up": return { y: 24, x: 0 };
      case "down": return { y: -24, x: 0 };
      case "left": return { y: 0, x: 24 };
      case "right": return { y: 0, x: -24 };
      default: return { y: 24, x: 0 };
    }
  }, [direction]);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        ...initialPos,
      }}
      animate={isInView ? {
        opacity: 1,
        y: 0,
        x: 0,
      } : undefined}
      transition={{
        duration: 0.55,
        delay: Math.min(delay, 0.25),
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        willChange: isInView ? "auto" : "transform, opacity",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
