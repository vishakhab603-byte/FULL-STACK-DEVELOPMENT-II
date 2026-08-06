import { createSelector } from 'reselect';
import { postsAdapter } from './postsSlice';
import { countWords, countCharacters, readingTimeSeconds } from '../../utils/text';
import { isToday, isWithinDays } from '../../utils/date';


const adapterSelectors = postsAdapter.getSelectors((state) => state.posts);

export const selectAllPosts = adapterSelectors.selectAll;
export const selectPostById = adapterSelectors.selectById;
export const selectPostsTotal = adapterSelectors.selectTotal;

export const selectPostsStatus = (state) => state.posts.status;
export const selectPostsMutationStatus = (state) => state.posts.mutationStatus;
export const selectPostsError = (state) => state.posts.error;
export const selectPostsLastUpdated = (state) => state.posts.lastUpdated;

export const selectPublishedPosts = createSelector(selectAllPosts, (posts) =>
  posts.filter((p) => p.status === 'published')
);

export const selectDraftPosts = createSelector(selectAllPosts, (posts) =>
  posts.filter((p) => p.status === 'draft')
);

export const selectArchivedPosts = createSelector(selectAllPosts, (posts) =>
  posts.filter((p) => p.isArchived)
);

export const selectFavoritePosts = createSelector(selectAllPosts, (posts) =>
  posts.filter((p) => p.isFavorite)
);

export const selectPinnedPosts = createSelector(selectAllPosts, (posts) =>
  posts.filter((p) => p.isPinned)
);

export const selectScheduledPosts = createSelector(selectAllPosts, (posts) =>
  posts.filter((p) => p.status === 'scheduled')
);

export const selectTodaysPosts = createSelector(selectAllPosts, (posts) =>
  posts.filter((p) => isToday(p.createdAt))
);

export const selectRecentPosts = createSelector(selectAllPosts, (posts) =>
  posts.filter((p) => isWithinDays(p.createdAt, 7))
);

/** Platform distribution: { [platformId]: count } */
export const selectPlatformDistribution = createSelector(selectAllPosts, (posts) => {
  const dist = {};
  posts.forEach((p) => {
    dist[p.platformId] = (dist[p.platformId] || 0) + 1;
  });
  return dist;
});

/** Aggregate content stats — total chars, avg words, longest post, avg reading time */
export const selectContentStats = createSelector(selectAllPosts, (posts) => {
  if (posts.length === 0) {
    return { totalCharacters: 0, avgWordCount: 0, longestPost: null, avgReadingTimeSec: 0 };
  }
  let totalCharacters = 0;
  let totalWords = 0;
  let totalReadingTime = 0;
  let longestPost = posts[0];

  posts.forEach((p) => {
    const chars = countCharacters(p.content);
    const words = countWords(p.content);
    totalCharacters += chars;
    totalWords += words;
    totalReadingTime += readingTimeSeconds(p.content);
    if (countCharacters(p.content) > countCharacters(longestPost.content)) longestPost = p;
  });

  return {
    totalCharacters,
    avgWordCount: Math.round(totalWords / posts.length),
    longestPost,
    avgReadingTimeSec: Math.round(totalReadingTime / posts.length)
  };
});

/** Draft completion percentage: published / (published + draft) */
export const selectDraftCompletionPercentage = createSelector(
  selectPublishedPosts,
  selectDraftPosts,
  (published, drafts) => {
    const total = published.length + drafts.length;
    if (total === 0) return 0;
    return Math.round((published.length / total) * 100);
  }
);

/** Engagement score: weighted sum, normalized to a 0-100-ish scale for display */
export const selectEngagementScore = createSelector(selectPublishedPosts, (posts) => {
  if (posts.length === 0) return 0;
  const total = posts.reduce((sum, p) => {
    const e = p.engagement || { likes: 0, comments: 0, shares: 0 };
    return sum + e.likes * 1 + e.comments * 2 + e.shares * 3;
  }, 0);
  return Math.round(total / posts.length);
});

/** Growth metric: posts created in the last 7 days vs the 7 days before that */
export const selectGrowthMetrics = createSelector(selectAllPosts, (posts) => {
  const now = Date.now();
  const week = 7 * 86400000;
  const thisWeek = posts.filter((p) => now - new Date(p.createdAt).getTime() < week).length;
  const lastWeek = posts.filter((p) => {
    const age = now - new Date(p.createdAt).getTime();
    return age >= week && age < week * 2;
  }).length;
  const delta = lastWeek === 0 ? (thisWeek > 0 ? 100 : 0) : Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  return { thisWeek, lastWeek, deltaPercent: delta };
});

/** 14-day timeseries of post creation counts, oldest first — feeds the sparkline chart */
export const selectPostsTimeseries14d = createSelector(selectAllPosts, (posts) => {
  const days = [];
  for (let i = 13; i >= 0; i -= 1) {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    dayStart.setDate(dayStart.getDate() - i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const count = posts.filter((p) => {
      const t = new Date(p.createdAt).getTime();
      return t >= dayStart.getTime() && t < dayEnd.getTime();
    }).length;
    days.push(count);
  }
  return days;
});

/** Factory selector: filtered + searched posts (composed with filters/search slices) */
export const makeSelectVisiblePosts = () =>
  createSelector(
    selectAllPosts,
    (state) => state.filters,
    (state) => state.search.query,
    (posts, filters, query) => {
      let result = posts;

      if (filters.platform !== 'all') {
        result = result.filter((p) => p.platformId === filters.platform);
      }
      if (filters.status !== 'all') {
        result = result.filter((p) => p.status === filters.status);
      }
      if (filters.favoriteOnly) {
        result = result.filter((p) => p.isFavorite);
      }
      if (filters.archivedOnly) {
        result = result.filter((p) => p.isArchived);
      } else {
        result = result.filter((p) => !p.isArchived);
      }

      if (query.trim()) {
        const q = query.trim().toLowerCase();
        result = result.filter(
          (p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)
        );
      }

      // Pinned posts float to the top
      return [...result].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
    }
  );
