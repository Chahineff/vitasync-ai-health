import React from "react";
import { COLORS } from "../theme";

export const Logo: React.FC<{ size?: number }> = ({ size = 56 }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          background: `linear-gradient(135deg, ${COLORS.electric} 0%, ${COLORS.mint} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#06070D",
          fontFamily: "Space Grotesk",
          fontWeight: 700,
          fontSize: size * 0.5,
          boxShadow: `0 0 40px ${COLORS.electric}55`,
        }}
      >
        V
      </div>
      <div
        style={{
          fontFamily: "Space Grotesk",
          fontWeight: 600,
          fontSize: size * 0.55,
          color: "#F5F4EE",
          letterSpacing: -0.5,
        }}
      >
        VitaSync
      </div>
    </div>
  );
};