import { useState, useCallback, useEffect, useRef } from "react";

function useNotifications() {
    const [toasts, setToasts] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const timersRef = useRef(new Set());
    useEffect(() => () => {
        timersRef.current.forEach(id => window.clearTimeout(id));
        timersRef.current.clear();
    }, []);
    const push = useCallback((text, tone) => {
        const id = Date.now() + Math.random();
        setToasts(t => [...t, { id, text, tone: tone || "default", popping: false }]);
        const popTimer = window.setTimeout(() => {
            setToasts(t => t.map(x => x.id === id ? { ...x, popping: true } : x));
            timersRef.current.delete(popTimer);
            const removeTimer = window.setTimeout(() => {
                setToasts(t => t.filter(x => x.id !== id));
                timersRef.current.delete(removeTimer);
            }, 380);
            timersRef.current.add(removeTimer);
        }, 3820);
        timersRef.current.add(popTimer);
        setNotifications(n => [{ id, text, tone: tone || "default", ts: Date.now(), read: false }, ...n].slice(0, 40));
    }, []);
    const markAllRead = useCallback(() => {
        setNotifications(n => n.map(x => ({ ...x, read: true })));
    }, []);
    const unreadCount = notifications.filter(n => !n.read).length;
    return { toasts, notifications, push, markAllRead, unreadCount };
}

export { useNotifications };
