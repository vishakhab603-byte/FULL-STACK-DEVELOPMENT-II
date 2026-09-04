import { useState, useMemo, useEffect } from "react";
import { Calendar } from "./Calendar";
import { Aperture } from "../shared/Aperture";
import { Avatar } from "../shared/Avatar";
import { Clock3D } from "../shared/Clock3D";
import { DNAHelix } from "../shared/DNAHelix";
import { DailyChallengeCard } from "../shared/DailyChallengeCard";
import { FocusTimer } from "../shared/FocusTimer";
import { Hourglass } from "../shared/Hourglass";
import { LiveClock } from "../shared/LiveClock";
import { MobiusNavigator } from "../shared/MobiusNavigator";
import { Sundial } from "../shared/Sundial";
import { TipCarousel } from "../shared/TipCarousel";
import { WorldClock } from "../shared/WorldClock";
import { ROLE_GLYPH } from "../../data/roleGlyph";
import { ROLES, THEMES } from "../../data/theme";
import { playSfx } from "../../lib/audio";
import { computeContextualGreeting } from "../../lib/greeting";


function ChronoCore({ events = [], activityLog = [], session, setPage }) {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    const minutes = now.getHours() * 60 + now.getMinutes();
    const dayPct = minutes / 1440;
    const todayKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const todaysEvents = events.filter(e => e.date === todayKey || (!e.date && Number(e.day) === now.getDate())).length;
    const recent = activityLog.slice(0, 3);
    const orbit = Math.round(dayPct * 360);
    return <section className="chrono-core card" aria-label="KAIROS Chrono Core">
      <div className="chrono-core-copy">
        <div className="chrono-core-kicker">KAIROS // CHRONO CORE</div>
        <div className="serif chrono-core-title">Your moment is <em>now.</em></div>
        <p>One living instrument connecting your schedule, actions and temporal history. The core is a visualization of workspace state, not a scientific measurement.</p>
        <div className="chrono-core-actions">
          <button className="btn" onClick={() => setPage("calendar")}>Open today</button>
          <button className="btn" onClick={() => setPage("river")}>Enter the River</button>
          <button className="btn" onClick={() => setPage("timemachine")}>Look back</button>
        </div>
      </div>
      <div className="chrono-core-orb" style={{'--core-angle': `${orbit}deg`}}>
        <div className="chrono-core-halo"/><div className="chrono-core-ring ring-a"/><div className="chrono-core-ring ring-b"/>
        <div className="chrono-core-sun"><span>{now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span><small>TODAY</small></div>
        <i className="chrono-core-satellite sat-a"/><i className="chrono-core-satellite sat-b"/>
      </div>
      <div className="chrono-core-readout">
        <div><b>{Math.round(dayPct*100)}%</b><span>day elapsed</span></div>
        <div><b>{todaysEvents}</b><span>today's moments</span></div>
        <div><b>{activityLog.length}</b><span>chronicle entries</span></div>
        <div className="chrono-core-trace"><span>LIVE TRACE</span>{recent.length ? recent.map((a,i)=><small key={i}>{a.text}</small>) : <small>Begin shaping your time.</small>}</div>
      </div>
    </section>;
}

function CommandCenterDefault({ session, setPage, bump, activityLog, events, onClaimChallenge, challengeClaimed }) {
    const role = ROLES[session.role];
    const hour = new Date().getHours();
    const today = new Date();
    const greeting = useMemo(() => computeContextualGreeting(hour, activityLog, events || [], today), [hour, activityLog, events]);
    return (<div className="fade-in">
      <div className="topbar">
        <div>
          <div style={{ fontSize: 26 }} className="serif">{session.name} — {greeting.text}</div>
          <div style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>{role.greet}</div>
        </div>
        <LiveClock />
      </div>

      <ChronoCore events={events} activityLog={activityLog} session={session} setPage={setPage}/>

      <div className="card cc-hero stagger" style={{ animationDelay: "0.05s", marginBottom: "var(--space-4)" }}>
        <div className="cc-hero-identity">
          <Avatar color={role.color} color2={role.color2} glyph={ROLE_GLYPH[session.role]} theme={THEMES[session.theme].kind} big/>
          <div>
            <div className="stat-label">Signed in as</div>
            <div style={{ fontWeight: 700, fontSize: 17, marginTop: 2 }}>{role.label}</div>
            <div className="serif" style={{ fontSize: 12.5, color: "var(--accent)", marginTop: 8, fontStyle: "italic", maxWidth: 160 }}>"{role.quote}"</div>
          </div>
        </div>
        <div className="cc-hero-divider"/>
        <div>
          <Clock3D size={140}/>
        </div>
        <div className="cc-hero-divider"/>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Hourglass size={68}/>
        </div>
        <div className="cc-hero-divider"/>
        <div>
          <Sundial size={100}/>
        </div>
      </div>

      <div className="cc-row stagger" style={{ animationDelay: "0.12s", marginBottom: "var(--space-4)" }}>
        <MobiusNavigator setPage={setPage}/>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div className="card" style={{ padding: 20 }}>
            <div className="section-title" style={{ marginBottom: 10 }}>Go directly</div>
            <div className="cc-quickjump">
              <button className="btn" onClick={() => setPage("calendar")}>📅 Calendar</button>
              <button className="btn" onClick={() => setPage("schedulerlab")} title="The calendar + all four optimizations, together">⚙ Scheduler Duel</button>
              <button className="btn" onClick={() => setPage("duel")}>⚔ Optimization Duel</button>
            </div>
          </div>
          <TipCarousel />
        </div>
      </div>

      <div className="stagger" style={{ animationDelay: "0.19s", marginBottom: "var(--space-4)" }}>
        <DailyChallengeCard activityLog={activityLog || []} claimed={challengeClaimed} onClaim={(challenge) => { if (onClaimChallenge)
        onClaimChallenge(challenge); }}/>
      </div>

      <div className="cc-row stagger" style={{ animationDelay: "0.26s" }}>
        <FocusTimer onComplete={() => { playSfx("success"); if (bump)
        bump("Completed a 25-minute focus session", 8); }}/>
        <WorldClock />
      </div>
    </div>);
}

function CommandCenterMinimal({ session, setPage }) {
    const role = ROLES[session.role];
    const links = [["Calendar", "calendar"], ["Optimization Duel", "duel"], ["Rendering Observatory", "observatory"], ["Time Machine", "timemachine"]];
    return (<div className="fade-in mono" style={{ maxWidth: 720 }}>
      <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Command Center — Minimal Observatory</div>
      <div className="serif" style={{ fontSize: 30, margin: "12px 0 4px" }}>{session.name}</div>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 26 }}>{role.label} · {role.greet}</div>
      <LiveClock />
      <div style={{ marginTop: 26, borderTop: "1px solid var(--panel-border)" }}>
        {links.map(([label, key]) => (<div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "14px 2px", borderBottom: "1px solid var(--panel-border)", cursor: "pointer" }} onClick={() => setPage(key)}>
            <span>{label}</span><span style={{ color: "var(--muted)" }}>→</span>
          </div>))}
      </div>
    </div>);
}

