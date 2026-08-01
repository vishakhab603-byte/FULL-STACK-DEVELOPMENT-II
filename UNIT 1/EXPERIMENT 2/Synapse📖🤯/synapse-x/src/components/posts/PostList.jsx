import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import { makeSelectVisiblePosts } from '../../features/posts/postsSelectors';
import PostCard from './PostCard';
import EmptyState from '../common/EmptyState';
import { SkeletonGrid } from '../common/SkeletonLoader';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { filtersReset } from '../../features/filters/filtersSlice';
import { modalOpened } from '../../features/ui/uiSlice';

export default function PostList({ showRenderBadge = false }) {
  // useMemo ensures each PostList instance gets its own selector instance,
  // so the memoization cache isn't shared/thrashed across mounted lists.
  const selectVisiblePosts = useMemo(makeSelectVisiblePosts, []);
  const posts = useSelector(selectVisiblePosts);
  const status = useAppSelector((s) => s.posts.status);
  const dispatch = useAppDispatch();

  if (status === 'loading' && posts.length === 0) {
    return <SkeletonGrid count={6} />;
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        title="No posts match these filters"
        message="Try clearing filters or create a new post to get started."
        action={
          <div className="empty-state-actions">
            <button type="button" className="btn btn-ghost" onClick={() => dispatch(filtersReset())}>
              Clear filters
            </button>
            <button type="button" className="btn btn-primary" onClick={() => dispatch(modalOpened({ modal: 'post-editor' }))}>
              New post
            </button>
          </div>
        }
      />
    );
  }

  return (
    <div className="post-grid">
      <AnimatePresence mode="popLayout">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} showRenderBadge={showRenderBadge} />
        ))}
      </AnimatePresence>
    </div>
  );
}
