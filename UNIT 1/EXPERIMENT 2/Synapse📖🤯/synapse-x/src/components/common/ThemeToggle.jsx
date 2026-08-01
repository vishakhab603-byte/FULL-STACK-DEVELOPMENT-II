import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { themeCycled } from '../../features/ui/uiSlice';

const THEME_LABEL = {
  aurora: 'Aurora',
  midnight: 'Midnight',
  synapse: 'Synapse',
  sakura: 'Sakura',
  terminal: 'Terminal',
  sunset: 'Sunset',
  matrix: 'Matrix'
};

export default function ThemeToggle() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.ui.theme);

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => dispatch(themeCycled())}
      title="Cycle theme (Ctrl+Shift+L)"
      aria-label={`Current theme: ${THEME_LABEL[theme] || theme}. Click to switch.`}
    >
      <span className={`theme-toggle-dot theme-toggle-dot--${theme}`} aria-hidden="true" />
      {THEME_LABEL[theme] || theme}
    </button>
  );
}
