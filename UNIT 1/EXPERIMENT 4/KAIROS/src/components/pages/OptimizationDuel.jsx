import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { useTicker } from "../../hooks/useTicker";

const BaselineCard = function BaselineCard({ item, onSelect, statsRef }) {
    const renders = useRef(0);
    renders.current += 1;
    statsRef.current.baselineTotal += 1;
    const [flash, setFlash] = useState(false);
    const firstRun = useRef(true);
    useEffect(() => {
        if (firstRun.current) {
            firstRun.current = false;
            return;
        }
        setFlash(true);
        const t = setTimeout(() => setFlash(false), 480);
        return () => clearTimeout(t);
    });
    return (<div className={"duel-card" + (flash ? " flash-render" : "")} onClick={() => onSelect(item.id)}>
      <span>{item.title}</span>
      <span className="rc">renders: {renders.current}</span>
    </div>);
};

const OptimizedCardInner = function OptimizedCard({ item, onSelect, statsRef }) {
    const renders = useRef(0);
    renders.current += 1;
    statsRef.current.optimizedTotal += 1;
    const [flash, setFlash] = useState(false);
    const firstRun = useRef(true);
    useEffect(() => {
        if (firstRun.current) {
            firstRun.current = false;
            return;
        }
        setFlash(true);
        const t = setTimeout(() => setFlash(false), 480);
        return () => clearTimeout(t);
    });
    return (<div className={"duel-card" + (flash ? " flash-render" : "")} onClick={() => onSelect(item.id)}>
      <span>{item.title}</span>
      <span className="rc">renders: {renders.current}</span>
    </div>);
};

const OptimizedCardMemo = memo(OptimizedCardInner);

const SEED_ITEMS = Array.from({ length: 14 }, (_, i) => ({ id: i + 1, title: `Content card #${i + 1}` }));

function OptimizationDuel() {
    const [unrelated, setUnrelated] = useState(0);
    const [shuffleKey, setShuffleKey] = useState(0);
    const [useCallbackOpt, setUseCallbackOpt] = useState(true);
    const [useMemoFlag, setUseMemoFlag] = useState(true);
    const [resetKey, setResetKey] = useState(0);
    const statsRef = useRef({ baselineTotal: 0, optimizedTotal: 0 });
    const refreshStats = useTicker();
    const baseItems = SEED_ITEMS;
    const memoizedItems = useMemo(() => baseItems.map(it => ({ ...it })), [baseItems]);
    const freshItems = baseItems.map(it => ({ ...it }));
    const memoItems = useMemoFlag ? memoizedItems : freshItems;
    const handleSelectStable = useCallback((id) => { }, []);
    const handleSelectUnstable = (id) => { };
    const handleSelect = useCallbackOpt ? handleSelectStable : handleSelectUnstable;
    function resetCounts() {
        statsRef.current = { baselineTotal: 0, optimizedTotal: 0 };
        setResetKey(k => k + 1);
        refreshStats();
    }
    return (<div className="page-scan">
      <div className="topbar">
        <div>
          <div className="serif" style={{ fontSize: 24 }}>Optimization Duel</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Same 14 cards, same actions, two implementations. The render counts below are counted live, inside each card, on every actual render.</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={() => { setUnrelated(u => u + 1); refreshStats(); }}>Increment unrelated counter ({unrelated})</button>
          <button className="btn" onClick={() => { setShuffleKey(k => k + 1); refreshStats(); }}>Shuffle order</button>
          <button className="btn" onClick={resetCounts}>Reset render counts</button>
        </div>
      </div>

      <div className="card" style={{ padding: "14px 20px", marginBottom: 18, display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div style={{ minWidth: 220, flex: 1 }}>
          <div className="toggle-row">
            <span>Use memo on cards</span>
            <label className="switch"><input type="checkbox" checked={useMemoFlag} onChange={e => setUseMemoFlag(e.target.checked)}/><span className="slider"/></label>
          </div>
          <div className="toggle-row">
            <span>Use useCallback for handlers</span>
            <label className="switch"><input type="checkbox" checked={useCallbackOpt} onChange={e => setUseCallbackOpt(e.target.checked)}/><span className="slider"/></label>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", maxWidth: 420, flex: 1 }}>
          Turn every switch off and the optimized panel behaves exactly like the baseline panel — same render count. Turn them back on and it stops re-rendering cards for state changes that don't affect the cards. Unstable references (new objects, new arrays, new functions on every render) defeat memoization even when it's present.
        </div>
      </div>

      <div className="duel-grid">
        <div className="card duel-panel base-panel">
          <h3><span className="dot" style={{ background: "var(--danger)", color: "var(--danger)" }}/>Baseline · unoptimized</h3>
          <div className="duel-sub">No memo, inline handler, new array every render. Any state change up here re-renders every card below.</div>
          <div className="duel-cardlist" key={"base" + shuffleKey + resetKey}>
            {baseItems
            .slice()
            .sort(shuffleKey % 2 ? (a, b) => b.id - a.id : (a, b) => a.id - b.id)
            .map(item => (<BaselineCard key={item.id} item={item} onSelect={() => { }} statsRef={statsRef}/>))}
          </div>
        </div>

        <div className="card duel-panel opt-panel">
          <h3><span className="dot" style={{ background: "var(--accent2)", color: "var(--accent2)" }}/>Optimized</h3>
          <div className="duel-sub">Toggles above control whether memo / stable handlers / stable data are actually applied.</div>
          <div className="duel-cardlist" key={"opt" + shuffleKey + resetKey}>
            {memoItems
            .slice()
            .sort(shuffleKey % 2 ? (a, b) => b.id - a.id : (a, b) => a.id - b.id)
            .map(item => {
            const Card = useMemoFlag ? OptimizedCardMemo : OptimizedCardInner;
            return <Card key={item.id} item={item} onSelect={handleSelect} statsRef={statsRef}/>;
        })}
          </div>
        </div>
      </div>

      <RenderTotals statsRef={statsRef}/>
    </div>);
}

function RenderTotals({ statsRef }) {
    const [, forceTick] = useState(0);
    return (<div className="card" style={{ padding: 20, marginTop: 18, display: "flex", gap: 36, alignItems: "center", flexWrap: "wrap" }}>
      <div>
        <div className="stat-label">Baseline · total card renders (cumulative)</div>
        <div className="stat-big" style={{ color: "var(--danger)" }}>{statsRef.current.baselineTotal}</div>
      </div>
      <div>
        <div className="stat-label">Optimized · total card renders (cumulative)</div>
        <div className="stat-big" style={{ color: "var(--accent2)" }}>{statsRef.current.optimizedTotal}</div>
      </div>
      <button className="btn" onClick={() => forceTick(t => t + 1)}>Refresh totals</button>
      <div style={{ fontSize: 12, color: "var(--muted)", maxWidth: 360 }}>
        These counters increment inside each card's own render body — they are not simulated. Try it with all optimizations on, then again with them off, and refresh.
      </div>
    </div>);
}

export { BaselineCard, OptimizedCardInner, OptimizedCardMemo, SEED_ITEMS, OptimizationDuel, RenderTotals };
