# SYNAPSE X

**One Brain. Infinite State.**

A social media command center built to be the definitive showcase of **Redux Toolkit** (Experiment 1.2.1) and **memoized selectors / render performance** (Experiment 1.2.2). Everything derived is computed with `reselect` — nothing duplicated, nothing stale.

---

## Getting started

```bash
npm install
npm run dev      # starts Vite on http://localhost:5173
npm run build    # production build
npm run test     # runs the vitest suite (reducers, selectors, thunks, a component)
```

No backend is required — `src/services/mockApi.js` simulates a real API with latency (280–900ms) and an 8% random failure rate so you can see loading states, error handling, and optimistic-update rollbacks in action.

---

## The brain metaphor

| Concept | Redux equivalent |
|---|---|
| Brain | The Redux store |
| Decision centers | Reducers / slices |
| Neural impulses | Actions |
| Memory recall | Selectors |
| Long-term memory | Memoized (reselect) selectors |
| Organs | React components |
| Nervous system | Middleware, especially the listener middleware |
| External senses | Async thunks talking to the mock API |
| MRI scanner | Redux DevTools |

---

## Folder structure

```
src/
  app/               store.js, listenerMiddleware.js, middleware.js, persistenceMiddleware.js, hooks.js
  features/
    posts/           postsSlice.js (entity adapter + thunks), postsSelectors.js
    platforms/        platformsSlice.js, platformsSelectors.js
    drafts/           draftsSlice.js (autosave + version history)
    notifications/    notificationsSlice.js (entity adapter)
    activity/         activitySlice.js (running event log)
    filters/          filtersSlice.js
    search/           searchSlice.js (+ recent search history)
    ui/               uiSlice.js (theme, modals, toasts, command palette)
  selectors/          statsSelectors.js, insightsSelectors.js — cross-slice memoized selectors
  services/           mockApi.js, perfTracker.js
  hooks/              useDebounce, useKeyboardShortcut, useRenderCount, useFps
  components/         layout/, common/, posts/, filters/, search/, activity/, command/, charts/
  pages/              Dashboard, Posts, Analytics, PerformanceLab, Activity
  styles/             tokens.css (3 themes), components.css
  tests/              reducer, selector, async-thunk, and component tests
```

---

## Redux architecture

### Normalized state
`posts`, `platforms`, and `notifications` use `createEntityAdapter`, so state looks like `{ ids: [], entities: {} }` instead of a raw array. That means O(1) lookups by id, no manual array-splicing in reducers, and adapter-generated selectors (`selectAll`, `selectById`, `selectTotal`) for free.

### Async thunks & optimistic updates
`postsSlice.js` implements `fetchPosts`, `createPost`, `updatePost`, `deletePost`, and `publishPost` via `createAsyncThunk`. `updatePost` and `deletePost` apply their change **optimistically** in the `pending` case, and roll back to a snapshot taken before the request if the `rejected` case fires — so a flaky mock API never leaves the UI stuck.

### Middleware stack (`app/store.js`)
Applied in this order: `listenerMiddleware` → `performanceMiddleware` → `analyticsMiddleware` → `persistenceMiddleware` → `loggerMiddleware` (dev only).

- **`listenerMiddleware.js`** — the nervous system. Chains reactions without slices knowing about each other, e.g. `createPost.fulfilled` → push a notification → append an activity-log entry. Also handles publish, delete, favorite/pin toggles, draft autosave persistence, and theme-change persistence.
- **`middleware.js`** — `performanceMiddleware` times every action and forwards it to a plain-JS perf tracker singleton (kept outside Redux deliberately, so measuring dispatches never triggers more dispatches). `analyticsMiddleware` counts domain-relevant action types. `loggerMiddleware` gives readable console groups in dev.
- **`persistenceMiddleware.js`** — mirrors sidebar/search-history state to `localStorage` after the actions that should survive a refresh.

### Memoized selectors
`postsSelectors.js` alone defines 15+ derived selectors — published/draft/archived/favorite/pinned/scheduled/today's/recent posts, platform distribution, content stats (total characters, avg word count, longest post, avg reading time), draft completion %, engagement score, growth metrics, and a 14-day timeseries. `selectors/statsSelectors.js` and `insightsSelectors.js` compose across slices (posts + platforms + filters + search) into dashboard summaries and plain-language insights. **None of this is stored in the store — it's all computed on read and cached by `reselect`.**

You can watch the cache in action on the **Performance Lab** page, which polls `selector.recomputations()` every 500ms.

---

## Performance techniques demonstrated

