const NAMESPACE = 'synapse-x';

export function loadState(key) {
  try {
    const raw = localStorage.getItem(`${NAMESPACE}:${key}`);
    if (!raw) return undefined;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[persistence] Failed to load "${key}"`, err);
    return undefined;
  }
}

export function saveState(key, value) {
  try {
    localStorage.setItem(`${NAMESPACE}:${key}`, JSON.stringify(value));
  } catch (err) {
    console.warn(`[persistence] Failed to save "${key}"`, err);
  }
}

export function removeState(key) {
  try {
    localStorage.removeItem(`${NAMESPACE}:${key}`);
  } catch (err) {
    console.warn(`[persistence] Failed to remove "${key}"`, err);
  }
}
