import { getPlatform } from "./platformRules";

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

const PLATFORM_REACH = {
  x: 1,
  threads: 0.8,
  linkedin: 1.3,
  instagram: 1.6,
  facebook: 0.9,
  medium: 1.1,
  substack: 0.7,
};

/**
 * Stable-per-post mock engagement — same post always yields the same numbers,
 * so refreshing the Published view doesn't make the stats jitter.
 */
export function generatePostStats(post) {
  const seed = hashString(post.id);
  const reach = post.platformIds.reduce((sum, id) => sum + (PLATFORM_REACH[id] ?? 1), 0) || 1;
  const base = 30 + seededRandom(seed) * 220;

  const likes = Math.round(base * reach);
  const comments = Math.round(likes * (0.04 + seededRandom(seed + 1) * 0.08));
  const shares = Math.round(likes * (0.02 + seededRandom(seed + 2) * 0.06));

  return { likes, comments, shares };
}

export function platformNames(ids) {
  return ids.map((id) => getPlatform(id)?.name).filter(Boolean);
}
