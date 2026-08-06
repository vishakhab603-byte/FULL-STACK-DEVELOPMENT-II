import React from "react";

export default function Gauge({ value, color, size = 74 }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="6" fill="none"
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 1s ease, stroke 0.4s ease" }}
      />
      <text x="50%" y="52%" textAnchor="middle" fill="#F1F3F8" fontSize="18" fontWeight="700" fontFamily="'Space Grotesk', sans-serif">
        {value}
      </text>
    </svg>
  );
}
