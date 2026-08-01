import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import postsReducer, { createPost, deletePost } from '../features/posts/postsSlice';

vi.mock('../services/mockApi', () => ({
  mockApi: {
    createPost: vi.fn(async (payload) => ({
      id: 'post_mocked',
      title: payload.title,
      content: payload.content,
      platformId: payload.platformId,
      status: 'draft',
      isFavorite: false,
      isPinned: false,
      isArchived: false,
      scheduledFor: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      publishedAt: null,
      engagement: { likes: 0, comments: 0, shares: 0 }
    })),
    deletePost: vi.fn(async () => {
      throw new Error('Simulated network failure');
    })
  }
}));

function buildStore() {
  return configureStore({ reducer: { posts: postsReducer } });
}

describe('posts async thunks', () => {
  beforeEach(() => vi.clearAllMocks());

  it('createPost adds the returned post to state', async () => {
    const store = buildStore();
    await store.dispatch(createPost({ title: 'Async test', content: 'body', platformId: 'twitter' }));
    const state = store.getState().posts;
    expect(state.entities.post_mocked).toBeDefined();
    expect(state.entities.post_mocked.title).toBe('Async test');
    expect(state.mutationStatus).toBe('succeeded');
  });

  it('deletePost rolls back an optimistic removal on failure', async () => {
    const store = buildStore();
    // seed a post directly via createPost first
    await store.dispatch(createPost({ title: 'To delete', content: 'body', platformId: 'twitter' }));
    const before = store.getState().posts.ids.length;

    await store.dispatch(deletePost('post_mocked'));

    const state = store.getState().posts;
    expect(state.mutationStatus).toBe('failed');
    // rollback should restore the post since the mock API rejected
    expect(state.ids.length).toBe(before);
    expect(state.entities.post_mocked).toBeDefined();
  });
});
