import { useEffect, useRef, useState } from "react";
import { playSfx } from "../../lib/audio";

const DESTINATIONS = [
  ["command", "the Command Center"],
  ["calendar", "the Calendar"],
  ["schedulerlab", "Scheduler Duel"],
  ["duel", "Optimization Duel"],
  ["benchmark", "Benchmark Arena"],
  ["chaos", "Chaos Lab"],
  ["network", "Network Lab"],
  ["timemachine", "Time Machine"],
  ["river", "Temporal River"],
];

function MasterpieceLayer({ setPage, calm = false, autoReduced = false }) {
  const rootRef = useRef(null);
  const rafRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const [moment, setMoment] = useState(false);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || calm || autoReduced) return undefined;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return undefined;
    function onMove(e) {
      pointerRef.current.x = e.clientX;
      pointerRef.current.y = e.clientY;
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        root.style.setProperty("--mx", `${pointerRef.current.x}px`);
        root.style.setProperty("--my", `${pointerRef.current.y}px`);
      });
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [calm, autoReduced]);

  useEffect(() => {
    let timer;
    let reset;
    const wake = () => {
      clearTimeout(timer);
      clearTimeout(reset);
      timer = setTimeout(() => setMoment(true), 22000);
    };
    wake();
    window.addEventListener("pointerdown", wake, { passive: true });
    window.addEventListener("keydown", wake);
    return () => {
      clearTimeout(timer);
      clearTimeout(reset);
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("keydown", wake);
    };
  }, []);

  function dismiss() {
    setMoment(false);
  }

  function wander() {
    const [page] = DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)];
    playSfx("click");
    setMoment(false);
    setPulse(p => p + 1);
    setPage(page);
  }

  function ignite() {
    playSfx("success");
    setPulse(p => p + 1);
    document.body.classList.add("kairos-supernova");
    window.setTimeout(() => document.body.classList.remove("kairos-supernova"), 1300);
  }

  return <div ref={rootRef} className="masterpiece-layer" aria-hidden={moment ? undefined : "true"}>
    {!calm && !autoReduced && <>
      <div className="cursor-aura" aria-hidden="true" />
      <div className="cursor-crosshair" aria-hidden="true"><span/><span/></div>
    </>}
    <div className="masterpiece-scanline" aria-hidden="true" />
    <div className="masterpiece-pulse" key={pulse} aria-hidden="true" />
    {moment && <div className="temporal-whisper" role="dialog" aria-label="KAIROS moment">
      <div className="whisper-orbit" aria-hidden="true"><i/><i/><i/></div>
      <div className="whisper-kicker">A MOMENT FOUND YOU</div>
      <div className="whisper-title serif">The present is still unwritten.</div>
      <div className="whisper-copy">Wander somewhere unexpected, or return to whatever matters now.</div>
      <div className="whisper-actions">
        <button type="button" className="btn btn-primary" onClick={wander}>Take me somewhere ✦</button>
        <button type="button" className="btn" onClick={dismiss}>Stay here</button>
        <button type="button" className="btn whisper-ignite" onClick={ignite}>Ignite ◈</button>
      </div>
    </div>}
  </div>;
}

export { MasterpieceLayer };
