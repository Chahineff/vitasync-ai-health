import { motion, useInView } from "framer-motion";
import { useRef, ReactNode } from "react";

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
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const getInitialPosition = () => {
    switch (direction) {
      case "up": return { y: 40, x: 0 };
      case "down": return { y: -40, x: 0 };
      case "left": return { y: 0, x: 40 };
      case "right": return { y: 0, x: -40 };
      default: return { y: 40, x: 0 };
    }
  };

  const initialPos = getInitialPosition();

  return (
    <motion.div
      ref={ref}
      initial={{ 
        opacity: 0, 
        filter: "blur(10px)",
        ...initialPos
      }}
      animate={isInView ? { 
        opacity: 1, 
        filter: "blur(0px)",
        y: 0,
        x: 0
      } : {}}
      transition={{ 
        duration: 0.8, 
        delay,
        ease: [0.16, 1, 0.3, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
