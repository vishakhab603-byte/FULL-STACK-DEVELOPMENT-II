# KAIROS

A full React app (Vite) — every "slice" and component broken out into its own file.

## Structure

```
src/
  main.jsx              # entry point, mounts <App/>
  App.jsx                # root component, page router
  index.css              # all global styles (design tokens, animations, layout)
  components/
    pages/                # one file per routed page (Calendar, SchedulerDuel, WeekRenderMonitor, etc.)
    layout/               # Sidebar
    shared/               # reusable UI pieces (Avatar, Logo, ToastStack, particle effects, etc.)
    Login.jsx, OpeningSequence.jsx
  state/                  # store hooks: useEventStore, useContentStore, useActivityTracker
  hooks/                  # useTicker, useNotifications
  data/                   # seed data & constants (themes, achievements, nav sections, etc.)
  lib/                    # pure helper functions (scheduling, tests, chrono, audio, etc.)
```

## Run it

```
npm install
npm run dev
```

Then open the printed local URL. `npm run build` produces a production build in `dist/`.
