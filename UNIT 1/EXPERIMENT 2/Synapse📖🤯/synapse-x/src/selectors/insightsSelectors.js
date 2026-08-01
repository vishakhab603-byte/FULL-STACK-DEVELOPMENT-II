import { createSelector } from 'reselect';
import { selectTopPlatform } from '../features/platforms/platformsSelectors';
import { selectDraftCompletionPercentage, selectGrowthMetrics, selectContentStats } from '../features/posts/postsSelectors';

/* ==========================================================================
   INSIGHTS — plain-language observations synthesized entirely from
   memoized selector output. No AI API calls; this is derived state.
   ========================================================================== */

export const selectInsights = createSelector(
  selectTopPlatform,
  selectDraftCompletionPercentage,
  selectGrowthMetrics,
  selectContentStats,
  (topPlatform, completion, growth, content) => {
    const insights = [];

    if (topPlatform) {
      insights.push({
        id: 'top-platform',
        tone: 'positive',
        text: `${topPlatform.name} posts perform best, averaging ${Math.round(
          topPlatform.engagement / Math.max(1, topPlatform.publishedCount)
        )} engagement points per post.`
      });
    }

    insights.push({
      id: 'completion',
      tone: completion >= 60 ? 'positive' : 'neutral',
      text: `Draft completion rate is ${completion}% — ${completion >= 60 ? 'ahead of' : 'below'} a healthy publishing pace.`
    });

    insights.push({
      id: 'growth',
      tone: growth.deltaPercent >= 0 ? 'positive' : 'negative',
      text:
        growth.deltaPercent >= 0
          ? `Publishing consistency increased ${growth.deltaPercent}% versus last week.`
          : `Publishing slowed ${Math.abs(growth.deltaPercent)}% versus last week.`
    });

    insights.push({
      id: 'reading-time',
      tone: 'neutral',
      text: `Average reading time across all posts is ${Math.round(content.avgReadingTimeSec)}s, based on a ${content.avgWordCount}-word average.`
    });

    return insights;
  }
);
