import { useEffect, useMemo } from "react";
import { computeArchetype } from "../../data/archetypes";
import { GREETING_POEMS } from "../../data/greetingPoems";
import { THEME_SPARK } from "../../data/roleGlyph";
import { playSfx } from "../../lib/audio";
import { chronoPeriod } from "../../lib/chrono";

function AvatarGreetingModal({ role, roleColor, roleColor2, theme, archetypeCtx, onClose }) {
    const period = chronoPeriod(new Date().getHours());
    const poemSet = GREETING_POEMS[period.name] || GREETING_POEMS.Day;
    const poem = useMemo(() => poemSet[Math.floor(Math.random() * poemSet.length)], []);
    const spark = THEME_SPARK[theme] || "✦";
    const archetype = useMemo(() => computeArchetype(archetypeCtx || {}), [archetypeCtx]);
    useEffect(() => { playSfx("unlock"); }, []);
    return (<div className="modal-backdrop" onClick={onClose}>
      <div className="card modal avatar-greet-modal" onClick={e => e.stopPropagation()}>
        <div className="greet-character-wrap">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <defs>
              <radialGradient id="greetFace" cx="40%" cy="35%" r="70%">
                <stop offset="0%" stopColor={roleColor2 || roleColor}/>
                <stop offset="100%" stopColor={roleColor}/>
              </radialGradient>
            </defs>
            <circle cx="60" cy="64" r="42" fill="url(#greetFace)"/>
            <circle cx="60" cy="30" r="4" fill="#fff" opacity="0.5" className="greet-spark-orbit"/>
            <g className="greet-blink">
              <ellipse cx="45" cy="60" rx="5" ry="7" fill="#141220"/>
              <ellipse cx="75" cy="60" rx="5" ry="7" fill="#141220"/>
              <circle cx="47" cy="57" r="1.6" fill="#fff"/>
              <circle cx="77" cy="57" r="1.6" fill="#fff"/>
            </g>
            <ellipse cx="38" cy="72" rx="6" ry="3.4" fill="#ff8fa3" opacity="0.5"/>
            <ellipse cx="82" cy="72" rx="6" ry="3.4" fill="#ff8fa3" opacity="0.5"/>
            <path d="M48 80 Q60 90 72 80" stroke="#141220" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
          </svg>
          <div className="greet-theme-spark">{spark}</div>
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: "var(--accent2)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Right now, you are</div>
        <div className="serif" style={{ fontSize: 17, marginTop: 2 }}>{archetype.name}</div>
        <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{archetype.desc}</div>
        <div className="section-title" style={{ marginTop: 14 }}>Your {period.icon} {period.name} greeting</div>
        <div className="greet-speech-bubble">
          {poem.split("\n").map((line, i) => <div key={i}>{line}</div>)}
        </div>
        <button className="btn btn-primary" style={{ marginTop: 16, width: "100%" }} onClick={onClose}>Back to it</button>
      </div>
    </div>);
}

export { AvatarGreetingModal };
