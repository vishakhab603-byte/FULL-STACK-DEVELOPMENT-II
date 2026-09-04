import { useState, useCallback } from "react";

function useTicker() {
    const [, setTick] = useState(0);
    return useCallback(() => setTick(t => t + 1), []);
}

export { useTicker };
