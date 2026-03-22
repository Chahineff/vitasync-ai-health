import React, { useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface HolographicCardProps {
  children: React.ReactNode;
  className?: string;
  borderRadius?: string;
}

export function HolographicCard({
  children,
  className,
  borderRadius = "rounded-2xl",
}: HolographicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 15;
    const rotateY = (centerX - x) / 15;

    card.style.setProperty("--holo-x", `${x}px`);
    card.style.setProperty("--holo-y", `${y}px`);
    card.style.setProperty("--holo-bg-x", `${(x / rect.width) * 100}%`);
    card.style.setProperty("--holo-bg-y", `${(y / rect.height) * 100}%`);
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    card.style.setProperty("--holo-x", "50%");
    card.style.setProperty("--holo-y", "50%");
    card.style.setProperty("--holo-bg-x", "50%");
    card.style.setProperty("--holo-bg-y", "50%");
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "holographic-card relative overflow-hidden transition-transform duration-200 ease-out",
        borderRadius,
        className
      )}
      style={{
        "--holo-x": "50%",
        "--holo-y": "50%",
        "--holo-bg-x": "50%",
        "--holo-bg-y": "50%",
      } as React.CSSProperties}
    >
      {/* Content */}
      <div className="relative z-[2]">{children}</div>

      {/* Holographic rainbow overlay */}
      <div
        className={cn(
          "absolute inset-0 z-[1] pointer-events-none opacity-0 transition-opacity duration-300",
          borderRadius
        )}
        style={{
          background:
            "radial-gradient(circle at var(--holo-bg-x) var(--holo-bg-y), rgba(0,240,255,0.15), rgba(59,130,246,0.1) 30%, rgba(0,215,135,0.1) 50%, rgba(168,85,247,0.08) 70%, transparent 90%)",
          mixBlendMode: "screen",
        }}
      />

      {/* Shine line that follows cursor */}
      <div
        className={cn(
          "absolute inset-0 z-[3] pointer-events-none opacity-0 transition-opacity duration-300",
          borderRadius
        )}
        style={{
          background:
            "radial-gradient(circle 150px at var(--holo-x) var(--holo-y), rgba(255,255,255,0.12), transparent 60%)",
        }}
      />

      {/* Border glow */}
      <div
        className={cn(
          "absolute inset-0 z-[1] pointer-events-none opacity-0 transition-opacity duration-300",
          borderRadius
        )}
        style={{
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,0.1), 0 0 20px rgba(0,240,255,0.08), 0 0 40px rgba(59,130,246,0.05)",
        }}
      />
    </div>
  );
}
