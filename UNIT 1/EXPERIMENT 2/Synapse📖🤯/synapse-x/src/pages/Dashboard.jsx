import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchPosts } from '../features/posts/postsSlice';
import { fetchPlatforms } from '../features/platforms/platformsSlice';
import { selectDashboardSummary } from '../selectors/statsSelectors';
import { selectInsights } from '../selectors/insightsSelectors';
import { selectPinnedPosts, selectPostsStatus } from '../features/posts/postsSelectors';
import StatCard from '../components/common/StatCard';
import PostCard from '../components/posts/PostCard';
import ActivityTimeline from '../components/activity/ActivityTimeline';
import { SkeletonGrid } from '../components/common/SkeletonLoader';

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectPostsStatus);
  const summary = useAppSelector(selectDashboardSummary);
  const insights = useAppSelector(selectInsights);
  const pinned = useAppSelector(selectPinnedPosts);

  useEffect(() => {
    dispatch(fetchPosts());
    dispatch(fetchPlatforms());
  }, [dispatch]);

  return (
    <div className="page">
      <PageHeader
        eyebrow="One brain. Infinite state."
        title="Dashboard"
        subtitle="A live snapshot of everything happening across your channels."
      />

      {status === 'loading' ? (
        <SkeletonGrid count={9} />
      ) : (
        <>
          <section className="stat-grid">
            <StatCard label="Total posts" value={summary.total} />
            <StatCard label="Published" value={summary.published} tone="success" />
            <StatCard label="Drafts" value={summary.drafts} tone="warning" />
            <StatCard label="Scheduled" value={summary.scheduled} />
            <StatCard label="Favorites" value={summary.favorites} />
            <StatCard label="Archived" value={summary.archived} />
            <StatCard label="Platforms" value={summary.platforms} />
            <StatCard
              label="Growth (7d)"
              value={summary.growth.deltaPercent}
              suffix="%"
              tone={summary.growth.deltaPercent >= 0 ? 'success' : 'danger'}
              hint={`${summary.growth.thisWeek} posts this week`}
            />
            <StatCard label="Completion" value={summary.completionPercent} suffix="%" hint="published vs drafted" />
          </section>

          <div className="dashboard-grid">
            <section className="panel">
              <h3>Pinned posts</h3>
              {pinned.length === 0 ? (
                <p className="panel-empty-hint">Pin a post to keep it visible here.</p>
              ) : (
                <div className="post-grid post-grid--compact">
                  {pinned.map((p) => (
                    <PostCard key={p.id} post={p} />
                  ))}
                </div>
              )}
            </section>

            <section className="panel">
              <h3>AI-style insights</h3>
              <p className="panel-subtitle">Derived entirely from memoized selectors — no external calls.</p>
              <ul className="insight-list">
                {insights.map((insight) => (
                  <motion.li
                    key={insight.id}
                    className={`insight-item insight-item--${insight.tone}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {insight.text}
                  </motion.li>
                ))}
              </ul>
            </section>

            <section className="panel panel--tall">
              <h3>Recent activity</h3>
              <ActivityTimeline limit={8} />
            </section>
          </div>
        </>
      )}
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <span className="page-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </header>
  );
}
