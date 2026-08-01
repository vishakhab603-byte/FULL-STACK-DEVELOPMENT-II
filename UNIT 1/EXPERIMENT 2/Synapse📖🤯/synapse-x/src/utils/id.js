/**
 * Generates a reasonably unique id without external deps.
 * Format: <prefix>_<timestamp36><random36>
 */
export function makeId(prefix = 'id') {
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 9);
  return `${prefix}_${time}${rand}`;
}
