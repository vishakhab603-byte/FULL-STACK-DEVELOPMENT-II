import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { commandPaletteOpened, themeCycled, modalOpened } from '../../features/ui/uiSlice';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ToastStack from '../common/ToastStack';
import CommandPalette from '../command/CommandPalette';
import PostEditorModal from '../posts/PostEditorModal';
import AchievementsDrawer from '../achievements/AchievementsDrawer';
import KonamiListener from '../easter-eggs/KonamiListener';
import ConfettiBurst from '../easter-eggs/ConfettiBurst';
import MatrixRain from '../easter-eggs/MatrixRain';

export default function AppShell() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.ui.theme);
  const activeModal = useAppSelector((s) => s.ui.activeModal);
  const paletteOpen = useAppSelector((s) => s.ui.commandPaletteOpen);
  const achievementsOpen = useAppSelector((s) => s.ui.achievementsOpen);
  const matrixRainActive = useAppSelector((s) => s.ui.matrixRainActive);
  const partyMode = useAppSelector((s) => s.ui.partyMode);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.body.classList.toggle('party-mode', partyMode);
  }, [partyMode]);

  useKeyboardShortcut('mod+k', () => dispatch(commandPaletteOpened()));
  useKeyboardShortcut('mod+n', () => dispatch(modalOpened({ modal: 'post-editor' })));
  useKeyboardShortcut('mod+shift+l', () => dispatch(themeCycled()));

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Topbar />
        <main className="app-content">
          <Outlet />
        </main>
      </div>

      <ToastStack />
      {paletteOpen && <CommandPalette />}
      {activeModal === 'post-editor' && <PostEditorModal />}
      {achievementsOpen && <AchievementsDrawer />}
      {matrixRainActive && <MatrixRain />}

      <KonamiListener />
      <ConfettiBurst />
    </div>
  );
}
