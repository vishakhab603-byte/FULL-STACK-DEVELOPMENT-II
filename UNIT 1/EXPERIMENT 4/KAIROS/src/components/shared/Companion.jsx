import { useState, useEffect, useRef } from "react";
import { COMPANION_LINES } from "../../data/companionLines";
import { playSfx } from "../../lib/audio";

function Companion() {
    const [bubble, setBubble] = useState(null);
    const timeoutRef = useRef(null);
    function handleClick() {
        playSfx("click");
        const line = COMPANION_LINES[Math.floor(Math.random() * COMPANION_LINES.length)];
        setBubble(line);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setBubble(null), 3200);
    }
    useEffect(() => () => clearTimeout(timeoutRef.current), []);
    return (<div className="companion-wrap" onClick={handleClick} title="Say hi">
      {bubble && <div className="companion-bubble">{bubble}</div>}
      <svg className="companion-body" width="54" height="54" viewBox="0 0 54 54">
        <defs>
          <radialGradient id="companionGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="var(--accent2)"/>
            <stop offset="100%" stopColor="var(--accent)"/>
          </radialGradient>
        </defs>
        <ellipse cx="27" cy="30" rx="19" ry="17" fill="url(#companionGrad)"/>
        <ellipse className="companion-eye" cx="20" cy="27" rx="3.2" ry="4" fill="#0a0a12"/>
        <ellipse className="companion-eye" cx="34" cy="27" rx="3.2" ry="4" fill="#0a0a12"/>
        <path d="M20 36 Q27 41 34 36" stroke="#0a0a12" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <line x1="27" y1="11" x2="27" y2="16" stroke="var(--accent2)" strokeWidth="1.5"/>
        <circle cx="27" cy="8" r="3" fill="var(--accent2)" className="companion-antenna-tip"/>
      </svg>
    </div>);
}

export { Companion };
