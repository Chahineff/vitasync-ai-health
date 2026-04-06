import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface StepTimelineProps {
  currentStep: number;
  totalSteps: number;
}

export function StepTimeline({ currentStep, totalSteps }: StepTimelineProps) {
  return (
    <div className="fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-0">
      {Array.from({ length: totalSteps }, (_, i) => {
        const isCompleted = i < currentStep;
        const isActive = i === currentStep;
        const isFuture = i > currentStep;

        return (
          <div key={i} className="flex flex-col items-center">
            {/* Node */}
            <motion.div
              initial={false}
              animate={{
                scale: isActive ? 1.3 : 1,
                borderColor: isCompleted
                  ? "hsl(var(--primary))"
                  : isActive
                  ? "hsl(var(--primary))"
                  : "hsl(var(--muted))",
                backgroundColor: isCompleted
                  ? "hsl(var(--primary))"
                  : "transparent",
              }}
              transition={{ duration: 0.3 }}
              className="w-3 h-3 rounded-full border-2 flex items-center justify-center relative"
            >
              {isCompleted && (
                <Check className="w-2 h-2 text-primary-foreground" strokeWidth={3} />
              )}
              {isActive && (
                <motion.div
                  animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-primary/30"
                />
              )}
            </motion.div>
            {/* Connector line */}
            {i < totalSteps - 1 && (
              <div className="relative w-0.5 h-4">
                <div className="absolute inset-0 bg-muted/30 rounded-full" />
                <motion.div
                  initial={false}
                  animate={{ scaleY: isCompleted ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-primary rounded-full origin-top"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
