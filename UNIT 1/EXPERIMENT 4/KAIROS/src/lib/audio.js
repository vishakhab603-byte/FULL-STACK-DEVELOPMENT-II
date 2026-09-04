function playSfx(type) {
    try {
        if (window.__kairosMuted)
            return;
        const ctx = window.__kairosAudioCtx || (window.__kairosAudioCtx = new (window.AudioContext || window.webkitAudioContext)());
        if (ctx.state === "suspended")
            ctx.resume();
        const now = ctx.currentTime;
        const patches = {
            click: [[520, 0.05, "sine"]],
            toggle: [[420, 0.05, "triangle"], [640, 0.06, "triangle"]],
            whoosh: [[180, 0.12, "sawtooth"]],
            success: [[523, 0.09, "sine"], [659, 0.09, "sine"], [784, 0.16, "sine"]],
            error: [[220, 0.18, "square"]],
            nav: [[300, 0.04, "sine"]],
            unlock: [[392, 0.08, "triangle"], [523, 0.08, "triangle"], [659, 0.08, "triangle"], [880, 0.22, "triangle"]],
        };
        const seq = patches[type] || patches.click;
        let t0 = now;
        seq.forEach(([freq, dur, wave]) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = wave;
            osc.frequency.setValueAtTime(freq, t0);
            gain.gain.setValueAtTime(0.0001, t0);
            gain.gain.exponentialRampToValueAtTime(0.09, t0 + 0.012);
            gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t0);
            osc.stop(t0 + dur + 0.02);
            t0 += dur * 0.55;
        });
    }
    catch (e) { }
}

export { playSfx };
