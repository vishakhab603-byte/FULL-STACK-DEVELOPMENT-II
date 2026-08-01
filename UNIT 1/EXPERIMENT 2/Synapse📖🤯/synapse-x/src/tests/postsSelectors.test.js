import { describe, it, expect } from 'vitest';
import postsReducer, { fetchPosts } from '../features/posts/postsSlice';
import {
  selectPublishedPosts,
  selectDraftCompletionPercentage,
  selectContentStats
} from '../features/posts/postsSelectors';

function buildState(posts) {
  const empty = postsReducer(undefined, { type: '@@INIT' });
  const posts$ = postsReducer(empty, fetchPosts.fulfilled(posts, 'reqId', undefined));
  return { posts: posts$ };
}

const base = {
  platformId: 'twitter',
  isFavorite: false,
  isPinned: false,
  isArchived: false,
  scheduledFor: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  publishedAt: null,
  engagement: { likes: 10, comments: 2, shares: 1 }
};

describe('posts selectors', () => {
  it('filters published posts only', () => {
    const state = buildState([
      { ...base, id: 'p1', title: 'A', content: 'hello', status: 'published' },
      { ...base, id: 'p2', title: 'B', content: 'world', status: 'draft' }
    ]);
    const published = selectPublishedPosts(state);
    expect(published).toHaveLength(1);
    expect(published[0].id).toBe('p1');
  });

  it('computes draft completion percentage', () => {
    const state = buildState([
      { ...base, id: 'p1', title: 'A', content: 'x', status: 'published' },
      { ...base, id: 'p2', title: 'B', content: 'y', status: 'draft' },
      { ...base, id: 'p3', title: 'C', content: 'z', status: 'draft' }
    ]);
    // 1 published / (1 published + 2 draft) = 33%
    expect(selectDraftCompletionPercentage(state)).toBe(33);
  });

  it('memoizes content stats and only recomputes when posts change', () => {
    const state = buildState([{ ...base, id: 'p1', title: 'A', content: 'one two three', status: 'draft' }]);

    const before = selectContentStats.recomputations();
    selectContentStats(state);
    selectContentStats(state); // same reference, should hit cache
    const afterSameState = selectContentStats.recomputations();
    expect(afterSameState).toBe(before + 1); // only the first call recomputed

    const changedState = buildState([{ ...base, id: 'p1', title: 'A', content: 'a longer sentence now', status: 'draft' }]);
    selectContentStats(changedState);
    const afterChange = selectContentStats.recomputations();
    expect(afterChange).toBe(afterSameState + 1);
  });
});
