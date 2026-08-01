import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  platformFilterChanged,
  statusFilterChanged,
  favoriteOnlyToggled,
  archivedOnlyToggled,
  filtersReset
} from '../../features/filters/filtersSlice';
import { selectAllPlatforms } from '../../features/platforms/platformsSelectors';

const STATUSES = ['all', 'draft', 'published', 'scheduled', 'archived'];

export default function FilterBar() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.filters);
  const platforms = useAppSelector(selectAllPlatforms);
  const hasActiveFilters =
    filters.platform !== 'all' || filters.status !== 'all' || filters.favoriteOnly || filters.archivedOnly;

  return (
    <div className="filter-bar">
      <select
        value={filters.platform}
        onChange={(e) => dispatch(platformFilterChanged(e.target.value))}
        aria-label="Filter by platform"
      >
        <option value="all">All platforms</option>
        {platforms.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(e) => dispatch(statusFilterChanged(e.target.value))}
        aria-label="Filter by status"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s === 'all' ? 'All statuses' : s[0].toUpperCase() + s.slice(1)}</option>
        ))}
      </select>

      <button
        type="button"
        className={`chip-toggle${filters.favoriteOnly ? ' is-active' : ''}`}
        onClick={() => dispatch(favoriteOnlyToggled())}
      >
        ★ Favorites
      </button>

      <button
        type="button"
        className={`chip-toggle${filters.archivedOnly ? ' is-active' : ''}`}
        onClick={() => dispatch(archivedOnlyToggled())}
      >
        Archived
      </button>

      {hasActiveFilters && (
        <button type="button" className="btn-link" onClick={() => dispatch(filtersReset())}>
          Reset
        </button>
      )}
    </div>
  );
}
