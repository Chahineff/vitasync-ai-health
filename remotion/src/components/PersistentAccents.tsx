import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

export const PersistentAccents: React.FC = () => {
  const frame = useCurrentFrame();
  const orbs = [
    { x: 15, y: 30, r: 220, c: COLORS.electric, s: 0.04, ph: 0 },
    { x: 80, y: 70, r: 280, c: COLORS.mint, s: 0.03, ph: 1.5 },
    { x: 65, y: 20, r: 160, c: COLORS.electricGlow, s: 0.05, ph: 3 },
    { x: 30, y: 85, r: 180, c: COLORS.mintGlow, s: 0.045, ph: 4.2 },
  ];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          transform: `translateY(${Math.sin(frame * 0.01) * 8}px)`,
        }}
      />
      {orbs.map((o, i) => {
        const dx = Math.sin(frame * o.s + o.ph) * 40;
        const dy = Math.cos(frame * o.s + o.ph) * 30;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${o.x}%`,
              top: `${o.y}%`,
              width: o.r,
              height: o.r,
              transform: `translate(${dx}px, ${dy}px) translate(-50%, -50%)`,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${o.c}55 0%, transparent 70%)`,
              filter: "blur(40px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};