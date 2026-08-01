import { PageHeader } from './Dashboard';
import { useAppSelector } from '../app/hooks';
import { selectPlatformStats } from '../features/platforms/platformsSelectors';
import {
  selectContentStats,
  selectEngagementScore,
  selectDraftCompletionPercentage,
  selectPostsTimeseries14d
} from '../features/posts/postsSelectors';
import BarChart from '../components/charts/BarChart';
import DonutChart from '../components/charts/DonutChart';
import Sparkline from '../components/charts/Sparkline';
import StatCard from '../components/common/StatCard';

export default function Analytics() {
  const platformStats = useAppSelector(selectPlatformStats);
  const contentStats = useAppSelector(selectContentStats);
  const engagementScore = useAppSelector(selectEngagementScore);
  const completion = useAppSelector(selectDraftCompletionPercentage);
  const timeseries = useAppSelector(selectPostsTimeseries14d);

  const donutData = platformStats.map((p) => ({ label: p.name, value: p.postCount, color: p.color }));
  const barData = platformStats.map((p) => ({ label: p.name, value: p.engagement, color: p.color }));

  return (
    <div className="page">
      <PageHeader eyebrow="Analytics" title="Performance & reach" subtitle="Every figure here is computed live from memoized selectors." />

      <section className="stat-grid stat-grid--tight">
        <StatCard label="Engagement score" value={engagementScore} hint="weighted avg per published post" />
        <StatCard label="Total characters written" value={contentStats.totalCharacters} />
        <StatCard label="Avg words / post" value={contentStats.avgWordCount} />
        <StatCard label="Draft completion" value={completion} suffix="%" />
      </section>

      <div className="analytics-grid">
        <section className="panel">
          <h3>Posts per day (14d)</h3>
          <Sparkline points={timeseries} width={480} height={100} />
        </section>

        <section className="panel">
          <h3>Platform distribution</h3>
          <DonutChart data={donutData.length ? donutData : [{ label: 'No data', value: 1, color: 'var(--border)' }]} />
        </section>

        <section className="panel panel--wide">
          <h3>Engagement by platform</h3>
          <BarChart data={barData} />
        </section>

        <section className="panel">
          <h3>Longest post</h3>
          {contentStats.longestPost ? (
            <div className="longest-post-card">
              <strong>{contentStats.longestPost.title}</strong>
              <p>{contentStats.longestPost.content}</p>
            </div>
          ) : (
            <p className="panel-empty-hint">No posts yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
