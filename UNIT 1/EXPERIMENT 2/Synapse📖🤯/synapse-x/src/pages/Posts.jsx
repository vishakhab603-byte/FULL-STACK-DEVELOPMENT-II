import { PageHeader } from './Dashboard';
import PostList from '../components/posts/PostList';
import FilterBar from '../components/filters/FilterBar';
import SearchBar from '../components/search/SearchBar';
import { useAppDispatch } from '../app/hooks';
import { modalOpened } from '../features/ui/uiSlice';

export default function Posts() {
  const dispatch = useAppDispatch();

  return (
    <div className="page">
      <PageHeader
        eyebrow="Posts"
        title="All posts"
        subtitle="Search, filter, and manage every post across every platform."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => dispatch(modalOpened({ modal: 'post-editor' }))}>
            New post
          </button>
        }
      />
      <div className="posts-toolbar">
        <SearchBar />
        <FilterBar />
      </div>
      <PostList showRenderBadge />
    </div>
  );
}
