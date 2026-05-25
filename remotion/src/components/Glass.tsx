import React from "react";

export const Glass: React.FC<React.PropsWithChildren<{ style?: React.CSSProperties }>> = ({ children, style }) => {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
        borderRadius: 28,
        ...style,
      }}
    >
      {children}
    </div>
  );
};