function CommandCenterGalaxy({ session, setPage, events }) {
    const role = ROLES[session.role];
    const [active, setActive] = useState(null);
    const [hovered, setHovered] = useState(null);
    const positioned = useMemo(() => events.map(e => {
        const seed = String(e.id).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
        const x = (seed * 37) % 86 + 6;
        const y = (seed * 53) % 78 + 10;
        const size = 8 + (seed % 3) * 3;
        return { ...e, x, y, size };
    }), [events]);
    const bgStars = useMemo(() => Array.from({ length: 60 }, () => ({
        top: Math.random() * 100, left: Math.random() * 100, size: Math.random() * 1.6 + 0.5, delay: Math.random() * 3.6
    })), []);
    const links = useMemo(() => {
        const byColor = {};
        positioned.forEach(p => { (byColor[p.color] ||= []).push(p); });
        const out = [];
        Object.values(byColor).forEach(group => {
            for (let i = 0; i < group.length - 1; i++) {
                out.push([group[i], group[i + 1]]);
            }
        });
        return out;
    }, [positioned]);
    return (<div className="fade-in">
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <Avatar color={role.color} color2={role.color2} glyph={ROLE_GLYPH[session.role]} theme={THEMES[session.theme].kind} big/>
        <div>
          <div className="serif" style={{ fontSize: 24 }}>{session.name}'s Galaxy</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Every scheduled piece of content is a star. Same color, same campaign — constellations connect them. Click one.</div>
        </div>
      </div>
      <div className="card galaxy-box">
        {bgStars.map((s, i) => (<div key={i} className="galaxy-bg-star" style={{ top: s.top + "%", left: s.left + "%", width: s.size, height: s.size, animationDelay: s.delay + "s", opacity: 0.5 }}/>))}
        <svg className="galaxy-lines" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          {links.map(([a, b], i) => (<line key={i} x1={a.x + "%"} y1={a.y + "%"} x2={b.x + "%"} y2={b.y + "%"} stroke={a.color} strokeWidth="1" strokeOpacity="0.35" strokeDasharray="2 5"/>))}
        </svg>
        {positioned.map(e => (<div key={e.id} className="star-node" style={{
                left: e.x + "%", top: e.y + "%", width: e.size, height: e.size, background: e.color,
                boxShadow: `0 0 ${e.size * 2}px ${e.size * 0.7}px ${e.color}, 0 0 3px 1px #fff`
            }} onMouseEnter={() => setHovered(e)} onMouseLeave={() => setHovered(h => h && h.id === e.id ? null : h)} onClick={() => setActive(e)}/>))}
        {hovered &&
            <div style={{
                    position: "absolute", left: hovered.x + "%", top: `calc(${hovered.y}% + 14px)`, transform: "translateX(-50%)",
                    fontSize: 10.5, color: "var(--text)", background: "rgba(0,0,0,0.6)", padding: "3px 8px", borderRadius: 6,
                    pointerEvents: "none", whiteSpace: "nowrap", border: "1px solid var(--panel-border)"
                }}>
            {hovered.title}
          </div>}
        {active &&
            <div className="card galaxy-caption">
            <b>{active.title}</b>
            <span style={{ color: "var(--muted)", marginLeft: 8, fontSize: 12 }}>day {active.day}</span>
          </div>}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button className="btn" onClick={() => setPage("calendar")}>Open Calendar</button>
        <button className="btn" onClick={() => setPage("duel")}>Open Duel</button>
      </div>
    </div>);
}

