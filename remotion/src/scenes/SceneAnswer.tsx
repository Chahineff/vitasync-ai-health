import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { Glass } from "../components/Glass";
import { COLORS } from "../theme";

const ANSWER_LINES = [
  "For tonight, the fastest option is",
  "Sleep Strips",
];

const REASONS = [
  { t: "Sublingual delivery — absorbs in minutes", c: COLORS.mint },
  { t: "Melatonin + L-Theanine blend for fast onset", c: COLORS.electricGlow },
  { t: "Pocket-sized · no water needed before bed", c: COLORS.mint },
];

export const SceneAnswer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 20 } });
  const cardIn = spring({ frame: frame - 22, fps, config: { damping: 16, stiffness: 110 } });
  const drift = Math.sin(frame * 0.05) * 4;
  const productFloat = Math.sin(frame * 0.08) * 6;

  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", gap: 80, alignItems: "center" }}>
        {/* Left: text */}
        <div style={{ maxWidth: 760, transform: `translateY(${drift}px)` }}>
          <div
            style={{
              fontFamily: "Inter",
              fontSize: 18,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: COLORS.mint,
              opacity: titleIn,
              marginBottom: 18,
            }}
          >
            VitaSync recommends
          </div>
          <div
            style={{
              fontFamily: "Space Grotesk",
              fontWeight: 400,
              fontSize: 42,
              color: COLORS.muted,
              lineHeight: 1.25,
              opacity: interpolate(frame, [4, 22], [0, 1], { extrapolateRight: "clamp" }),
              transform: `translateY(${interpolate(frame, [4, 22], [16, 0], { extrapolateRight: "clamp" })}px)`,
              marginBottom: 8,
            }}
          >
            {ANSWER_LINES[0]}
          </div>
          <div
            style={{
              fontFamily: "Space Grotesk",
              fontWeight: 700,
              fontSize: 128,
              lineHeight: 1,
              letterSpacing: -3,
              background: `linear-gradient(135deg, ${COLORS.cream} 0%, ${COLORS.mint} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              opacity: interpolate(frame, [18, 38], [0, 1], { extrapolateRight: "clamp" }),
              transform: `translateY(${interpolate(frame, [18, 38], [30, 0], { extrapolateRight: "clamp" })}px)`,
              marginBottom: 36,
            }}
          >
            {ANSWER_LINES[1]}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {REASONS.map((r, i) => {
              const rIn = interpolate(frame, [50 + i * 22, 70 + i * 22], [0, 1], {
                extrapolateRight: "clamp",
                extrapolateLeft: "clamp",
              });
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    opacity: rIn,
                    transform: `translateX(${(1 - rIn) * 28}px)`,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: `${r.c}22`,
                      border: `1px solid ${r.c}66`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: r.c,
                      fontFamily: "Space Grotesk",
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </div>
                  <div
                    style={{
                      fontFamily: "Inter",
                      fontWeight: 400,
                      fontSize: 24,
                      color: COLORS.cream,
                    }}
                  >
                    {r.t}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: product card */}
        <Glass
          style={{
            width: 460,
            padding: 36,
            opacity: cardIn,
            transform: `translateY(${(1 - cardIn) * 40 + productFloat}px) scale(${0.92 + cardIn * 0.08})`,
          }}
        >
          {/* product visual */}
          <div
            style={{
              width: "100%",
              height: 360,
              borderRadius: 22,
              background: `linear-gradient(160deg, ${COLORS.slate} 0%, ${COLORS.ink2} 100%)`,
              position: "relative",
              overflow: "hidden",
              marginBottom: 24,
              border: `1px solid ${COLORS.electric}33`,
            }}
          >
            {/* glowing aura */}
            <div
              style={{
                position: "absolute",
                inset: -40,
                background: `radial-gradient(circle at 50% 60%, ${COLORS.mint}55 0%, transparent 60%)`,
                filter: "blur(20px)",
              }}
            />
            {/* strip pack illustration */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%) rotate(${-12 + Math.sin(frame * 0.06) * 2}deg)`,
                width: 200,
                height: 240,
                borderRadius: 22,
                background: `linear-gradient(160deg, ${COLORS.electric} 0%, ${COLORS.mint} 100%)`,
                boxShadow: `0 30px 80px ${COLORS.mint}55, inset 0 1px 0 rgba(255,255,255,0.4)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "24px 18px",
                color: COLORS.ink,
                fontFamily: "Space Grotesk",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: 2 }}>VITASYNC</div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>SLEEP</div>
                <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>STRIPS</div>
                <div style={{ fontSize: 11, marginTop: 8, opacity: 0.7 }}>30 fast-melt strips</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.7 }}>Sublingual · Melatonin + L-Theanine</div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontFamily: "Inter", fontSize: 14, color: COLORS.muted, letterSpacing: 1, textTransform: "uppercase" }}>
                Sleep · Fast onset
              </div>
              <div style={{ fontFamily: "Space Grotesk", fontSize: 26, fontWeight: 600, color: COLORS.cream, marginTop: 4 }}>
                Sleep Strips
              </div>
            </div>
            <div style={{ fontFamily: "Space Grotesk", fontSize: 32, fontWeight: 700, color: COLORS.mint }}>
              $24
            </div>
          </div>

          {/* match meter */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontFamily: "Inter", fontSize: 14, color: COLORS.muted }}>
              <span>Match for you</span>
              <span style={{ color: COLORS.mint, fontWeight: 600 }}>
                {Math.min(96, Math.round(interpolate(frame, [40, 110], [0, 96], { extrapolateRight: "clamp", extrapolateLeft: "clamp" })))}%
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${interpolate(frame, [40, 110], [0, 96], { extrapolateRight: "clamp", extrapolateLeft: "clamp" })}%`,
                  background: `linear-gradient(90deg, ${COLORS.electric} 0%, ${COLORS.mint} 100%)`,
                  boxShadow: `0 0 18px ${COLORS.mint}aa`,
                }}
              />
            </div>
          </div>
        </Glass>
      </div>
    </AbsoluteFill>
  );
};