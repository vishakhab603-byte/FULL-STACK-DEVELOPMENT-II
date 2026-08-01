import { createSelector } from 'reselect';
import { platformsAdapter } from './platformsSlice';
import { selectAllPosts } from '../posts/postsSelectors';

const adapterSelectors = platformsAdapter.getSelectors((state) => state.platforms);

export const selectAllPlatforms = adapterSelectors.selectAll;
export const selectPlatformById = adapterSelectors.selectById;
export const selectPlatformsStatus = (state) => state.platforms.status;

/** Platform stats: post count + published count + engagement, per platform */
export const selectPlatformStats = createSelector(selectAllPlatforms, selectAllPosts, (platforms, posts) =>
  platforms.map((platform) => {
    const platformPosts = posts.filter((p) => p.platformId === platform.id);
    const published = platformPosts.filter((p) => p.status === 'published');
    const engagement = published.reduce(
      (sum, p) => sum + (p.engagement?.likes || 0) + (p.engagement?.comments || 0) + (p.engagement?.shares || 0),
      0
    );
    return {
      ...platform,
      postCount: platformPosts.length,
      publishedCount: published.length,
      engagement
    };
  })
);

/** The single best-performing platform by average engagement per published post */
export const selectTopPlatform = createSelector(selectPlatformStats, (stats) => {
  const withPosts = stats.filter((s) => s.publishedCount > 0);
  if (withPosts.length === 0) return null;
  return withPosts.reduce((best, current) => {
    const bestAvg = best.engagement / best.publishedCount;
    const currentAvg = current.engagement / current.publishedCount;
    return currentAvg > bestAvg ? current : best;
  });
});