function CommandCenterObservatory({ session, setPage }) {
    const now = new Date();
    const opennessPct = Math.max(0, 1 - ((now.getHours() * 60 + now.getMinutes()) / 1440));
    return (<div className="fade-in mono" style={{ border: "1px solid var(--panel-border)", borderRadius: 16, padding: 26, background: "rgba(0,0,0,0.25)", textAlign: "center" }}>
      <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Observatory — Measurement Instruments</div>
      <div className="serif" style={{ fontSize: 20, margin: "8px 0 20px" }}>{session.name}</div>
      <div style={{ display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        <div><Clock3D size={130}/><div style={{ fontSize: 10, color: "var(--muted)", marginTop: 6 }}>CHRONOS — measured</div></div>
        <div><Hourglass size={78}/></div>
        <div><Aperture opennessPct={opennessPct} size={78}/><div style={{ fontSize: 10, color: "var(--muted)", marginTop: 6 }}>KAIROS — the window</div></div>
      </div>
      <div style={{ marginTop: 24, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <button className="btn" onClick={() => setPage("calendar")}>[CALENDAR]</button>
        <button className="btn" onClick={() => setPage("observatory")}>[RENDERING_OBSERVATORY]</button>
        <button className="btn" onClick={() => setPage("timemachine")}>[TIME_MACHINE]</button>
      </div>
    </div>);
}

function CommandCenterCelestial({ session, setPage, activityLog }) {
    const stars = useMemo(() => Array.from({ length: 40 }, () => ({
        top: Math.random() * 100, left: Math.random() * 100, size: Math.random() * 2 + 0.6, delay: Math.random() * 4
    })), []);
    return (<div className="fade-in">
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <div className="serif" style={{ fontSize: 22 }}>{session.name}'s Temporal Trajectory</div>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>A room containing where you've been, and where you're becoming.</div>
      </div>
      <div className="card" style={{ position: "relative", height: 140, overflow: "hidden", marginBottom: 16 }}>
        {stars.map((s, i) => <div key={i} className="star" style={{ top: s.top + "%", left: s.left + "%", width: s.size, height: s.size, animationDelay: s.delay + "s" }}/>)}
      </div>
      <div className="card" style={{ padding: 20, display: "flex", justifyContent: "center" }}>
        <DNAHelix log={activityLog || []}/>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "center" }}>
        <button className="btn" onClick={() => setPage("analytics")}>Full Analytics →</button>
        <button className="btn" onClick={() => setPage("achievements")}>Achievements →</button>
      </div>
    </div>);
}

function CommandCenterArchive({ session, setPage }) {
    return (<div className="fade-in archive-texture" style={{ border: "1px solid var(--panel-border)", borderRadius: 16, padding: 28 }}>
      <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Archive — Paper, Ink, Memory</div>
      <div className="serif" style={{ fontSize: 24, margin: "12px 0 8px", fontStyle: "italic" }}>{session.name}'s record</div>
      <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.8, fontFamily: "Georgia,serif", maxWidth: 460 }}>
        Every action you take here becomes ink that doesn't fade. Nothing in the Archive is erased — only layered, page beneath page, the way a palimpsest keeps what came before legible underneath what's written now.
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
        <button className="btn" onClick={() => setPage("timemachine")}>Open the Archive (Time Machine) →</button>
        <button className="btn" onClick={() => setPage("analytics")}>Read the ledger →</button>
      </div>
    </div>);
}

