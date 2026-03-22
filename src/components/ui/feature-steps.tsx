"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check } from "@phosphor-icons/react";

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
  autoPlayInterval?: number;
}

export function FeatureSteps({
  features,
  className,
  title,
  subtitle,
  autoPlayInterval = 5000,
}: FeatureStepsProps) {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (progress < 100) {
        setProgress((prev) => prev + 100 / (autoPlayInterval / 100));
      } else {
        setCurrentFeature((prev) => (prev + 1) % features.length);
        setProgress(0);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [progress, features.length, autoPlayInterval]);

  return (
    <div className={cn("py-12 md:py-20", className)}>
      <div className="max-w-7xl mx-auto w-full px-4 md:px-6">
        {/* Header */}
        {title && (
          <div className="text-center mb-12 md:mb-16">
            {title}
            {subtitle}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 items-start">
          {/* Left: Steps list */}
          <div className="w-full lg:w-2/5 space-y-1">
            {features.map((feature, index) => (
              <motion.button
                key={index}
                className="w-full text-left"
                onClick={() => {
                  setCurrentFeature(index);
                  setProgress(0);
                }}
              >
                <div
                  className={cn(
                    "flex items-start gap-4 p-4 md:p-5 rounded-xl transition-all duration-300 group",
                    index === currentFeature
                      ? "bg-primary/5 dark:bg-primary/10"
                      : "hover:bg-muted/50"
                  )}
                >
                  {/* Step number / check */}
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold transition-all duration-300 mt-0.5",
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
                        "text-sm font-semibold uppercase tracking-wider mb-1 transition-colors duration-300",
                        index === currentFeature
                          ? "bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                          : "text-muted-foreground"
                      )}
                    >
                      {feature.step}
                    </p>
                    <h4
                      className={cn(
                        "text-base md:text-lg font-medium transition-colors duration-300",
                        index === currentFeature
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {feature.title || feature.step}
                    </h4>
                    {index === currentFeature && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-sm text-muted-foreground mt-2 leading-relaxed"
                      >
                        {feature.content}
                      </motion.p>
                    )}

                    {/* Progress bar for active step */}
                    {index === currentFeature && (
                      <div className="mt-3 h-0.5 w-full bg-border/50 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                          style={{ width: `${progress}%` }}
                          transition={{ duration: 0.1 }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Right: Preview area */}
          <div className="w-full lg:w-3/5">
            <div className="relative aspect-[4/3] lg:aspect-auto lg:h-[500px] rounded-2xl overflow-hidden bg-card border border-border/30">
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
  );
}
