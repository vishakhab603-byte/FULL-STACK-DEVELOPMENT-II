import { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { commandPaletteOpened, modalOpened, achievementsDrawerToggled } from '../../features/ui/uiSlice';
import { notificationsAllRead } from '../../features/notifications/notificationsSlice';
import { searchQueryChanged, searchCommitted } from '../../features/search/searchSlice';
import ThemeToggle from '../common/ThemeToggle';

export default function Topbar() {
  const dispatch = useAppDispatch();
  const query = useAppSelector((s) => s.search.query);
  const unreadCount = useAppSelector((s) => s.notifications.unreadCount);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const notifications = useAppSelector((s) => s.notifications.ids.slice(0, 6).map((id) => s.notifications.entities[id]));
  const achievementCount = useAppSelector((s) => s.achievements.unlockedIds.length);

  useEffect(() => {
    function onClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-search">
        <SearchIcon />
        <input
          value={query}
          onChange={(e) => dispatch(searchQueryChanged(e.target.value))}
          onKeyDown={(e) => e.key === 'Enter' && dispatch(searchCommitted(query))}
          placeholder="Search posts…"
          aria-label="Search posts"
        />
        <kbd>Ctrl K</kbd>
      </div>

      <div className="topbar-actions">
        <button type="button" className="icon-btn" onClick={() => dispatch(commandPaletteOpened())} aria-label="Open command palette">
          <CommandIcon />
        </button>

        <div className="notif-wrapper" ref={notifRef}>
          <button
            type="button"
            className="icon-btn"
            onClick={() => {
              setNotifOpen((o) => !o);
              if (!notifOpen) dispatch(notificationsAllRead());
            }}
            aria-label="Notifications"
          >
            <BellIcon />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>
          {notifOpen && (
            <div className="notif-dropdown" role="menu">
              <div className="notif-dropdown-header">Notifications</div>
              {notifications.length === 0 && <div className="notif-empty">You're all caught up.</div>}
              {notifications.map((n) => (
                <div key={n.id} className={`notif-item notif-item--${n.type}`}>
                  <strong>{n.title}</strong>
                  <span>{n.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className="icon-btn"
          onClick={() => dispatch(achievementsDrawerToggled())}
          aria-label="Achievements"
          title="Achievements"
        >
          <TrophyIcon />
          <span className="achievement-count-badge">{achievementCount}</span>
        </button>

        <ThemeToggle />

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => dispatch(modalOpened({ modal: 'post-editor' }))}
        >
          <PlusIcon /> New Post
        </button>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="m20 20-3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function CommandIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 3a2 2 0 1 0 2 2v2H9a2 2 0 1 0 2 2h2a2 2 0 1 0 2-2v-2h2a2 2 0 1 0-2-2H9Zm0 8H7a2 2 0 1 0 2 2v-2Zm8 0h-2v2a2 2 0 1 0 2-2Zm-6 2v2a2 2 0 1 0 2-2h-2Z"
        stroke="currentColor" strokeWidth="1.3"
      />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function TrophyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8 5H5a3 3 0 0 0 3 4M16 5h3a3 3 0 0 1-3 4M10 15v2h4v-2M9 21h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
