import { createSlice } from "@reduxjs/toolkit";

export const PLATFORMS = [
  { key: "instagram", label: "Instagram", limit: 2200 },
  { key: "linkedin", label: "LinkedIn", limit: 3000 },
  { key: "x", label: "X", limit: 280 },
];

const seedPosts = [
  { id: "p1", title: "Q3 platform roadmap", body: "A look at what's shipping next quarter and why it matters for every role on the team.", platform: "linkedin", status: "published", authorKey: "commander", authorName: "Marcus Cole", comments: 12 },
  { id: "p2", title: "Behind the design of PRISM", body: "How one authenticated identity refracts into eight distinct experiences.", platform: "instagram", status: "pending", authorKey: "creator", authorName: "Nadia Reyes", comments: 3 },
  { id: "p3", title: "Draft: security best practices", body: "Five habits that keep enterprise identities safe. (still rough — needs a pass)", platform: "x", status: "draft", authorKey: "creator", authorName: "Nadia Reyes", comments: 0 },
];

const postsSlice = createSlice({
  name: "posts",
  initialState: seedPosts,
  reducers: {
    createPost: {
      reducer(state, action) {
        state.unshift(action.payload);
      },
      prepare({ title, body, platform, authorKey, authorName }) {
        return {
          payload: {
            id: "p" + Date.now(),
            title, body, platform, authorKey, authorName,
            status: "draft",
            comments: 0,
          },
        };
      },
    },
    submitForApproval(state, action) {
      const post = state.find((p) => p.id === action.payload);
      if (post) post.status = "pending";
    },
    approvePost(state, action) {
      const post = state.find((p) => p.id === action.payload);
      if (post) post.status = "published";
    },
    rejectPost(state, action) {
      const post = state.find((p) => p.id === action.payload);
      if (post) post.status = "draft";
    },
    publishDirect(state, action) {
      const post = state.find((p) => p.id === action.payload);
      if (post) post.status = "published";
    },
    deletePost(state, action) {
      return state.filter((p) => p.id !== action.payload);
    },
    moderatePost(state, action) {
      const post = state.find((p) => p.id === action.payload);
      if (post) post.comments = 0;
    },
  },
});

export const {
  createPost, submitForApproval, approvePost, rejectPost,
  publishDirect, deletePost, moderatePost,
} = postsSlice.actions;
export default postsSlice.reducer;

export const selectPosts = (state) => state.posts;
export const selectPostById = (state, id) => state.posts.find((p) => p.id === id);
