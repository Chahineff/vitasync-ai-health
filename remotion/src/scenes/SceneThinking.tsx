import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS } from "../theme";

const STEPS = [
  "Reading your sleep profile",
  "Cross-checking onset speed needs",
  "Filtering fast-acting wellness picks",
];

export const SceneThinking: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 20 } });
  const drift = Math.sin(frame * 0.07) * 5;

  // orbiting particles
  const orbitals = Array.from({ length: 14 }).map((_, i) => {
    const ring = i % 3;
    const radius = 200 + ring * 70;
    const speed = 0.04 - ring * 0.008;
    const a = frame * speed + (i / 14) * Math.PI * 2;
    return {
      x: Math.cos(a) * radius,
      y: Math.sin(a) * radius * 0.6,
      ring,
      i,
    };
  });

  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* core */}
      <div style={{ position: "relative", width: 0, height: 0 }}>
        {/* central pulsating core */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: -120,
            transform: "translate(-50%, -50%)",
            width: 110 + Math.sin(frame * 0.18) * 14,
            height: 110 + Math.sin(frame * 0.18) * 14,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${COLORS.cream} 0%, ${COLORS.electricGlow} 35%, ${COLORS.electric} 75%, transparent 100%)`,
            boxShadow: `0 0 80px ${COLORS.electric}cc, 0 0 160px ${COLORS.mint}66`,
            opacity: titleIn,
          }}
        />
        {/* orbit rings */}
        {[0, 1, 2].map((r) => (
          <div
            key={r}
            style={{
              position: "absolute",
              left: 0,
              top: -120,
              width: (200 + r * 70) * 2,
              height: (200 + r * 70) * 2 * 0.6,
              borderRadius: "50%",
              border: `1px dashed ${COLORS.electric}${["55", "33", "1f"][r]}`,
              transform: `translate(-50%, -50%) rotate(${frame * (0.4 - r * 0.1)}deg)`,
              opacity: titleIn,
            }}
          />
        ))}
        {/* orbital dots */}
        {orbitals.map((o) => (
          <div
            key={o.i}
            style={{
              position: "absolute",
              left: o.x,
              top: -120 + o.y,
              width: 14 - o.ring * 2,
              height: 14 - o.ring * 2,
              borderRadius: "50%",
              background: o.ring === 0 ? COLORS.cream : o.ring === 1 ? COLORS.mint : COLORS.electricGlow,
              boxShadow: `0 0 18px ${o.ring === 1 ? COLORS.mint : COLORS.electricGlow}`,
              transform: "translate(-50%, -50%)",
              opacity: titleIn,
            }}
          />
        ))}
      </div>

      {/* status text */}
      <div
        style={{
          position: "absolute",
          bottom: 220,
          left: 0,
          right: 0,
          textAlign: "center",
          transform: `translateY(${drift}px)`,
        }}
      >
        <div
          style={{
            fontFamily: "Inter",
            fontSize: 18,
            color: COLORS.muted,
            letterSpacing: 6,
            textTransform: "uppercase",
            marginBottom: 18,
            opacity: titleIn,
          }}
        >
          VitaSync AI · Thinking
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
          {STEPS.map((s, i) => {
            const stepIn = interpolate(frame, [20 + i * 22, 40 + i * 22], [0, 1], {
              extrapolateRight: "clamp",
              extrapolateLeft: "clamp",
            });
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  opacity: stepIn,
                  transform: `translateX(${(1 - stepIn) * 20}px)`,
                  fontFamily: "Space Grotesk",
                  fontSize: 26,
                  color: COLORS.cream,
                  fontWeight: 400,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: COLORS.mint,
                    boxShadow: `0 0 14px ${COLORS.mint}`,
                  }}
                />
                {s}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};