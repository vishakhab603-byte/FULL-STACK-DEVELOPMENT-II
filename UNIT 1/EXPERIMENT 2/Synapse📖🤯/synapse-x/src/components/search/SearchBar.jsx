import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { searchQueryChanged, searchCommitted, searchHistoryCleared } from '../../features/search/searchSlice';

export default function SearchBar() {
  const dispatch = useAppDispatch();
  const query = useAppSelector((s) => s.search.query);
  const recent = useAppSelector((s) => s.search.recent);
  const [showRecent, setShowRecent] = useState(false);

  return (
    <div className="search-bar-wrapper">
      <div className="search-bar">
        <input
          value={query}
          onChange={(e) => dispatch(searchQueryChanged(e.target.value))}
          onFocus={() => setShowRecent(true)}
          onBlur={() => setTimeout(() => setShowRecent(false), 150)}
          onKeyDown={(e) => e.key === 'Enter' && dispatch(searchCommitted(query))}
          placeholder="Search by title or content…"
          aria-label="Search posts"
        />
        {query && (
          <button type="button" className="btn-link" onClick={() => dispatch(searchQueryChanged(''))}>
            Clear
          </button>
        )}
      </div>
      {showRecent && recent.length > 0 && (
        <div className="search-recent">
          <div className="search-recent-header">
            <span>Recent searches</span>
            <button type="button" className="btn-link" onMouseDown={() => dispatch(searchHistoryCleared())}>
              Clear
            </button>
          </div>
          {recent.map((term) => (
            <button
              key={term}
              type="button"
              className="search-recent-item"
              onMouseDown={() => dispatch(searchQueryChanged(term))}
            >
              {term}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
