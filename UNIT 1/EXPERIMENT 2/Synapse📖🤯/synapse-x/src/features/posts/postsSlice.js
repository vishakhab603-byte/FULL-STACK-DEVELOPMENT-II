import { createSlice, createEntityAdapter, createAsyncThunk, nanoid } from '@reduxjs/toolkit';
import { mockApi } from '../../services/mockApi';

/* ==========================================================================
   POSTS SLICE — normalized entity state ({ ids: [], entities: {} })
   Async CRUD via createAsyncThunk, with optimistic update + rollback.
   ========================================================================== */

export const postsAdapter = createEntityAdapter({
  sortComparer: (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
});

const initialState = postsAdapter.getInitialState({
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  mutationStatus: 'idle', // status of the "current" write op, drives UI spinners
  lastUpdated: null,
  retryCount: 0
});

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async (_, { rejectWithValue }) => {
  try {
    return await mockApi.fetchPosts();
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const createPost = createAsyncThunk('posts/createPost', async (payload, { rejectWithValue }) => {
  try {
    return await mockApi.createPost(payload);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ id, changes }, { rejectWithValue, getState }) => {
    const previous = selectPostSnapshot(getState(), id);
    try {
      return await mockApi.updatePost(id, changes);
    } catch (err) {
      return rejectWithValue({ id, previous, message: err.message });
    }
  }
);

export const deletePost = createAsyncThunk('posts/deletePost', async (id, { rejectWithValue, getState }) => {
  const previous = selectPostSnapshot(getState(), id);
  try {
    await mockApi.deletePost(id);
    return id;
  } catch (err) {
    return rejectWithValue({ id, previous, message: err.message });
  }
});

export const publishPost = createAsyncThunk('posts/publishPost', async (id, { rejectWithValue }) => {
  try {
    return await mockApi.publishPost(id);
  } catch (err) {
    return rejectWithValue({ id, message: err.message });
  }
});

function selectPostSnapshot(state, id) {
  return state.posts.entities[id] ? { ...state.posts.entities[id] } : null;
}

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // Optimistic, purely local, synchronous mutations
    postToggleFavorite(state, action) {
      const post = state.entities[action.payload];
      if (post) post.isFavorite = !post.isFavorite;
    },
    postTogglePin(state, action) {
      const post = state.entities[action.payload];
      if (post) post.isPinned = !post.isPinned;
    },
    postToggleArchive(state, action) {
      const post = state.entities[action.payload];
      if (post) {
        post.isArchived = !post.isArchived;
        post.status = post.isArchived ? 'archived' : 'draft';
      }
    },
    postDuplicated: {
      reducer(state, action) {
        postsAdapter.addOne(state, action.payload);
      },
      prepare(sourcePost) {
        const now = new Date().toISOString();
        return {
          payload: {
            ...sourcePost,
            id: nanoid(),
            title: `${sourcePost.title} (copy)`,
            status: 'draft',
            isPinned: false,
            publishedAt: null,
            createdAt: now,
            updatedAt: now
          }
        };
      }
    },
    postsBulkDeleted(state, action) {
      postsAdapter.removeMany(state, action.payload);
    },
    postsBulkStatusChanged(state, action) {
      const { ids, status } = action.payload;
      ids.forEach((id) => {
        const post = state.entities[id];
        if (post) post.status = status;
      });
    },
    postsErrorCleared(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.lastUpdated = new Date().toISOString();
        postsAdapter.setAll(state, action.payload);
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      // create
      .addCase(createPost.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        postsAdapter.addOne(state, action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.error = action.payload || action.error.message;
      })
      // update (optimistic)
      .addCase(updatePost.pending, (state, action) => {
        state.mutationStatus = 'loading';
        const { id, changes } = action.meta.arg;
        postsAdapter.updateOne(state, { id, changes });
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        postsAdapter.upsertOne(state, action.payload);
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.error = action.payload?.message || action.error.message;
        // rollback
        if (action.payload?.previous) {
          postsAdapter.upsertOne(state, action.payload.previous);
        }
      })
      // delete (optimistic)
      .addCase(deletePost.pending, (state, action) => {
        state.mutationStatus = 'loading';
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        postsAdapter.removeOne(state, action.payload);
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.error = action.payload?.message || action.error.message;
        // rollback: restore the post if it was optimistically removed
        if (action.payload?.previous) {
          postsAdapter.upsertOne(state, action.payload.previous);
        }
      })
      // publish
      .addCase(publishPost.pending, (state, action) => {
        state.mutationStatus = 'loading';
        const post = state.entities[action.meta.arg];
        if (post) post.status = 'publishing';
      })
      .addCase(publishPost.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        postsAdapter.upsertOne(state, action.payload);
      })
      .addCase(publishPost.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.error = action.payload?.message || action.error.message;
        const post = state.entities[action.payload?.id];
        if (post) post.status = 'draft';
      });
  }
});

export const {
  postToggleFavorite,
  postTogglePin,
  postToggleArchive,
  postDuplicated,
  postsBulkDeleted,
  postsBulkStatusChanged,
  postsErrorCleared
} = postsSlice.actions;

export default postsSlice.reducer;
