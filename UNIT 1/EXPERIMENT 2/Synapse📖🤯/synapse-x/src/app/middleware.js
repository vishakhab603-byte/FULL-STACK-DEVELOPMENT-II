import { recordAction } from '../services/perfTracker';

/* ==========================================================================
   CUSTOM MIDDLEWARE
   ========================================================================== */

/** Times every action and forwards the measurement to the perf tracker singleton. */
export const performanceMiddleware = () => (next) => (action) => {
  const start = performance.now();
  const result = next(action);
  const durationMs = Number((performance.now() - start).toFixed(3));
  recordAction(action.type, durationMs);
  return result;
};

/** Readable console grouping for every dispatched action — dev-time visibility. */
export const loggerMiddleware = () => (next) => (action) => {
  const start = performance.now();
  const result = next(action);
  if (import.meta.env.DEV) {
    const durationMs = (performance.now() - start).toFixed(2);
    // eslint-disable-next-line no-console
    console.groupCollapsed(`%c${action.type} %c+${durationMs}ms`, 'color:#8a6bff;font-weight:600', 'color:#888');
    console.log('payload:', action.payload);
    console.groupEnd();
  }
  return result;
};

/** Counts domain-relevant actions for lightweight in-session analytics. */
const analyticsCounts = {};
export const analyticsMiddleware = () => (next) => (action) => {
  if (action.type.startsWith('posts/') || action.type.startsWith('drafts/')) {
    analyticsCounts[action.type] = (analyticsCounts[action.type] || 0) + 1;
  }
  return next(action);
};
export function getAnalyticsCounts() {
  return { ...analyticsCounts };
}
