export function SkeletonCard() {
  return (
    <div className="skeleton skeleton-card" aria-hidden="true">
      <div className="skeleton-line skeleton-line--sm" />
      <div className="skeleton-line skeleton-line--lg" />
      <div className="skeleton-line skeleton-line--md" />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="skeleton skeleton-row" aria-hidden="true">
      <div className="skeleton-line skeleton-line--sm" style={{ width: '30%' }} />
      <div className="skeleton-line skeleton-line--sm" style={{ width: '50%' }} />
    </div>
  );
}
