import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../theme";

export const PersistentBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [0, 600], [0, 360], { extrapolateRight: "extend" });
  const b = interpolate(frame, [0, 600], [0, -180], { extrapolateRight: "extend" });
  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(60% 50% at ${20 + Math.sin((a * Math.PI) / 180) * 10}% ${10 + Math.cos((a * Math.PI) / 180) * 8}%, ${COLORS.electric}40 0%, transparent 60%),
          radial-gradient(55% 50% at ${85 + Math.cos((b * Math.PI) / 180) * 8}% ${75 + Math.sin((b * Math.PI) / 180) * 10}%, ${COLORS.mint}33 0%, transparent 60%),
          radial-gradient(80% 60% at 50% 50%, ${COLORS.slate}88 0%, ${COLORS.ink} 70%),
          linear-gradient(180deg, ${COLORS.ink} 0%, ${COLORS.ink2} 100%)
        `,
      }}
    />
  );
};