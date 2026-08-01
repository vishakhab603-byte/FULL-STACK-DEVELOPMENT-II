import { useEffect, useState, useRef } from 'react';

/** Measures live frames-per-second via requestAnimationFrame, sampled twice a second. */
export function useFps() {
  const [fps, setFps] = useState(60);
  const frames = useRef(0);
  const lastSample = useRef(performance.now());
  const raf = useRef(null);

  useEffect(() => {
    function tick(now) {
      frames.current += 1;
      const elapsed = now - lastSample.current;
      if (elapsed >= 500) {
        setFps(Math.round((frames.current * 1000) / elapsed));
        frames.current = 0;
        lastSample.current = now;
      }
      raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return fps;
}
