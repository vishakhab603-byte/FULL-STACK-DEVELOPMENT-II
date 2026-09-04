function ToastStack({ toasts }) {
    return (<div className="toast-stack">
      {toasts.map(t => (<div key={t.id} className={"toast" + (t.popping ? " toast-pop" : "")} style={{ borderColor: t.tone === "success" ? "var(--accent2)" : t.tone === "error" ? "var(--danger)" : undefined }}>
          {t.text}
        </div>))}
    </div>);
}

export { ToastStack };
