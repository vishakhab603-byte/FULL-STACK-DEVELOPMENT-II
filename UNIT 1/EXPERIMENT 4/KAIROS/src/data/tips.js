import { useMemo, useCallback, memo } from "react";

const TIPS = [
    "memo compares props with Object.is by default — a new inline object always fails that check.",
    "useCallback doesn't make a function faster. It makes its identity stable so memoized children can trust it.",
    "useMemo is for values, not side effects — it can be dropped without breaking correctness, only performance.",
    "Keys tell React which items are which across renders. Index keys lie the moment your list reorders.",
    "A component re-rendering isn't automatically a problem — the DOM only updates where the output actually differs.",
    "Structural sharing means only the part of your data that changed gets a new reference — everything else stays put.",
    "useTransition lets you mark an update as non-urgent, so React can keep the UI responsive while it works.",
    "The React DevTools Profiler will show you real render costs — trust measurements over intuition.",
];

export { TIPS };
