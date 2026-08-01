import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { achievementsDrawerClosed } from '../../features/ui/uiSlice';
import { ACHIEVEMENTS } from '../../data/achievements';
import { relativeTime } from '../../utils/date';

export default function AchievementsDrawer() {
  const dispatch = useAppDispatch();
  const unlockedIds = useAppSelector((s) => s.achievements.unlockedIds);
  const unlockedAt = useAppSelector((s) => s.achievements.unlockedAt);

  function close() {
    dispatch(achievementsDrawerClosed());
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(e) => e.target === e.currentTarget && close()}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Achievements"
          className="modal-panel achievements-panel"
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="modal-header">
            <h3>Achievements · {unlockedIds.length}/{ACHIEVEMENTS.length}</h3>
            <button type="button" className="icon-btn" onClick={close} aria-label="Close">
              <CloseIcon />
            </button>
          </div>
          <div className="modal-body">
            <p className="panel-subtitle">
              Some of these are hidden in plain sight. Try the command palette, the sidebar logo, and your keyboard's arrow keys.
            </p>
            <div className="achievements-grid">
              {ACHIEVEMENTS.map((a) => {
                const unlocked = unlockedIds.includes(a.id);
                const isHiddenSecret = a.secret && !unlocked;
                return (
                  <div key={a.id} className={`achievement-card${unlocked ? ' is-unlocked' : ''}`}>
                    <span className="achievement-icon">{isHiddenSecret ? '❔' : a.icon}</span>
                    <div className="achievement-text">
                      <strong>{isHiddenSecret ? '???' : a.title}</strong>
                      <span>{isHiddenSecret ? 'Keep exploring…' : a.description}</span>
                      {unlocked && unlockedAt[a.id] && (
                        <span className="achievement-timestamp">Unlocked {relativeTime(unlockedAt[a.id])}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
