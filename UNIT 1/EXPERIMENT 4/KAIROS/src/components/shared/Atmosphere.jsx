import { useEffect, useRef, useMemo, Fragment } from "react";
import { Scene3D } from "./Scene3D";

function Atmosphere({ kind }) {
    const starsFar = useMemo(() => Array.from({ length: 50 }, () => ({
        top: Math.random() * 100, left: Math.random() * 100, size: Math.random() * 1.2 + 0.5, delay: Math.random() * 4, dur: Math.random() * 2.5 + 2.5
    })), [kind]);
    const starsMid = useMemo(() => Array.from({ length: 25 }, () => ({
        top: Math.random() * 100, left: Math.random() * 100, size: Math.random() * 1.6 + 1, delay: Math.random() * 4, dur: Math.random() * 2.5 + 2.5
    })), [kind]);
    const starsNear = useMemo(() => Array.from({ length: 10 }, () => ({
        top: Math.random() * 100, left: Math.random() * 100, size: Math.random() * 2 + 1.8, delay: Math.random() * 4, dur: Math.random() * 2.5 + 2.5
    })), [kind]);
    const shooters = useMemo(() => Array.from({ length: 4 }, () => ({
        top: Math.random() * 40, left: 60 + Math.random() * 35, delay: Math.random() * 6
    })), [kind]);
    const drops = useMemo(() => Array.from({ length: 60 }, () => ({
        left: Math.random() * 100, height: Math.random() * 60 + 40, dur: Math.random() * 1 + 0.6, delay: Math.random() * 2
    })), [kind]);
    const fireflies = useMemo(() => Array.from({ length: 14 }, () => ({
        top: Math.random() * 90, left: Math.random() * 90, delay: Math.random() * 6
    })), [kind]);
    const clouds = useMemo(() => Array.from({ length: 4 }, () => ({
        top: Math.random() * 30 + 5, size: Math.random() * 120 + 80, delay: Math.random() * 20, dur: Math.random() * 20 + 36
    })), [kind]);
    const windParticles = useMemo(() => Array.from({ length: 16 }, () => ({
        top: Math.random() * 100, delay: Math.random() * 3, dur: Math.random() * 1.2 + 1.4
    })), [kind]);
    const petals = useMemo(() => Array.from({ length: 22 }, () => ({
        left: Math.random() * 100, delay: Math.random() * 10, dur: Math.random() * 6 + 8, size: Math.random() * 6 + 8, sway: Math.random() * 40 + 20
    })), [kind]);
    const farRef = useRef(null);
    const midRef = useRef(null);
    const nearRef = useRef(null);
    useEffect(() => {
        let raf = 0;
        let x = 0, y = 0;
        const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        if (reduceMotion) return undefined;
        function onMove(e) {
            x = e.clientX;
            y = e.clientY;
            if (!raf) {
                raf = requestAnimationFrame(() => {
                    raf = 0;
                    const nx = x / window.innerWidth - 0.5;
                    const ny = y / window.innerHeight - 0.5;
                    if (farRef.current) farRef.current.style.transform = `translate3d(${nx * -6}px, ${ny * -6}px, 0)`;
                    if (midRef.current) midRef.current.style.transform = `translate3d(${nx * -16}px, ${ny * -16}px, 0)`;
                    if (nearRef.current) nearRef.current.style.transform = `translate3d(${nx * -32}px, ${ny * -32}px, 0) scale(1.02)`;
                });
            }
        }
        window.addEventListener("mousemove", onMove, { passive: true });
        return () => {
            window.removeEventListener("mousemove", onMove);
            if (raf) cancelAnimationFrame(raf);
        };
    }, []);
    const layeredStars = (kind === "cosmic" || kind === "nebula");
    return (<div className="atmosphere">
    <Scene3D kind={kind}/>
    {layeredStars ? (<Fragment>
        <div className="atmosphere-parallax" ref={farRef}>
          <div className="stars">
            {starsFar.map((s, i) => <div key={i} className="star" style={{ top: s.top + "%", left: s.left + "%", width: s.size, height: s.size, opacity: 0.5, animationDelay: s.delay + "s", animationDuration: s.dur + "s" }}/>)}
          </div>
          {kind === "nebula" && <Fragment>
            <div className="nebula-cloud" style={{ top: "10%", left: "10%", width: 260, height: 260, background: "var(--accent)" }}/>
            <div className="nebula-cloud" style={{ top: "45%", left: "60%", width: 220, height: 220, background: "var(--accent2)", animationDelay: "4s" }}/>
          </Fragment>}
        </div>
        <div className="atmosphere-parallax" ref={midRef}>
          <div className="stars">
            {starsMid.map((s, i) => <div key={i} className="star" style={{ top: s.top + "%", left: s.left + "%", width: s.size, height: s.size, opacity: 0.75, animationDelay: s.delay + "s", animationDuration: s.dur + "s" }}/>)}
          </div>
          {kind === "nebula" && <div className="aurora-ribbon" style={{ top: "10%", background: "linear-gradient(90deg, var(--accent), var(--accent2))", animationDuration: "20s" }}/>}
        </div>
        <div className="atmosphere-parallax" ref={nearRef}>
          <div className="stars">
            {starsNear.map((s, i) => <div key={i} className="star" style={{ top: s.top + "%", left: s.left + "%", width: s.size, height: s.size, boxShadow: "0 0 6px 1px rgba(255,255,255,0.6)", animationDelay: s.delay + "s", animationDuration: s.dur + "s" }}/>)}
          </div>
          {shooters.map((s, i) => <div key={i} className="shooting-star" style={{ top: s.top + "%", left: s.left + "%", animationDelay: s.delay + "s" }}/>)}
        </div>
      </Fragment>) : (<div className="atmosphere-parallax" ref={midRef}>
      {kind === "rain" && <Fragment>
        <div className="rainwrap">
          {drops.map((d, i) => <div key={i} className="raindrop" style={{ left: d.left + "%", height: d.height, animationDuration: d.dur + "s", animationDelay: d.delay + "s" }}/>)}
        </div>
        <div className="mist-layer" style={{ top: "55%" }}/>
      </Fragment>}

      {kind === "aurora" && <Fragment>
        <div className="aurora-ribbon" style={{ top: "5%", background: "linear-gradient(90deg, var(--accent), var(--accent2))", animationDelay: "0s" }}/>
        <div className="aurora-ribbon" style={{ top: "18%", background: "linear-gradient(90deg, var(--accent2), var(--accent))", animationDelay: "3s", animationDuration: "16s" }}/>
        <div className="stars">
          {starsFar.slice(0, 30).map((s, i) => <div key={i} className="star" style={{ top: (s.top * 0.5) + "%", left: s.left + "%", width: s.size * 0.7, height: s.size * 0.7, animationDelay: s.delay + "s" }}/>)}
        </div>
        {fireflies.map((f, i) => <div key={i} className="firefly" style={{ top: f.top + "%", left: f.left + "%", animationDelay: f.delay + "s" }}/>)}
      </Fragment>}

      {kind === "zen" && <Fragment>
        <div className="zen-orb" style={{ width: 280, height: 280, top: "20%", left: "15%" }}/>
        <div className="zen-orb" style={{ width: 200, height: 200, top: "55%", left: "65%", animationDelay: "5s", animationDuration: "18s" }}/>
        {fireflies.slice(0, 6).map((f, i) => <div key={i} className="firefly" style={{ top: f.top + "%", left: f.left + "%", animationDelay: f.delay + "s", opacity: 0.5 }}/>)}
      </Fragment>}

      {kind === "grid" && <Fragment>
        <div className="cyber-floor-wrap">
          <div className="cyber-floor"/>
        </div>
        <div className="grid-cyber" style={{ opacity: 0.35 }}/>
        <div className="cyber-scan" style={{ animationDelay: "0s" }}/>
        <div className="cyber-scan" style={{ animationDelay: "2.5s", opacity: 0.3 }}/>
        <div className="glitch-line" style={{ top: "22%", animationDelay: "0s" }}/>
        <div className="glitch-line" style={{ top: "61%", animationDelay: "1.6s" }}/>
        <div className="glitch-line" style={{ top: "84%", animationDelay: "2.9s" }}/>
      </Fragment>}

      {kind === "sunset" && <Fragment>
        <div className="sun-disc-3d-wrap">
          <div className="sun-disc-3d"/>
        </div>
        {clouds.map((c, i) => <div key={i} className="cloud-drift" style={{ top: c.top + "%", width: c.size, height: c.size * 0.4, animationDelay: c.delay + "s", animationDuration: c.dur + "s" }}/>)}
        <div className="sun-horizon"/>
      </Fragment>}

      {kind === "storm" && <Fragment>
        <div className="grid-cyber" style={{ opacity: 0.4 }}/>
        <div className="rainwrap" style={{ opacity: 0.3 }}>
          {drops.slice(0, 30).map((d, i) => <div key={i} className="raindrop" style={{ left: d.left + "%", height: d.height, animationDuration: (d.dur * 0.7) + "s", animationDelay: d.delay + "s" }}/>)}
        </div>
        {windParticles.map((w, i) => <div key={i} className="wind-particle" style={{ top: w.top + "%", animationDelay: w.delay + "s", animationDuration: w.dur + "s" }}/>)}
        <div className="flash"/>
      </Fragment>}

      {kind === "petals" && <Fragment>
        {petals.map((p, i) => <div key={i} className="sakura-petal" style={{ left: p.left + "%", width: p.size, height: p.size * 0.8, animationDelay: p.delay + "s", animationDuration: p.dur + "s", "--sway": p.sway + "px" }}/>)}
        <div className="zen-orb" style={{ width: 220, height: 220, top: "12%", left: "70%", opacity: 0.25 }}/>
      </Fragment>}
    </div>)}
    </div>);
}

export { Atmosphere };
