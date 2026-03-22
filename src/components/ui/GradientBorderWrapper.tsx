import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GradientBorderWrapperProps {
  children: ReactNode;
  accentColor: string;       // e.g. "rgba(0, 240, 255, 0.8)"
  secondaryColor?: string;   // optional second color for gradient
  className?: string;
  borderRadius?: string;     // e.g. "rounded-2xl"
  intensity?: "subtle" | "medium" | "strong";
}

export function GradientBorderWrapper({
  children,
  accentColor,
  secondaryColor,
  className,
  borderRadius = "rounded-2xl",
  intensity = "medium",
}: GradientBorderWrapperProps) {
  const second = secondaryColor || accentColor;
  const opacityMap = { subtle: 0.3, medium: 0.5, strong: 0.7 };
  const glowOpacity = { subtle: 0.08, medium: 0.12, strong: 0.18 };
  // Boost opacity in light mode for better visibility against light backgrounds
  const lightBoost = 1.6;
  const op = opacityMap[intensity];
  const gop = glowOpacity[intensity];

  return (
    <div className={cn("relative p-[1.5px]", borderRadius, className)}>
      {/* Static gradient border — stronger in light mode */}
      <div
        className={cn("absolute inset-0", borderRadius)}
        style={{
          background: `linear-gradient(135deg, ${accentColor}, ${second}, ${accentColor})`,
        }}
      >
        <div className={cn("absolute inset-0 hidden dark:block", borderRadius)} style={{ opacity: op }} />
        <div className={cn("absolute inset-0 dark:hidden", borderRadius)} style={{ opacity: Math.min(op * lightBoost, 1) }} />
      </div>
      {/* Outer glow */}
      <div
        className={cn("absolute -inset-[1px] pointer-events-none", borderRadius)}
        style={{
          boxShadow: `0 0 15px ${accentColor.replace(/[\d.]+\)$/, `${gop})`)}`,
        }}
      />
      {/* Inner content */}
      <div className={cn("relative", borderRadius)} style={{ borderRadius: "inherit" }}>
        {children}
      </div>
    </div>
  );
}
