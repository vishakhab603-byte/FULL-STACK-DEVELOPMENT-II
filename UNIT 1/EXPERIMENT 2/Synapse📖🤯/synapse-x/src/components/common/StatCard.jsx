import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/** Animates a numeric value counting up whenever it changes. */
function useAnimatedNumber(target, durationMs = 600) {
  const [value, setValue] = useState(target);
  const prevRef = useRef(target);

  useEffect(() => {
    const from = prevRef.current;
    const to = target;
    if (from === to) return;
    const start = performance.now();

    let raf;
    function tick(now) {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (to - from) * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
      else prevRef.current = to;
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

export default function StatCard({ label, value, suffix = '', icon, tone = 'default', hint }) {
  const animated = useAnimatedNumber(typeof value === 'number' ? value : 0);
  const display = typeof value === 'number' ? animated : value;

  return (
    <motion.div
      className={`stat-card stat-card--${tone}`}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
    >
      <div className="stat-card-top">
        <span className="stat-card-label">{label}</span>
        {icon && <span className="stat-card-icon" aria-hidden="true">{icon}</span>}
      </div>
      <div className="stat-card-value">
        {display}
        {suffix}
      </div>
      {hint && <div className="stat-card-hint">{hint}</div>}
    </motion.div>
  );
}
