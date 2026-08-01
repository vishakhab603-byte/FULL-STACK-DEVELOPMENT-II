import { useEffect, useState } from 'react';
import { PageHeader } from './Dashboard';
import { getSnapshot, subscribePerf } from '../services/perfTracker';
import { useFps } from '../hooks/useFps';
import { useRenderCount } from '../hooks/useRenderCount';
import { store } from '../app/store';
import {
  selectPublishedPosts,
  selectContentStats,
  selectDraftCompletionPercentage
} from '../features/posts/postsSelectors';
import { selectDashboardSummary } from '../selectors/statsSelectors';
import StatCard from '../components/common/StatCard';
import PostCard from '../components/posts/PostCard';
import { useAppSelector } from '../app/hooks';
import { selectAllPosts } from '../features/posts/postsSelectors';

const TRACKED_SELECTORS = [
  { name: 'selectPublishedPosts', selector: selectPublishedPosts },
  { name: 'selectContentStats', selector: selectContentStats },
  { name: 'selectDraftCompletionPercentage', selector: selectDraftCompletionPercentage },
  { name: 'selectDashboardSummary', selector: selectDashboardSummary }
];

export default function PerformanceLab() {
  const pageRenders = useRenderCount();
  const fps = useFps();
  const [perf, setPerf] = useState(getSnapshot());
  const [stateSize, setStateSize] = useState(0);
  const [recomputations, setRecomputations] = useState({});
  const posts = useAppSelector(selectAllPosts);

  useEffect(() => {
    const unsubscribe = subscribePerf(() => setPerf(getSnapshot()));
    const interval = setInterval(() => {
      setStateSize(JSON.stringify(store.getState()).length);
      const counts = {};
      TRACKED_SELECTORS.forEach(({ name, selector }) => {
        counts[name] = selector.recomputations ? selector.recomputations() : 0;
      });
      setRecomputations(counts);
    }, 500);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Performance Lab"
        title="Live render & selector metrics"
        subtitle="Real measurements — no mocked numbers. Interact with the app and watch these update."
      />

      <section className="stat-grid">
        <StatCard label="This page rendered" value={pageRenders} suffix="×" />
        <StatCard label="FPS" value={fps} tone={fps < 45 ? 'warning' : 'success'} />
        <StatCard label="Actions dispatched" value={perf.actionCount} />
        <StatCard label="Store updates" value={perf.storeUpdateCount} />
        <StatCard label="Avg action time" value={perf.avgDurationMs} suffix="ms" />
        <StatCard label="Actions / sec" value={perf.actionsPerSecond} />
        <StatCard label="State size" value={Math.round(stateSize / 1024)} suffix=" KB" />
      </section>

      <div className="dashboard-grid">
        <section className="panel">
          <h3>Selector cache recomputations</h3>
          <p className="panel-subtitle">
            Reselect only recomputes when its inputs change — a low, stable number here means memoization is working.
          </p>
          <table className="perf-table">
            <thead>
              <tr><th>Selector</th><th>Recomputations</th></tr>
            </thead>
            <tbody>
              {TRACKED_SELECTORS.map(({ name }) => (
                <tr key={name}>
                  <td className="mono">{name}</td>
                  <td className="mono">{recomputations[name] ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="panel">
          <h3>Recent action timeline</h3>
          <ul className="perf-action-log">
            {perf.history.slice(0, 10).map((h, i) => (
              <li key={`${h.timestamp}-${i}`}>
                <span className="mono">{h.type}</span>
                <span className="mono perf-action-duration">{h.durationMs}ms</span>
              </li>
            ))}
            {perf.history.length === 0 && <li className="panel-empty-hint">Dispatch some actions to see them here.</li>}
          </ul>
        </section>

        <section className="panel panel--wide">
          <h3>React.memo demo — render badges</h3>
          <p className="panel-subtitle">
            Each card below is wrapped in <code>React.memo</code>. Its badge shows how many times *that specific card*
            has re-rendered — toggling one post's favorite/pin should not bump the others.
          </p>
          <div className="post-grid post-grid--compact">
            {posts.slice(0, 6).map((p) => (
              <PostCard key={p.id} post={p} showRenderBadge />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
