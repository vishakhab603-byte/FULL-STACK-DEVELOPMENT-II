# KAIROS

A gamified time/task management React app — calendar, scheduler, "content pipeline"
board, XP/leveling system, achievements, mini "render performance" simulator/labs,
command palette, notifications, and multiple visual themes ("Cosmic", "Rain",
"Aurora", "Zen", "Cyber", "Sunset", "Storm").

Rebuilt from a single self-contained HTML prototype (React + Babel loaded via CDN,
JSX compiled in-browser) into a standard Vite project structure.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

## Build for production

```bash
npm run build
npm run preview
```

## Structure

```
index.html          Vite entry HTML
src/main.jsx         React root / mount point
src/App.jsx          All app logic and components (single file, as in the original)
src/index.css        All styling (themes, animations, layout)
```

Everything from the original prototype — components, hooks, mock API layer,
scoring/XP logic, themes, and the render-performance "labs" — is preserved as-is;
only the module wrapper changed (CDN + in-browser Babel → npm + Vite build).
