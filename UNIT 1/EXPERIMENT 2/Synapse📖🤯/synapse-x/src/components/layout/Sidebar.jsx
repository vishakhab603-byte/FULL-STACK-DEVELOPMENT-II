import { useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { sidebarToggled } from '../../features/ui/uiSlice';
import { unlockAchievementThunk } from '../../app/achievementHelpers';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: BrainIcon, end: true },
  { to: '/posts', label: 'Posts', icon: PostsIcon },
  { to: '/analytics', label: 'Analytics', icon: AnalyticsIcon },
  { to: '/performance', label: 'Performance Lab', icon: PulseIcon },
  { to: '/activity', label: 'Activity', icon: TimelineIcon }
];

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);
  const clickCount = useRef(0);
  const clickTimer = useRef(null);
  const [pulsing, setPulsing] = useState(false);

  function onLogoClick() {
    clickCount.current += 1;
    clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => {
      clickCount.current = 0;
    }, 1500);

    if (clickCount.current >= 7) {
      clickCount.current = 0;
      dispatch(unlockAchievementThunk('brain-surgeon'));
      setPulsing(true);
      setTimeout(() => setPulsing(false), 1400);
    }
  }

  return (
    <motion.aside
      className="sidebar"
      data-collapsed={collapsed}
      initial={false}
      animate={{ width: collapsed ? 76 : 236 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="sidebar-brand">
        <button
          type="button"
          className={`sidebar-brand-mark${pulsing ? ' is-pulsing' : ''}`}
          onClick={onLogoClick}
          aria-label="SYNAPSE X"
          title="One brain. Infinite state."
        >
          <BrainIcon />
        </button>
        {!collapsed && (
          <div className="sidebar-brand-text">
            <strong>SYNAPSE X</strong>
            <span>One brain. Infinite state.</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav" aria-label="Primary">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar-link${isActive ? ' is-active' : ''}`}
            title={collapsed ? label : undefined}
          >
            <Icon />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        className="sidebar-collapse-btn"
        onClick={() => dispatch(sidebarToggled())}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronIcon flipped={collapsed} />
        {!collapsed && <span>Collapse</span>}
      </button>
    </motion.aside>
  );
}

function BrainIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3.5 3.5 0 0 0 1.5 6.5A3 3 0 0 0 9 21a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3Z"
        stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
      />
      <path
        d="M15 3a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3.5 3.5 0 0 1-1.5 6.5A3 3 0 0 1 15 21a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z"
        stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
      />
    </svg>
  );
}

function PostsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 9h8M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 20V10M11 20V4M18 20v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PulseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 12h4l2-7 4 14 2-7h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TimelineIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon({ flipped }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      style={{ transform: flipped ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}
    >
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
