import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { Logo } from "../components/Logo";
import { COLORS } from "../theme";

export const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const reveal = spring({ frame, fps, config: { damping: 18, stiffness: 110 } });
  const ringScale = spring({ frame: frame - 6, fps, config: { damping: 14, stiffness: 80 } });
  const tagOpacity = interpolate(frame, [22, 38], [0, 1], { extrapolateRight: "clamp" });
  const tagY = interpolate(frame, [22, 42], [16, 0], { extrapolateRight: "clamp" });
  const drift = Math.sin(frame * 0.06) * 6;

  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative", transform: `translateY(${drift}px)` }}>
        {/* glowing rings */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 320 + i * 140,
              height: 320 + i * 140,
              transform: `translate(-50%, -50%) scale(${0.6 + ringScale * 0.4 + i * 0.05})`,
              border: `1px solid ${COLORS.electric}${["55", "33", "1f"][i]}`,
              borderRadius: "50%",
              opacity: interpolate(frame, [0, 20 + i * 4], [0, 1], { extrapolateRight: "clamp" }) * (1 - i * 0.2),
            }}
          />
        ))}
        <div
          style={{
            opacity: reveal,
            transform: `scale(${0.85 + reveal * 0.15})`,
            filter: `blur(${(1 - reveal) * 8}px)`,
          }}
        >
          <Logo size={140} />
        </div>
        <div
          style={{
            marginTop: 32,
            opacity: tagOpacity,
            transform: `translateY(${tagY}px)`,
            textAlign: "center",
            fontFamily: "Inter",
            fontWeight: 300,
            fontSize: 28,
            color: COLORS.muted,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          AI Wellness Coach
        </div>
      </div>
    </AbsoluteFill>
  );
};