import { PageHeader } from './Dashboard';
import ActivityTimeline from '../components/activity/ActivityTimeline';
import { useAppDispatch } from '../app/hooks';
import { activityCleared } from '../features/activity/activitySlice';

export default function Activity() {
  const dispatch = useAppDispatch();

  return (
    <div className="page">
      <PageHeader
        eyebrow="Activity"
        title="Everything that's happened"
        subtitle="A full timeline, appended to by the listener middleware in real time."
        actions={
          <button type="button" className="btn btn-ghost" onClick={() => dispatch(activityCleared())}>
            Clear log
          </button>
        }
      />
      <section className="panel panel--tall">
        <ActivityTimeline />
      </section>
    </div>
  );
}
