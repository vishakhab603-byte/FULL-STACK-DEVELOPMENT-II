import { memo } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch } from '../../app/hooks';
import {
  postToggleFavorite,
  postTogglePin,
  postToggleArchive,
  postDuplicated,
  deletePost,
  publishPost
} from '../../features/posts/postsSlice';
import { modalOpened } from '../../features/ui/uiSlice';
import { truncate } from '../../utils/text';
import { relativeTime } from '../../utils/date';
import Badge from '../common/Badge';
import PlatformPill from './PlatformPill';
import { useRenderCount } from '../../hooks/useRenderCount';

function PostCard({ post, showRenderBadge = false }) {
  const dispatch = useAppDispatch();
  const renders = useRenderCount();

  return (
    <motion.article
      className="post-card"
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      {showRenderBadge && <span className="render-badge" title="Times this card has rendered">×{renders}</span>}

      <header className="post-card-header">
        <PlatformPill platformId={post.platformId} />
        <Badge status={post.status} />
      </header>

      <h4 className="post-card-title" onClick={() => dispatch(modalOpened({ modal: 'post-editor', postId: post.id }))}>
        {post.isPinned && <PinIcon />} {post.title}
      </h4>
      <p className="post-card-body">{truncate(post.content, 140)}</p>

      <footer className="post-card-footer">
        <span className="post-card-meta">{relativeTime(post.updatedAt)}</span>
        <div className="post-card-engagement">
          <span title="Likes">❤ {post.engagement?.likes ?? 0}</span>
          <span title="Comments">💬 {post.engagement?.comments ?? 0}</span>
        </div>
      </footer>

      <div className="post-card-actions">
        <button type="button" className="icon-btn-sm" onClick={() => dispatch(postToggleFavorite(post.id))} aria-label="Toggle favorite" data-active={post.isFavorite}>
          <StarIcon filled={post.isFavorite} />
        </button>
        <button type="button" className="icon-btn-sm" onClick={() => dispatch(postTogglePin(post.id))} aria-label="Toggle pin" data-active={post.isPinned}>
          <PinIcon />
        </button>
        <button type="button" className="icon-btn-sm" onClick={() => dispatch(postDuplicated(post))} aria-label="Duplicate">
          <CopyIcon />
        </button>
        {post.status !== 'published' && (
          <button type="button" className="icon-btn-sm" onClick={() => dispatch(publishPost(post.id))} aria-label="Publish">
            <SendIcon />
          </button>
        )}
        <button type="button" className="icon-btn-sm" onClick={() => dispatch(postToggleArchive(post.id))} aria-label="Toggle archive">
          <ArchiveIcon />
        </button>
        <button type="button" className="icon-btn-sm icon-btn-sm--danger" onClick={() => dispatch(deletePost(post.id))} aria-label="Delete">
          <TrashIcon />
        </button>
      </div>
    </motion.article>
  );
}

function StarIcon({ filled }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'}>
      <path d="m12 3 2.7 6.2 6.8.6-5.1 4.5 1.5 6.6L12 17.8 6.1 20.9l1.5-6.6-5.1-4.5 6.8-.6L12 3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M12 2v6M8 8h8l1 4H7l1-4ZM12 12v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="m3 11 18-8-8 18-2-8-8-2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
function ArchiveIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="16" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8M10 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// React.memo demonstrates render-skipping: only re-renders if `post` reference changes.
export default memo(PostCard, (prev, next) => prev.post === next.post && prev.showRenderBadge === next.showRenderBadge);
