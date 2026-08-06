

const MAX_HISTORY = 50;

const state = {
  actionCount: 0,
  storeUpdateCount: 0,
  history: [], // [{ type, durationMs, timestamp }]
  startedAt: Date.now()
};

const listeners = new Set();

export function recordAction(type, durationMs) {
  state.actionCount += 1;
  state.storeUpdateCount += 1;
  state.history.unshift({ type, durationMs, timestamp: Date.now() });
  if (state.history.length > MAX_HISTORY) state.history.length = MAX_HISTORY;
  listeners.forEach((fn) => fn());
}

export function getSnapshot() {
  const recent = state.history.slice(0, 20);
  const avgDurationMs = recent.length
    ? recent.reduce((sum, h) => sum + h.durationMs, 0) / recent.length
    : 0;
  const elapsedSec = Math.max(1, (Date.now() - state.startedAt) / 1000);

  return {
    actionCount: state.actionCount,
    storeUpdateCount: state.storeUpdateCount,
    history: state.history,
    avgDurationMs: Number(avgDurationMs.toFixed(3)),
    lastAction: state.history[0] || null,
    actionsPerSecond: Number((state.actionCount / elapsedSec).toFixed(2))
  };
}

export function subscribePerf(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
