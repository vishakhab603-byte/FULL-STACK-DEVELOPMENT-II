import { createSlice, createEntityAdapter, nanoid } from '@reduxjs/toolkit';


export const notificationsAdapter = createEntityAdapter({
  sortComparer: (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
});

const initialState = notificationsAdapter.getInitialState({
  unreadCount: 0
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    notificationAdded: {
      reducer(state, action) {
        notificationsAdapter.addOne(state, action.payload);
        state.unreadCount += 1;
      },
      prepare({ type = 'info', title, message }) {
        return {
          payload: {
            id: nanoid(),
            type,
            title,
            message,
            read: false,
            createdAt: new Date().toISOString()
          }
        };
      }
    },
    notificationRead(state, action) {
      const n = state.entities[action.payload];
      if (n && !n.read) {
        n.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    notificationsAllRead(state) {
      Object.values(state.entities).forEach((n) => {
        n.read = true;
      });
      state.unreadCount = 0;
    },
    notificationDismissed(state, action) {
      const n = state.entities[action.payload];
      if (n && !n.read) state.unreadCount = Math.max(0, state.unreadCount - 1);
      notificationsAdapter.removeOne(state, action.payload);
    },
    notificationsCleared(state) {
      notificationsAdapter.removeAll(state);
      state.unreadCount = 0;
    }
  }
});

export const {
  notificationAdded,
  notificationRead,
  notificationsAllRead,
  notificationDismissed,
  notificationsCleared
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
