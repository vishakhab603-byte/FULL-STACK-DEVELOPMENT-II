import { useEffect, useRef } from "react";

const SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export function useSecretCode(onTrigger) {
  const buffer = useRef([]);

  useEffect(() => {
    function onKeyDown(e) {
      buffer.current = [...buffer.current, e.key].slice(-SEQUENCE.length);
      if (buffer.current.join(",") === SEQUENCE.join(",")) {
        buffer.current = [];
        onTrigger?.();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onTrigger]);
}
