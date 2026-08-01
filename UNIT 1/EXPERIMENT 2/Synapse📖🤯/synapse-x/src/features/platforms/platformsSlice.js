import { createSlice, createEntityAdapter, createAsyncThunk } from '@reduxjs/toolkit';
import { mockApi } from '../../services/mockApi';

export const platformsAdapter = createEntityAdapter();

const initialState = platformsAdapter.getInitialState({
  status: 'idle',
  error: null
});

export const fetchPlatforms = createAsyncThunk('platforms/fetchPlatforms', async (_, { rejectWithValue }) => {
  try {
    return await mockApi.fetchPlatforms();
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const platformsSlice = createSlice({
  name: 'platforms',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlatforms.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPlatforms.fulfilled, (state, action) => {
        state.status = 'succeeded';
        platformsAdapter.setAll(state, action.payload);
      })
      .addCase(fetchPlatforms.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  }
});

export default platformsSlice.reducer;
