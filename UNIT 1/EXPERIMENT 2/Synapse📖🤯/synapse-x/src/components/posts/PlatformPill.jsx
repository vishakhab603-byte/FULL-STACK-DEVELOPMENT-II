import { useAppSelector } from '../../app/hooks';
import { selectPlatformById } from '../../features/platforms/platformsSelectors';

export default function PlatformPill({ platformId }) {
  const platform = useAppSelector((s) => selectPlatformById(s, platformId));
  if (!platform) return null;
  return (
    <span className="platform-pill" style={{ '--platform-color': platform.color }}>
      <span className="platform-pill-dot" />
      {platform.name}
    </span>
  );
}
