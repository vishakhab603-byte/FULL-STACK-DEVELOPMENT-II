import { useState, useEffect, useRef, useMemo } from "react";
import { playSfx } from "../../lib/audio";

function CommandPalette({ open, onClose, commands }) {
    const [query, setQuery] = useState("");
    const [activeIdx, setActiveIdx] = useState(0);
    const inputRef = useRef(null);
    useEffect(() => {
        if (open) {
            setQuery("");
            setActiveIdx(0);
            setTimeout(() => inputRef.current && inputRef.current.focus(), 30);
        }
    }, [open]);
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q)
            return commands;
        return commands.filter(c => c.label.toLowerCase().includes(q) || (c.hint || "").toLowerCase().includes(q));
    }, [query, commands]);
    function run(cmd) {
        if (!cmd)
            return;
        playSfx("click");
        cmd.action();
        onClose();
    }
    function onKeyDown(e) {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIdx(i => Math.min(filtered.length - 1, i + 1));
        }
        else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIdx(i => Math.max(0, i - 1));
        }
        else if (e.key === "Enter") {
            e.preventDefault();
            run(filtered[activeIdx]);
        }
        else if (e.key === "Escape") {
            onClose();
        }
    }
    if (!open)
        return null;
    return (<div className="palette-backdrop" onClick={onClose}>
      <div className="card palette-box" onClick={e => e.stopPropagation()}>
        <input ref={inputRef} className="palette-input" placeholder="Type a command or search pages…" value={query} onChange={e => { setQuery(e.target.value); setActiveIdx(0); }} onKeyDown={onKeyDown}/>
        <div className="palette-list">
          {filtered.length === 0 && <div className="palette-empty">No matching commands.</div>}
          {filtered.map((c, i) => (<div key={c.label} className={"palette-item" + (i === activeIdx ? " active" : "")} onMouseEnter={() => setActiveIdx(i)} onClick={() => run(c)}>
              <span>{c.label}</span>
              <span className="hint">{c.hint || ""}</span>
            </div>))}
        </div>
      </div>
    </div>);
}

export { CommandPalette };
