import { useEffect } from 'react';


export function useKeyboardShortcut(combo, handler, deps = []) {
  useEffect(() => {
    const parts = combo.toLowerCase().split('+');
    const wantsMod = parts.includes('mod');
    const wantsShift = parts.includes('shift');
    const key = parts[parts.length - 1];

    function onKeyDown(e) {
      const modPressed = e.metaKey || e.ctrlKey;
      const target = e.target;
      const isTyping = ['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable;

      if (isTyping && key !== 'k') return; // allow Ctrl+K even while typing (command palette)
      if (wantsMod && !modPressed) return;
      if (wantsShift && !e.shiftKey) return;
      if (e.key.toLowerCase() !== key) return;

      e.preventDefault();
      handler(e);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, deps);
}
