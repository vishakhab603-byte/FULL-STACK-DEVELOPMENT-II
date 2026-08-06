import { createSelector } from 'reselect';
import {
  selectAllPosts,
  selectPublishedPosts,
  selectDraftPosts,
  selectArchivedPosts,
  selectFavoritePosts,
  selectScheduledPosts,
  selectDraftCompletionPercentage,
  selectGrowthMetrics
} from '../features/posts/postsSelectors';
import { selectAllPlatforms } from '../features/platforms/platformsSelectors';

export const selectDashboardSummary = createSelector(
  selectAllPosts,
  selectPublishedPosts,
  selectDraftPosts,
  selectArchivedPosts,
  selectFavoritePosts,
  selectScheduledPosts,
  selectAllPlatforms,
  selectDraftCompletionPercentage,
  selectGrowthMetrics,
  (all, published, drafts, archived, favorites, scheduled, platforms, completion, growth) => ({
    total: all.length,
    published: published.length,
    drafts: drafts.length,
    archived: archived.length,
    favorites: favorites.length,
    scheduled: scheduled.length,
    platforms: platforms.length,
    completionPercent: completion,
    growth
  })
);
