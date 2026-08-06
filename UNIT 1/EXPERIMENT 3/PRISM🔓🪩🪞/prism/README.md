# PRISM

**One Identity. Infinite Perspectives.**

An Identity Operating System that demonstrates JWT authentication and
Role-Based Access Control (RBAC) through a social-media command center —
built to teach the concepts by letting you *feel* them, not by explaining
them in a diagram.

## Running it

```bash
npm install
npm run dev
```

Open the printed localhost URL and sign in with one of the 8 demo
identities' username and password (expand "Demo credentials" on the login
screen to see all of them). Entry is only granted when the username and
password actually match a record — there is no bypass. Once verified,
watch the JWT get generated, decoded, and signed in front of you.

## The signature interaction

The **Identity Prism** on the Command Center is the heart of the app.
Click it and it rotates to the next role: the JWT payload updates, every
Quick Action re-evaluates its permission, the security score recalculates,
and the Audit Chronicle records the transition — live, with no page reload.

## Architecture

```
src/
  app/
    store.js              — configureStore, single source of truth
    middleware/
      auditListener.js    — RTK listener middleware: turns identity &
                             content actions into audit entries as a side
                             effect, so components never dispatch audit
                             writes themselves
  features/
    auth/authSlice.js      — identity, JWT lifecycle, session
    posts/postsSlice.js    — the content pipeline (draft → pending → published)
    audit/auditSlice.js    — the append-only event trail
    theme/themeSlice.js    — Theme Laboratory (3 themes in this build)
    roles/roles.js         — static role reference data (not Redux state —
                             it never changes at runtime, so it's config,
                             not state)
  utils/
    permission.utils.js    — the capability engine: CAPABILITIES, GRANTS,
                             hasCapability(). The single source of truth
                             for every authorization decision in the app.
  hooks/
    useCapability.js        — the only way components should ask "is this
                              allowed?" — never `role === 'architect'`
    useNow.js                — transient ticking clock, deliberately kept
                              out of Redux (see "state philosophy" below)
  routes/
    AppRoutes.jsx            — route tree
    ProtectedRoute.jsx       — redirects unauthenticated visitors to /login
  layouts/
    DashboardLayout.jsx      — Topbar + role-aware Sidebar shell
  pages/                     — one file per route
  components/                — shared presentational primitives
```

### State philosophy

- **Durable identity/session/content state** lives in Redux (`auth`,
  `posts`, `audit`, `theme`).
- **Static reference data** (`ROLES`, `CAPABILITIES`, `GRANTS`) is a plain
  module, not a slice — it's config, not state, and never changes at
  runtime.
- **Transient UI state** (the ticking clock, the JWT-visualizer animation
  steps during login) stays in component-local `useState`/`useEffect`. It
  never gets persisted and never belongs in the store.
- **Every authorization decision** routes through `hasCapability()` /
  `useCapability()`. No component compares a role name directly.
- **Audit logging is a side effect**, not something callers do manually —
  `auditListener.js` listens for the relevant actions and writes the
  audit trail itself. This keeps every feature slice free of
  cross-cutting concerns.

## What's deliberately out of v1

Per the project's phased roadmap, this build intentionally does **not**
include: the other 9+ themes, the mock AI writing assistant, the
scheduler/calendar, analytics charts, the achievements/XP system, sound,
offline mode, or a test suite. Those are real v1.1+ items — see the
project's roadmap notes rather than treating their absence as unfinished
work.

## Known limitations (be upfront about these in a viva)

- Authentication is entirely mocked — there is no backend and no real JWT
  signing. Username/password verification against `ROLES` in `roles.js`
  is real (wrong credentials are rejected), but passwords are stored in
  plain text in client-side source, which is fine for a demo and would
  never be acceptable in production. The "JWT" shown is a visual
  representation of the concept, not a cryptographically valid token.
- The RBAC grants in `permission.utils.js` are a reasonable, defensible
  default (e.g. Creators can draft but not publish directly; Guardians can
  approve but not manage users) — adjust them if your own model differs.
- No test suite is included yet. `src/utils/permission.utils.js` and the
  three slices are the highest-value places to start if you add one —
  they're pure functions/reducers with no UI dependency.
