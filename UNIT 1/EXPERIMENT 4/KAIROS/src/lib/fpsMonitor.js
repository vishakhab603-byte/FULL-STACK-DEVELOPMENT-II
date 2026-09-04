function startFpsMonitor(onDegraded, onRecovered) {
    let frames = 0;
    let windowStart = performance.now();
    let degraded = false;
    let lowStreak = 0;
    let rafId = null;
    function tick(now) {
        frames += 1;
        if (now - windowStart >= 1000) {
            const fps = (frames * 1000) / (now - windowStart);
            frames = 0;
            windowStart = now;
            if (fps < 30) {
                lowStreak += 1;
                if (lowStreak >= 2 && !degraded) {
                    degraded = true;
                    onDegraded(Math.round(fps));
                }
            }
            else {
                lowStreak = 0;
                if (fps > 50 && degraded) {
                    degraded = false;
                    onRecovered(Math.round(fps));
                }
            }
        }
        rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    return () => { if (rafId)
        cancelAnimationFrame(rafId); };
}

export { startFpsMonitor };
