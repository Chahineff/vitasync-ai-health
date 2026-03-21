import * as React from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  gradientColors?: string;
  gradientAnimationDuration?: number;
  hoverEffect?: boolean;
  className?: string;
  textClassName?: string;
}

const AnimatedText = React.forwardRef<HTMLDivElement, AnimatedTextProps>(
  (
    {
      text,
      gradientColors = "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--primary)))",
      gradientAnimationDuration = 2,
      hoverEffect = false,
      className,
      textClassName,
      ...props
    },
    ref
  ) => {
    const textVariants: Variants = {
      initial: {
        backgroundPosition: "0% 0%",
      },
      animate: {
        backgroundPosition: "200% 0%",
        transition: {
          duration: gradientAnimationDuration,
          repeat: Infinity,
          repeatType: "reverse" as const,
          ease: "linear",
        },
      },
    };

    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        <motion.span
          className={cn(
            "inline-block bg-clip-text text-transparent",
            textClassName
          )}
          style={{
            backgroundImage: gradientColors,
            backgroundSize: "200% 100%",
          }}
          variants={textVariants}
          initial="initial"
          animate="animate"
        >
          {text}
        </motion.span>
      </div>
    );
  }
);

AnimatedText.displayName = "AnimatedText";

export { AnimatedText };
