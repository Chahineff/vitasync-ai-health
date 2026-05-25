import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { Logo } from "../components/Logo";
import { COLORS } from "../theme";

export const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = spring({ frame, fps, config: { damping: 18 } });
  const tagIn = interpolate(frame, [14, 32], [0, 1], { extrapolateRight: "clamp" });
  const tagY = interpolate(frame, [14, 32], [14, 0], { extrapolateRight: "clamp" });
  const lineW = interpolate(frame, [22, 55], [0, 320], { extrapolateRight: "clamp" });
  const drift = Math.sin(frame * 0.06) * 4;

  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", transform: `translateY(${drift}px)` }}>
        <div style={{ opacity: reveal, transform: `scale(${0.9 + reveal * 0.1})`, display: "inline-flex" }}>
          <Logo size={120} />
        </div>
        <div
          style={{
            marginTop: 28,
            opacity: tagIn,
            transform: `translateY(${tagY}px)`,
            fontFamily: "Space Grotesk",
            fontWeight: 400,
            fontSize: 38,
            color: COLORS.cream,
            letterSpacing: -0.3,
          }}
        >
          Your wellness, answered.
        </div>
        <div
          style={{
            margin: "26px auto 0",
            height: 2,
            width: lineW,
            background: `linear-gradient(90deg, transparent, ${COLORS.mint}, transparent)`,
            boxShadow: `0 0 14px ${COLORS.mint}88`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};