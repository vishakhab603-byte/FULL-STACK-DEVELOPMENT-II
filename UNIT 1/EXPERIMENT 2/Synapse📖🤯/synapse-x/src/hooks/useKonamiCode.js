import { useEffect, useRef } from 'react';

const KONAMI_SEQUENCE = [
  'arrowup', 'arrowup', 'arrowdown', 'arrowdown',
  'arrowleft', 'arrowright', 'arrowleft', 'arrowright',
  'b', 'a'
];

/** Calls `onUnlock` the moment the Konami code is typed anywhere in the app. */
export function useKonamiCode(onUnlock) {
  const progress = useRef(0);

  useEffect(() => {
    function onKeyDown(e) {
      const key = e.key.toLowerCase();
      const expected = KONAMI_SEQUENCE[progress.current];

      if (key === expected) {
        progress.current += 1;
        if (progress.current === KONAMI_SEQUENCE.length) {
          progress.current = 0;
          onUnlock();
        }
      } else {
        // allow the sequence to restart from a matching first key
        progress.current = key === KONAMI_SEQUENCE[0] ? 1 : 0;
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onUnlock]);
}
