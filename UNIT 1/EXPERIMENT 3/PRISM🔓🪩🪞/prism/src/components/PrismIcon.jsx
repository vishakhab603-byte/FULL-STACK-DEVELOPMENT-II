import React from "react";

export default function PrismIcon({ color, size = 64, spinning, pulse }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        filter: `drop-shadow(0 0 ${pulse ? 18 : 8}px ${color}aa)`,
        transform: spinning ? "rotate(180deg) scale(1.08)" : "rotate(0deg)",
        transitionProperty: "transform, filter",
        transitionDuration: spinning ? "0.5s" : "0.4s",
        transitionTimingFunction: "cubic-bezier(.4,0,.2,1)",
      }}
    >
      <defs>
        <linearGradient id="facetA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="facetB" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor="#05070c" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <polygon points="50,4 90,38 50,52" fill="url(#facetA)" stroke="#ffffff33" strokeWidth="0.5" />
      <polygon points="50,4 10,38 50,52" fill={color} opacity="0.55" stroke="#ffffff22" strokeWidth="0.5" />
      <polygon points="10,38 50,52 50,96" fill="url(#facetB)" stroke="#ffffff22" strokeWidth="0.5" />
      <polygon points="90,38 50,52 50,96" fill={color} opacity="0.35" stroke="#ffffff22" strokeWidth="0.5" />
    </svg>
  );
}
