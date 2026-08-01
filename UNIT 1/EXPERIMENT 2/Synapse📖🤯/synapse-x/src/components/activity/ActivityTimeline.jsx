import { useAppSelector } from '../../app/hooks';
import { formatClock, formatDate } from '../../utils/date';
import EmptyState from '../common/EmptyState';

export default function ActivityTimeline({ limit }) {
  const entries = useAppSelector((s) => s.activity.entries);
  const visible = limit ? entries.slice(0, limit) : entries;

  if (visible.length === 0) {
    return <EmptyState title="No activity yet" message="Actions you take across SYNAPSE X will show up here in real time." />;
  }

  let lastDate = null;

  return (
    <div className="activity-timeline">
      {visible.map((entry) => {
        const dateLabel = formatDate(entry.timestamp);
        const showDate = dateLabel !== lastDate;
        lastDate = dateLabel;
        return (
          <div key={entry.id}>
            {showDate && <div className="activity-date-divider">{dateLabel}</div>}
            <div className="activity-entry">
              <span className="activity-entry-time mono">{formatClock(entry.timestamp)}</span>
              <span className="activity-entry-dot" aria-hidden="true" />
              <span className="activity-entry-label">{entry.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
