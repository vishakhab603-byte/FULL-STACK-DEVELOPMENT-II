import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { dismissToast } from "../../store/slices/uiSlice";

function ToastItem({ toast }) {
  const dispatch = useDispatch();
  useEffect(() => {
    const t = setTimeout(() => dispatch(dismissToast(toast.id)), 3600);
    return () => clearTimeout(t);
  }, [toast.id, dispatch]);

  return (
    <div className={`toast ${toast.type}`} role="status">
      <span>{toast.message}</span>
    </div>
  );
}

export default function ToastStack() {
  const toasts = useSelector((s) => s.ui.toasts);
  if (!toasts.length) return null;
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