- `React.memo` on `PostCard`, with a custom comparator and a visible render-count badge (`showRenderBadge`) so you can watch cards *not* re-render when a sibling changes.
- `useMemo` in `PostList` to give each mounted list its own selector instance (factory selector pattern), so multiple lists on screen don't thrash one shared memoization cache.
- A dedicated **Performance Lab** page (`/performance`) showing, live: render count for that page, FPS (via `requestAnimationFrame`), actions dispatched, store updates, average action execution time, actions/sec, approximate state size in KB, and per-selector recomputation counts.
- Lazy, animated stat counters (`StatCard`) that tween with `requestAnimationFrame` instead of re-rendering on every store tick.

---

## Feature tour

- **Command palette** — `Ctrl/Cmd+K` opens a VS-Code-style palette to jump to pages, posts, or run commands.
- **Keyboard shortcuts** — `Ctrl+K` (palette), `Ctrl+N` (new post), `Ctrl+Shift+L` (cycle theme).
- **Three themes** — Aurora (light, default), Midnight (dark), Synapse Neural (dark + violet/pink), all pure CSS custom properties, persisted to `localStorage`.
- **Smart drafts** — the post editor autosaves to the `drafts` slice 1.2s after you stop typing, keeps up to 20 versions, and lets you restore any of them.
- **AI-style insights** — plain-language observations on the dashboard ("Instagram posts perform best…") generated entirely from selector output. No AI API is called; it's derived state, dressed up.
- **Mock API failure handling** — an 8% random failure rate on every mock request lets you see error toasts and optimistic-update rollbacks without needing a real flaky backend.

---

## Testing

`npm run test` runs Vitest against:
- **Reducers** (`tests/postsSlice.test.js`) — favorite/pin toggles, duplication, bulk delete, fetch normalization.
- **Selectors** (`tests/postsSelectors.test.js`) — filtering correctness and a direct assertion that `reselect` only recomputes when its inputs actually change.
- **Async thunks** (`tests/postsThunks.test.js`) — mocks `services/mockApi` to verify `createPost` success and `deletePost` rollback-on-failure.
- **A component** (`tests/Badge.test.jsx`) — React Testing Library render/assert example.

---

## Design notes

The visual language mixes Linear's density and restraint, Stripe's soft gradients, and Notion's calm neutrals, with a glassmorphism surface treatment (`backdrop-filter: blur()`) throughout. Typography is Space Grotesk (display) + Inter (body) + JetBrains Mono (anything numeric — stats, selector counts, timestamps), which is a deliberate choice: mono numerals don't jitter in width as they tick up.

All three themes live entirely in `styles/tokens.css` as CSS custom properties scoped under `[data-theme="…"]`, so adding a fourth theme never touches component code.

---

## Easter eggs & achievements 🎁

Because a Redux showcase doesn't have to be dry. There's a full achievement system (`features/achievements/`) tracking 16 badges — some obvious, some hidden until you find them. Open the trophy icon in the topbar to see your progress.

Things worth trying:

- **The Konami code** — `↑ ↑ ↓ ↓ ← → ← → B A` anywhere in the app unlocks a secret **Matrix** theme (green terminal rain, the works) and an achievement.
- **Click the sidebar logo 7 times fast** — unlocks "Brain Surgeon" with a little pulse animation.
- **`Ctrl/Cmd+K`, then type "party"** — toggles a rainbow hue-rotate party mode.
- **`Ctrl/Cmd+K`, then type "coffee"** or **"the meaning of life"** — a couple of dry jokes with their own achievements.
- **`Ctrl/Cmd+K`, then type "red pill"** — same Matrix easter egg, front door instead of the secret handshake.
- **Publish a post** — real confetti (hand-rolled canvas physics, not a gif).
- **Open your browser console** — there's ASCII art waiting for you.
- **Six real themes to cycle through** (`Ctrl+Shift+L` or the theme pill): Aurora, Midnight, Synapse Neural, Sakura, Terminal, and Sunset — try all six for the "Shape Shifter" badge.
- **Use the app after midnight** — "Night Owl" is watching the clock.

All of it is wired through the same listener-middleware pattern as the rest of the app (`unlockAchievementThunk` in `app/achievementHelpers.js`), so it doubles as one more example of Redux Toolkit patterns in the wild rather than a bolted-on gimmick.

---



This build focuses depth over breadth: it fully implements the CRUD + normalization + async-thunk requirements of Experiment 1.2.1 and the memoized-selector + render-performance requirements of Experiment 1.2.2, with a production-feeling UI around them. It does **not** implement every item in an exhaustive feature wishlist (e.g. full CSV/JSON import-export, a 5-platform pixel-perfect preview for every network, or a heatmap/radar chart) — the architecture (slices, selectors, listener middleware, mock API) is built to make adding those straightforward.
