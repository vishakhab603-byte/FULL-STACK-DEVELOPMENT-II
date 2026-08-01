import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  commandPaletteClosed,
  modalOpened,
  themeCycled,
  themeSet,
  partyModeToggled,
  matrixThemeUnlockedSet,
  matrixRainTriggered,
  matrixRainEnded,
  toastPushed,
  achievementsDrawerToggled
} from '../../features/ui/uiSlice';
import { selectAllPosts } from '../../features/posts/postsSelectors';
import { unlockAchievementThunk } from '../../app/achievementHelpers';

const PAGES = [
  { id: 'page-dashboard', label: 'Go to Dashboard', to: '/', group: 'Pages' },
  { id: 'page-posts', label: 'Go to Posts', to: '/posts', group: 'Pages' },
  { id: 'page-analytics', label: 'Go to Analytics', to: '/analytics', group: 'Pages' },
  { id: 'page-performance', label: 'Go to Performance Lab', to: '/performance', group: 'Pages' },
  { id: 'page-activity', label: 'Go to Activity', to: '/activity', group: 'Pages' }
];

export default function CommandPalette() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const posts = useAppSelector(selectAllPosts);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const commands = useMemo(() => {
    const staticCommands = [
      ...PAGES,
      { id: 'cmd-new-post', label: 'Create new post', group: 'Commands', action: () => dispatch(modalOpened({ modal: 'post-editor' })) },
      { id: 'cmd-cycle-theme', label: 'Cycle theme', group: 'Commands', action: () => dispatch(themeCycled()) },
      { id: 'cmd-achievements', label: 'View achievements', group: 'Commands', action: () => dispatch(achievementsDrawerToggled()) },
      {
        id: 'cmd-party',
        label: '🎉 party',
        group: 'Secrets',
        action: () => {
          dispatch(partyModeToggled());
          dispatch(unlockAchievementThunk('party-animal'));
        }
      },
      {
        id: 'cmd-coffee',
        label: '☕ coffee',
        group: 'Secrets',
        action: () => {
          dispatch(toastPushed({ tone: 'info', message: "☕ Here's a coffee break. Step away for five." }));
          dispatch(unlockAchievementThunk('coffee-break'));
        }
      },
      {
        id: 'cmd-42',
        label: '🌌 the meaning of life',
        group: 'Secrets',
        action: () => {
          dispatch(toastPushed({ tone: 'info', message: '42. Obviously.' }));
          dispatch(unlockAchievementThunk('deep-thoughts'));
        }
      },
      {
        id: 'cmd-matrix',
        label: '💊 red pill',
        group: 'Secrets',
        action: () => {
          dispatch(matrixThemeUnlockedSet());
          dispatch(matrixRainTriggered());
          dispatch(themeSet('matrix'));
          setTimeout(() => dispatch(matrixRainEnded()), 6000);
        }
      },
      {
        id: 'cmd-about',
        label: 'About SYNAPSE X',
        group: 'Commands',
        action: () =>
          dispatch(
            toastPushed({
              tone: 'info',
              message: 'SYNAPSE X — one brain, infinite state. Built to show off Redux Toolkit & Reselect.'
            })
          )
      }
    ];
    const postCommands = posts.slice(0, 8).map((p) => ({
      id: `post-${p.id}`,
      label: p.title,
      group: 'Posts',
      action: () => dispatch(modalOpened({ modal: 'post-editor', postId: p.id }))
    }));
    const all = [...staticCommands, ...postCommands];
    if (!query.trim()) return all.filter((c) => c.group !== 'Secrets');
    const q = query.toLowerCase();
    return all.filter((c) => c.label.toLowerCase().includes(q));
  }, [query, posts, dispatch]);

  function run(cmd) {
    if (cmd.to) navigate(cmd.to);
    if (cmd.action) cmd.action();
    dispatch(commandPaletteClosed());
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(commands.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter' && commands[activeIndex]) {
      run(commands[activeIndex]);
    } else if (e.key === 'Escape') {
      dispatch(commandPaletteClosed());
    }
  }

  let lastGroup = null;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop palette-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(e) => e.target === e.currentTarget && dispatch(commandPaletteClosed())}
      >
        <motion.div
          className="command-palette"
          initial={{ opacity: 0, y: -12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="command-palette-input">
            <SearchIcon />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Jump to a page, post, or command…"
              aria-label="Command palette"
            />
            <kbd>Esc</kbd>
          </div>
          <div className="command-palette-list" role="listbox">
            {commands.length === 0 && <div className="command-palette-empty">No matches.</div>}
            {commands.map((cmd, idx) => {
              const showGroup = cmd.group !== lastGroup;
              lastGroup = cmd.group;
              return (
                <div key={cmd.id}>
                  {showGroup && <div className="command-palette-group">{cmd.group}</div>}
                  <button
                    type="button"
                    className={`command-palette-item${idx === activeIndex ? ' is-active' : ''}`}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => run(cmd)}
                  >
                    {cmd.label}
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
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
