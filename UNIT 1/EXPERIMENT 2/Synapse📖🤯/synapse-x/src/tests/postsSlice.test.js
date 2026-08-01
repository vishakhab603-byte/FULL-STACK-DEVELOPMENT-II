import { describe, it, expect } from 'vitest';
import postsReducer, {
  postToggleFavorite,
  postTogglePin,
  postDuplicated,
  postsBulkDeleted,
  fetchPosts,
  createPost
} from '../features/posts/postsSlice';

function makePost(overrides = {}) {
  return {
    id: 'post_1',
    title: 'Hello world',
    content: 'Just testing',
    platformId: 'twitter',
    status: 'draft',
    isFavorite: false,
    isPinned: false,
    isArchived: false,
    scheduledFor: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: null,
    engagement: { likes: 0, comments: 0, shares: 0 },
    ...overrides
  };
}

function stateWithOnePost() {
  const empty = postsReducer(undefined, { type: '@@INIT' });
  return postsReducer(empty, fetchPosts.fulfilled([makePost()], 'requestId', undefined));
}

describe('postsSlice reducers', () => {
  it('returns the initial normalized shape', () => {
    const state = postsReducer(undefined, { type: '@@INIT' });
    expect(state.ids).toEqual([]);
    expect(state.entities).toEqual({});
    expect(state.status).toBe('idle');
  });

  it('sets all posts on fetchPosts.fulfilled', () => {
    const state = stateWithOnePost();
    expect(state.ids).toHaveLength(1);
    expect(state.entities.post_1.title).toBe('Hello world');
    expect(state.status).toBe('succeeded');
  });

  it('toggles favorite without touching other fields', () => {
    const state = stateWithOnePost();
    const next = postsReducer(state, postToggleFavorite('post_1'));
    expect(next.entities.post_1.isFavorite).toBe(true);
    expect(next.entities.post_1.title).toBe('Hello world');
  });

  it('toggles pin independently of favorite', () => {
    const state = stateWithOnePost();
    const next = postsReducer(state, postTogglePin('post_1'));
    expect(next.entities.post_1.isPinned).toBe(true);
    expect(next.entities.post_1.isFavorite).toBe(false);
  });

  it('duplicates a post as a fresh draft with a new id', () => {
    const state = stateWithOnePost();
    const source = state.entities.post_1;
    const action = postDuplicated(source);
    const next = postsReducer(state, action);
    expect(next.ids).toHaveLength(2);
    const copy = Object.values(next.entities).find((p) => p.id !== 'post_1');
    expect(copy.title).toContain('(copy)');
    expect(copy.status).toBe('draft');
    expect(copy.id).not.toBe('post_1');
  });

  it('bulk deletes posts by id', () => {
    const state = stateWithOnePost();
    const next = postsReducer(state, postsBulkDeleted(['post_1']));
    expect(next.ids).toHaveLength(0);
  });

  it('adds a post optimistically on createPost.fulfilled', () => {
    const empty = postsReducer(undefined, { type: '@@INIT' });
    const created = makePost({ id: 'post_2', title: 'New one' });
    const next = postsReducer(empty, createPost.fulfilled(created, 'requestId', { title: 'New one' }));
    expect(next.entities.post_2.title).toBe('New one');
    expect(next.mutationStatus).toBe('succeeded');
  });
});
