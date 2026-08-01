import { useCallback } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { useKonamiCode } from '../../hooks/useKonamiCode';
import { themeSet, matrixThemeUnlockedSet, matrixRainTriggered, matrixRainEnded } from '../../features/ui/uiSlice';

/** No UI of its own — just wires the Konami code to the Matrix easter egg. */
export default function KonamiListener() {
  const dispatch = useAppDispatch();

  const onUnlock = useCallback(() => {
    dispatch(matrixThemeUnlockedSet());
    dispatch(matrixRainTriggered());
    dispatch(themeSet('matrix'));

    setTimeout(() => {
      dispatch(matrixRainEnded());
    }, 6000);
  }, [dispatch]);

  useKonamiCode(onUnlock);
  return null;
}