function CommandCenterClockwork({ session, setPage }) {
    return (<div className="fade-in" style={{ border: "1px solid var(--panel-border)", borderRadius: 16, padding: 28, position: "relative", overflow: "hidden" }}>
      <div className="clockwork-gear" style={{ width: 100, height: 100, top: -30, right: -30 }}/>
      <div className="clockwork-gear clockwork-gear-rev" style={{ width: 56, height: 56, top: 50, right: 60 }}/>
      <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Clockwork — Mechanical Rhythm</div>
      <div className="serif" style={{ fontSize: 22, margin: "10px 0 18px" }}>{session.name}</div>
      <div style={{ display: "flex", justifyContent: "center" }}><Clock3D size={120}/></div>
      <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "center", flexWrap: "wrap" }}>
        <button className="btn" onClick={() => setPage("schedulerlab")}>Gears in motion →</button>
        <button className="btn" onClick={() => setPage("observatory")}>Rendering Observatory →</button>
      </div>
    </div>);
}

function CommandCenterCyber({ session, setPage }) {
    const role = ROLES[session.role];
    const links = [["CALENDAR", "calendar"], ["OPT_DUEL", "duel"], ["OBSERVATORY", "observatory"], ["NETWORK_LAB", "network"], ["CHAOS_LAB", "chaos"]];
    return (<div className="fade-in mono scanlines" style={{ border: "1px solid var(--panel-border)", borderRadius: 14, padding: 22, background: "rgba(0,0,0,0.35)" }}>
      <div style={{ color: "var(--accent2)", fontSize: 12 }}>{"> kairos://command-center"}</div>
      <div style={{ fontSize: 22, margin: "10px 0", color: "var(--accent)" }}>{"USER: " + session.name.toUpperCase()}</div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 20 }}>{"ROLE: " + role.label.toUpperCase() + " :: " + role.greet}</div>
      <LiveClock />
      <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
        {links.map(([label, key]) => (<div key={key} style={{ border: "1px solid var(--panel-border)", borderRadius: 8, padding: "10px 12px", cursor: "pointer", color: "var(--accent2)" }} onClick={() => setPage(key)}>
            [{label}]
          </div>))}
      </div>
    </div>);
}

function CommandCenter({ session, setPage, skin, events, bump, activityLog, onClaimChallenge, challengeClaimed }) {
    if (skin === "minimal")
        return <CommandCenterMinimal session={session} setPage={setPage}/>;
    if (skin === "galaxy")
        return <CommandCenterGalaxy session={session} setPage={setPage} events={events}/>;
    if (skin === "cyber")
        return <CommandCenterCyber session={session} setPage={setPage}/>;
    if (skin === "observatory")
        return <CommandCenterObservatory session={session} setPage={setPage}/>;
    if (skin === "celestial")
        return <CommandCenterCelestial session={session} setPage={setPage} activityLog={activityLog}/>;
    if (skin === "archive")
        return <CommandCenterArchive session={session} setPage={setPage}/>;
    if (skin === "clockwork")
        return <CommandCenterClockwork session={session} setPage={setPage}/>;
    return <CommandCenterDefault session={session} setPage={setPage} bump={bump} activityLog={activityLog} events={events} onClaimChallenge={onClaimChallenge} challengeClaimed={challengeClaimed}/>;
}

export { CommandCenterDefault, CommandCenterMinimal, CommandCenterGalaxy, CommandCenterObservatory, CommandCenterCelestial, CommandCenterArchive, CommandCenterClockwork, CommandCenterCyber, CommandCenter };
