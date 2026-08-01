const STATUS_LABEL = {
  draft: 'Draft',
  published: 'Published',
  publishing: 'Publishing…',
  scheduled: 'Scheduled',
  archived: 'Archived'
};

export default function Badge({ status, children, tone }) {
  const resolvedTone = tone || status;
  return <span className={`badge badge--${resolvedTone}`}>{children || STATUS_LABEL[status] || status}</span>;
}
