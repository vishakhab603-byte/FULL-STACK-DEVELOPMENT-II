import { useEffect } from "react";

/**
 * @param {{ onPublish: () => void, onSaveDraft: () => void }} handlers
 */
export function useKeyboardShortcuts({ onPublish, onSaveDraft }) {
  useEffect(() => {
    function onKeyDown(e) {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      if (e.key === "Enter") {
        e.preventDefault();
        onPublish?.();
      } else if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        onSaveDraft?.();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onPublish, onSaveDraft]);
}
