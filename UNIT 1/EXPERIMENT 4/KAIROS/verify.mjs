import fs from "node:fs";
import path from "node:path";

const root = path.dirname(new URL(import.meta.url).pathname);
const src = path.join(root, "src");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const failures = [];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const files = walk(src);
const jsx = files.filter(f => /\.(jsx|js)$/.test(f));
const app = fs.readFileSync(path.join(src, "App.jsx"), "utf8");
const nav = fs.readFileSync(path.join(src, "data", "navSections.js"), "utf8");
const indexCss = fs.readFileSync(path.join(src, "index.css"), "utf8");

const routeKeys = [...app.matchAll(/page === "([^"]+)"/g)].map(m => m[1]);
const navKeys = [...nav.matchAll(/\["([^"]+)"\s*,/g)].map(m => m[1]);
const unique = a => [...new Set(a)];
for (const key of unique(navKeys)) if (!routeKeys.includes(key)) failures.push(`navigation route missing from App: ${key}`);
for (const key of unique(routeKeys)) if (!navKeys.includes(key) && key !== "command") failures.push(`App route missing from navigation registry: ${key}`);

if (pkg.scripts?.build !== "vite build") failures.push("package.json build script is not 'vite build'");
if (!indexCss.includes("prefers-reduced-motion")) failures.push("reduced-motion guard missing");
for (const file of jsx) {
  const text = fs.readFileSync(file, "utf8");
  if (/<<<<<<<|=======|>>>>>>>/.test(text)) failures.push(`merge-conflict marker in ${path.relative(root, file)}`);
}

// Verify relative source imports resolve to real files without requiring node_modules.
for (const file of jsx) {
  const text = fs.readFileSync(file, "utf8");
  const importPattern = /(?:from\s+|import\s*\()([\"'])(\.\.?\/[^\"']+)\1/g;
  for (const match of text.matchAll(importPattern)) {
    const spec = match[2];
    const base = path.resolve(path.dirname(file), spec);
    const candidates = [base, `${base}.js`, `${base}.jsx`, `${base}.json`, path.join(base, "index.js"), path.join(base, "index.jsx")];
    if (!candidates.some(candidate => fs.existsSync(candidate))) {
      failures.push(`unresolved local import in ${path.relative(root, file)}: ${spec}`);
    }
  }
}

if (!fs.existsSync(path.join(root, "package-lock.json"))) failures.push("package-lock.json missing");
if (!fs.existsSync(path.join(root, "index.html"))) failures.push("index.html missing");

console.log(`KAIROS VERIFY: ${failures.length ? "FAIL" : "PASS"}`);
console.log(`Routes observed: ${unique(routeKeys).length}; navigation entries: ${unique(navKeys).length}`);
console.log(`JS/JSX files scanned: ${jsx.length}`);
if (failures.length) {
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("Build command: vite build");
  console.log("Reduced-motion guard: present");
  console.log("Merge-conflict scan: clean");
}
