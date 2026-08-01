export default function EmptyState({ title, message, action, icon }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">{icon || <DefaultIcon />}</div>
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  );
}

function DefaultIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3.5 3.5 0 0 0 1.5 6.5A3 3 0 0 0 9 21a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3Z"
        stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" opacity="0.5"
      />
    </svg>
  );
}
