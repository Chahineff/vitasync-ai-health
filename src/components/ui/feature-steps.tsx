"use client";

import React, { useRef, useState, useCallback } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check } from "@phosphor-icons/react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Feature {
  step: string;
  title?: string;
  content: string;
  preview: React.ReactNode;
}

interface FeatureStepsProps {
  features: Feature[];
  className?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
}

export function FeatureSteps({
  features,
  className,
  title,
  subtitle,
}: FeatureStepsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentFeature, setCurrentFeature] = useState(0);
  const isMobile = useIsMobile();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const stepCount = features.length;
    const index = Math.min(
      Math.floor(value * stepCount),
      stepCount - 1
    );
    setCurrentFeature(index);
  });

  const scrollToStep = useCallback((index: number) => {
    if (!containerRef.current) return;
    const sectionTop = containerRef.current.offsetTop;
    const sectionHeight = containerRef.current.offsetHeight - window.innerHeight;
    const targetScroll = sectionTop + (sectionHeight * index) / (features.length - 1);
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  }, [features.length]);

  // Keep the sticky scroll-pin short so anchor jumps over the section feel snappy.
  const scrollHeight = isMobile
    ? `${features.length * 35}vh`
    : `${features.length * 45}vh`;

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      style={{ height: scrollHeight }}
    >
      <div className="sticky top-0 min-h-screen flex items-center py-4 md:py-12 lg:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6">
          {/* Header */}
          {title && (
            <div className="text-center mb-4 md:mb-10 lg:mb-14 hidden lg:block">
              {title}
              {subtitle}
            </div>
          )}

          {/* Mobile: step indicator dots */}
          {isMobile && (
            <div className="flex items-center justify-center gap-2 mb-4 lg:hidden">
              {features.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToStep(i)}
                  aria-label={`Step ${i + 1}`}
                  className="min-w-[24px] min-h-[24px] inline-flex items-center justify-center"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "block rounded-full transition-all duration-300",
                      i === currentFeature
                        ? "w-7 h-2 bg-gradient-to-r from-primary to-secondary"
                        : "w-2 h-2 bg-foreground/20"
                    )}
                  />
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-14 items-start">
            {/* Left: Steps list (below preview on mobile) */}
            <div className="w-full lg:w-2/5 space-y-1 max-h-[30vh] lg:max-h-none overflow-y-auto">
              {features.map((feature, index) => (
                <button
                  key={index}
                  className="w-full text-left"
                  onClick={() => scrollToStep(index)}
                >
                  <div
                    className={cn(
                      "flex items-start gap-3 md:gap-4 p-3 md:p-5 rounded-xl transition-all duration-500 group",
                      index === currentFeature
                        ? "bg-primary/5 dark:bg-primary/10"
                        : "hover:bg-muted/50"
                    )}
                  >
                    {/* Step number / check */}
                    <div
                      className={cn(
                        "w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs md:text-sm font-semibold transition-all duration-500 mt-0.5",
                        index < currentFeature
                          ? "bg-secondary text-secondary-foreground"
                          : index === currentFeature
                          ? "bg-gradient-to-br from-primary to-secondary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {index < currentFeature ? (
                        <Check size={16} weight="bold" />
                      ) : (
                        index + 1
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-xs md:text-sm font-semibold uppercase tracking-wider mb-1 transition-colors duration-500",
                          index === currentFeature
                            ? "bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                            : "text-muted-foreground"
                        )}
                      >
                        {feature.step}
                      </p>
                      <h3
                        className={cn(
                          "text-sm md:text-base lg:text-lg font-medium transition-colors duration-500",
                          index === currentFeature
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {feature.title || feature.step}
                      </h3>
                      <AnimatePresence>
                        {index === currentFeature && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.4 }}
                            className="text-xs md:text-sm text-muted-foreground mt-2 leading-relaxed"
                          >
                            {feature.content}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Right: Preview area */}
            <div className="w-full lg:w-3/5 order-first lg:order-none">
              <div className="relative h-[300px] md:h-[350px] lg:h-[500px] rounded-2xl overflow-hidden bg-card border border-border/30">
                <AnimatePresence mode="wait">
                  {features.map(
                    (feature, index) =>
                      index === currentFeature && (
                        <motion.div
                          key={index}
                          className="absolute inset-0 p-3 md:p-5"
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.04 }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                        >
                          {feature.preview}
                        </motion.div>
                      )
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
