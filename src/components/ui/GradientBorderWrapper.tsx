import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface GradientBorderWrapperProps {
  children: ReactNode;
  accentColor: string;
  secondaryColor?: string;
  className?: string;
  borderRadius?: string;
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
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";
  const second = secondaryColor || accentColor;

  const opacityMap = { subtle: 0.3, medium: 0.5, strong: 0.7 };
  const glowOpacity = { subtle: 0.08, medium: 0.12, strong: 0.18 };

  // Boost in light mode for visibility on light backgrounds
  const op = opacityMap[intensity] * (isLight ? 1.8 : 1);
  const gop = glowOpacity[intensity] * (isLight ? 2 : 1);

  return (
    <div className={cn("relative p-[1.5px]", borderRadius, className)}>
      {/* Static gradient border */}
      <div
        className={cn("absolute inset-0", borderRadius)}
        style={{
          background: `linear-gradient(135deg, ${accentColor}, ${second}, ${accentColor})`,
          opacity: Math.min(op, 1),
        }}
      />
      {/* Outer glow */}
      <div
        className={cn("absolute -inset-[1px] pointer-events-none", borderRadius)}
        style={{
          boxShadow: `0 0 15px ${accentColor.replace(/[\d.]+\)$/, `${Math.min(gop, 0.4)})`)}`,
        }}
      />
      {/* Inner content */}
      <div className={cn("relative", borderRadius)} style={{ borderRadius: "inherit" }}>
        {children}
      </div>
    </div>
  );
}
