import { useState } from "react";

function NotificationBell({ notifications, unreadCount, onOpen }) {
    const [open, setOpen] = useState(false);
    return (<div style={{ position: "relative" }}>
      <div className="notif-bell" onClick={() => { setOpen(o => !o); if (!open)
        onOpen(); }}>
        🔔
        {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </div>
      {open &&
            <div className="card notif-panel" onMouseLeave={() => setOpen(false)}>
          {notifications.length === 0 && <div style={{ padding: 16, fontSize: 12.5, color: "var(--muted)" }}>Nothing yet — go do something real.</div>}
          {notifications.map(n => (<div key={n.id} className={"notif-item" + (n.read ? "" : " unread")}>
              <div className="body">
                {n.text}
                <div className="notif-time">{new Date(n.ts).toLocaleTimeString()}</div>
              </div>
            </div>))}
        </div>}
    </div>);
}

export { NotificationBell };
