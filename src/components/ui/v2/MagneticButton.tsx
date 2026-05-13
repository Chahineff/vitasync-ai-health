import { forwardRef, useRef, useState, type ButtonHTMLAttributes } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/motion";

type Variant = "primary" | "ghost" | "outline";

interface MagneticButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag"> {
  variant?: Variant;
  strength?: number;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-foreground text-background hover:opacity-90",
  ghost:
    "bg-transparent text-foreground hover:bg-foreground/5",
  outline:
    "border border-[hsl(var(--v2-border-default))] text-foreground hover:bg-foreground/5",
};

export const MagneticButton = forwardRef<HTMLButtonElement, MagneticButtonProps>(
  ({ className, variant = "primary", strength = 0.25, children, ...props }, ref) => {
    const wrapRef = useRef<HTMLSpanElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
    const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });
    const [hover, setHover] = useState(false);

    const handleMove = (e: React.MouseEvent<HTMLSpanElement>) => {
      if (prefersReducedMotion()) return;
      const rect = wrapRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      x.set((e.clientX - cx) * strength);
      y.set((e.clientY - cy) * strength);
    };

    const reset = () => {
      x.set(0);
      y.set(0);
      setHover(false);
    };

    return (
      <span
        ref={wrapRef}
        className="inline-block"
        onMouseMove={handleMove}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={reset}
      >
        <motion.button
          ref={ref}
          style={{ x: sx, y: sy }}
          whileTap={{ scale: 0.97 }}
          className={cn(
            "v2-focus-ring inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors",
            variants[variant],
            hover && "shadow-[0_8px_30px_-10px_hsl(var(--v2-primary)/0.4)]",
            className,
          )}
          {...props}
        >
          {children}
        </motion.button>
      </span>
    );
  },
);
MagneticButton.displayName = "MagneticButton";

export default MagneticButton;