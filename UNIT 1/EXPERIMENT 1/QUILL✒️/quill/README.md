# QUILL 🪶
### every quill needs a muse

A multi-platform post composer *and* manager: real per-platform validation,
thread/carousel auto-splitting, long-form support for Medium & Substack,
real scheduling that actually fires (a live ticker checks the queue against
the clock — no more "scheduled but never posted"), drafts with version
history and bulk actions, an analytics dashboard, and a built-in Muse that
suggests hashtags, rewrites your tone per platform, roasts your draft on
request, and surfaces a daily quote + trending conversation starters based
on the day and time. The whole UI shifts mood with the clock — dawn,
day, dusk, night — or you can pin it to Light or Dark.

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL. Everything (drafts, schedule, analytics,
theme, sound preference) persists to `localStorage` — no backend required.

## Run the validator tests

```bash
npm run test
```

## Platforms supported

X, Threads, LinkedIn, Instagram, Facebook — plus long-form: **Medium** and
**Substack**, which get a title field and no meaningful character limit.

## The scheduling fix

Earlier builds let you schedule a post but nothing ever checked the clock
against the queue, so scheduled posts just sat there. `App.jsx` now runs a
`useScheduleTicker()` hook that polls the queue every 10 seconds while the
app is open and auto-publishes anything whose time has come — complete with
a toast, confetti, and the publish chime, same as a manual publish.

## Dynamic, time-aware theme

`src/utils/timeOfDay.js` computes the real period of day (dawn / day / dusk
/ night). `ThemeManager.jsx` applies it to the document root as
`data-period`, and `index.css` defines a full palette for each — from a
bright working-desk day theme to a warm dusk gradient to a deep ink night
mode. Cycle **Auto → Light → Dark** from the toggle at the bottom of the
sidebar; Auto follows the clock live, Light pins to the day palette, Dark
pins to night.

On top of that, **Settings → Theme skin** lets you pin a completely
different look regardless of time: Sepia (typewriter/kraft paper), Neon
(cyberpunk glow), Forest (botanical greens), Blush (soft rose gold), and
Mono (high-contrast black & white). "Classic" leaves the dynamic day-cycle
system in charge.

## Day-awareness: quotes, prompts, and the calendar

`timeOfDay.js` also carries a weekday-personality map (Tuesdays post best,
Fridays want a recap, etc.) and a small evergreen list of notable days.
`quotesSuggester.js` rotates a public-domain quote or an original Muse-written
line daily — no real poems or lyrics are ever reproduced, by design.
`trendingTopics.js` is an honestly-labeled *curated* pool of evergreen
conversation starters, rotated by date — there's no live trends API here,
and the app doesn't pretend there is.

## Plugging in the real Claude API for the Tone Rewriter & Roast Mode

`src/utils/toneRewriter.js` ships a smart, rule-based rewriter so the app
works fully offline out of the box. To upgrade it to actually *think* (real
judgment about tone, not just regex), swap `ruleBasedRewrite()` for a call
to the Anthropic Messages API — there's a commented `callClaude()` stub at
the bottom of that file showing exactly where the `fetch` call goes and what
prompt shape to send. Same pattern applies to `roast()`.

## Folder map

```
src/
  store/            Redux Toolkit store + slices (composer, drafts, schedule,
                     analytics, ui)
  utils/             all the "smart" logic — validators, thread splitting,
                     hashtag extraction, tone rewriting, best-time heuristics,
                     readability hints, time-of-day + day-awareness engine,
                     quote/trending-prompt suggesters, confetti, sound,
                     csv export, storage
  components/
    composer/        the post composer, Muse sidebar, and the daily spark card
    drafts/           draft list, bulk actions, version history
    calendar/         schedule queue + calendar view
    analytics/         charts + content heatmap
    shared/           toasts, modal, error boundary, settings, theme manager
    layout/           sidebar nav (+ theme toggle) + header
  hooks/              keyboard shortcuts
  tests/              unit tests for the validators
```
