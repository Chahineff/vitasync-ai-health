"use client";

import { cn } from "@/lib/utils";

type TColorProp = string | string[];

interface ShineBorderProps {
  borderRadius?: number;
  borderWidth?: number;
  duration?: number;
  color?: TColorProp;
  className?: string;
  children: React.ReactNode;
}

export function ShineBorder({
  borderRadius = 8,
  borderWidth = 1,
  duration = 14,
  color = "#000000",
  className,
  children,
}: ShineBorderProps) {
  return (
    <div
      style={{
        "--shine-pulse-duration": `${duration}s`,
        "--shine-border-radius": `${borderRadius}px`,
        "--shine-border-width": `${borderWidth}px`,
        "--shine-color": Array.isArray(color) ? color.join(",") : color,
      } as React.CSSProperties}
      className={cn(
        "relative min-h-[60px] rounded-[--shine-border-radius] p-[--shine-border-width]",
        "before:absolute before:inset-0 before:rounded-[--shine-border-radius]",
        "before:bg-[length:300%_300%] before:animate-shine",
        "before:[background-image:linear-gradient(45deg,transparent_25%,var(--shine-color)_50%,transparent_75%,transparent_100%)]",
        className
      )}
    >
      <div
        className="relative z-[1] h-full w-full rounded-[calc(var(--shine-border-radius)-var(--shine-border-width))]"
        style={{ borderRadius: `calc(${borderRadius}px - ${borderWidth}px)` }}
      >
        {children}
      </div>
    </div>
  );
}
