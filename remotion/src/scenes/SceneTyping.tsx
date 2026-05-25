import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { Glass } from "../components/Glass";
import { COLORS } from "../theme";

const FULL_TEXT = "I want to fall asleep fast tonight — no time, need something that works in minutes before bed.";

export const SceneTyping: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardIn = spring({ frame, fps, config: { damping: 22, stiffness: 120 } });
  const labelOpacity = interpolate(frame, [6, 22], [0, 1], { extrapolateRight: "clamp" });

  // typing
  const typeStart = 18;
  const charsPerFrame = 0.95;
  const visibleChars = Math.min(
    FULL_TEXT.length,
    Math.max(0, Math.floor((frame - typeStart) * charsPerFrame))
  );
  const typedText = FULL_TEXT.slice(0, visibleChars);
  const cursorOn = Math.floor(frame / 8) % 2 === 0;

  const drift = Math.sin(frame * 0.05) * 4;

  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Glass
        style={{
          width: 1280,
          padding: 56,
          opacity: cardIn,
          transform: `translateY(${(1 - cardIn) * 30 + drift}px) scale(${0.96 + cardIn * 0.04})`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 22,
            opacity: labelOpacity,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: COLORS.electric,
              boxShadow: `0 0 18px ${COLORS.electric}`,
              animation: "none",
              transform: `scale(${1 + Math.sin(frame * 0.3) * 0.15})`,
            }}
          />
          <div
            style={{
              fontFamily: "Inter",
              fontSize: 18,
              fontWeight: 500,
              color: COLORS.muted,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            You are asking VitaSync
          </div>
        </div>

        <div
          style={{
            fontFamily: "Space Grotesk",
            fontWeight: 500,
            fontSize: 56,
            color: COLORS.cream,
            lineHeight: 1.2,
            minHeight: 220,
            letterSpacing: -0.5,
          }}
        >
          {typedText}
          <span
            style={{
              display: "inline-block",
              width: 4,
              height: 56,
              marginLeft: 6,
              background: cursorOn ? COLORS.mint : "transparent",
              transform: "translateY(8px)",
              boxShadow: cursorOn ? `0 0 14px ${COLORS.mint}` : "none",
            }}
          />
        </div>

        <div
          style={{
            marginTop: 28,
            display: "flex",
            alignItems: "center",
            gap: 10,
            opacity: interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: COLORS.muted,
                opacity: 0.35 + Math.max(0, Math.sin(frame * 0.25 - i * 0.6)) * 0.65,
              }}
            />
          ))}
          <span style={{ marginLeft: 8, color: COLORS.muted, fontFamily: "Inter", fontSize: 18 }}>
            typing
          </span>
        </div>
      </Glass>
    </AbsoluteFill>
  );
};