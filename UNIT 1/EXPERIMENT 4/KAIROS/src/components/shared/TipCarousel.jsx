import { useState, useEffect } from "react";
import { TIPS } from "../../data/tips";

function TipCarousel() {
    const [idx, setIdx] = useState(() => Math.floor(Math.random() * TIPS.length));
    useEffect(() => {
        const id = setInterval(() => setIdx(i => (i + 1) % TIPS.length), 9000);
        return () => clearInterval(id);
    }, []);
    return (<div className="card" style={{ padding: "14px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
      <span style={{ fontSize: 18 }}>💡</span>
      <div>
        <div className="stat-label">Did you know</div>
        <div key={idx} className="fade-in" style={{ fontSize: 13, color: "var(--text)", marginTop: 4, lineHeight: 1.5 }}>{TIPS[idx]}</div>
      </div>
    </div>);
}

export { TipCarousel };
