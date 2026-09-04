import { useState, useEffect } from "react";
import { OPENING_LETTERS } from "../data/openingLetters";

function OpeningSequence({ onDone }) {
    const [stage, setStage] = useState(0);
    useEffect(() => {
        const timers = [
            setTimeout(() => setStage(1), 1100),
            setTimeout(() => setStage(2), 2000),
            setTimeout(() => setStage(3), 2500),
            setTimeout(() => setStage(4), 3900),
            setTimeout(() => onDone(), 4500),
        ];
        return () => timers.forEach(clearTimeout);
    }, []);
    return (<div className={"opening-sequence" + (stage >= 4 ? " opening-exit" : "")} onClick={onDone}>
      <div className={"opening-dot" + (stage >= 1 ? " opening-dot-hide" : "")}/>
      <div className={"opening-ring" + (stage >= 1 ? " opening-ring-go" : "")}/>
      <div className={"opening-now" + (stage === 1 ? " opening-now-show" : "")}>NOW</div>
      <div className={"opening-wordmark" + (stage >= 3 ? " opening-wordmark-show" : "")}>
        {OPENING_LETTERS.map((l, i) => (<span key={i} className={"opening-letter" + (l === "O" ? " opening-letter-o" : "")} style={{ animationDelay: (i * 0.11) + "s" }}>{l}</span>))}
      </div>
      <div className="opening-skip">click anywhere to skip</div>
    </div>);
}

export { OpeningSequence };
