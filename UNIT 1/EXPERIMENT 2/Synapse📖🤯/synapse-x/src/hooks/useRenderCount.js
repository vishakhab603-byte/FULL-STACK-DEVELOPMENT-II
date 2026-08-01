import { useRef } from 'react';

/** Tracks how many times the calling component has rendered. Visible, real, unfaked. */
export function useRenderCount() {
  const count = useRef(0);
  count.current += 1;
  return count.current;
}
