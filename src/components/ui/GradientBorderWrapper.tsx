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
  const op = opacityMap[intensity];
  const gop = glowOpacity[intensity];

  return (
    <div className={cn("relative p-[1.5px] overflow-hidden", borderRadius, className)}>
      {/* Animated conic gradient border */}
      <div
        className={cn("absolute inset-0 animate-spin-slow", borderRadius)}
        style={{
          background: `conic-gradient(from 0deg, ${accentColor}, transparent 40%, ${second} 50%, transparent 90%, ${accentColor})`,
          opacity: op,
        }}
      />
      {/* Static secondary gradient */}
      <div
        className={cn("absolute inset-0", borderRadius)}
        style={{
          background: `conic-gradient(from 180deg, ${second}, transparent 30%, ${accentColor} 60%, transparent)`,
          opacity: op * 0.5,
        }}
      />
      {/* Subtle radial glow */}
      <div
        className={cn("absolute inset-0 pointer-events-none", borderRadius)}
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${accentColor}, transparent 70%)`,
          opacity: gop,
        }}
      />
      {/* Inner content */}
      <div className={cn("relative", borderRadius)} style={{ borderRadius: "inherit" }}>
        {children}
      </div>
    </div>
  );
}
