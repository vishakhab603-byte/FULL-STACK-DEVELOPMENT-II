import { useState } from "react";
import { AnimatedWordmark } from "../shared/AnimatedWordmark";
import { Avatar } from "../shared/Avatar";
import { AvatarGreetingModal } from "../shared/AvatarGreetingModal";
import { Logo } from "../shared/Logo";
import { NotificationBell } from "../shared/NotificationBell";
import { NAV_SECTIONS } from "../../data/navSections";
import { ROLE_GLYPH } from "../../data/roleGlyph";
import { ROLES, THEMES } from "../../data/theme";
import { playSfx } from "../../lib/audio";

function Sidebar({ page, setPage, session, onOpenPalette, notifications, unreadCount, onOpenNotifications, archetypeCtx }) {
    function activate(event, action) {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); action(); }
    }
    const role = ROLES[session.role];
    const [greetOpen, setGreetOpen] = useState(false);
    return (<div className="sidebar card" style={{ borderRadius: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={34} interactive/>
          <AnimatedWordmark size={15}/>
        </div>
        <NotificationBell notifications={notifications} unreadCount={unreadCount} onOpen={onOpenNotifications}/>
      </div>
      <div className="pill" role="button" tabIndex={0} aria-label="Open search and commands" style={{ cursor: "pointer", justifyContent: "space-between" }} onClick={onOpenPalette} onKeyDown={e => activate(e, onOpenPalette)}>
        <span>Search / commands</span>
        <span className="mono" style={{ fontSize: 10 }}>⌘K</span>
      </div>
      <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        {NAV_SECTIONS.map((sec, i) => (<div key={i}>
            {sec.label && <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 12px 6px" }}>{sec.label}</div>}
            {sec.items.map(([key, label]) => (<div key={key} className={"navitem" + (page === key ? " active" : "")} role="button" tabIndex={0} aria-current={page === key ? "page" : undefined} onClick={() => { playSfx("nav"); setPage(key); }} onKeyDown={e => activate(e, () => { playSfx("nav"); setPage(key); })}>
                <span>{label}</span>
              </div>))}
          </div>))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar color={role.color} color2={role.color2} glyph={ROLE_GLYPH[session.role]} theme={THEMES[session.theme].kind} onClick={() => setGreetOpen(true)}/>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{session.name}</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>{role.label}</div>
        </div>
      </div>
      {greetOpen &&
            <AvatarGreetingModal role={session.role} roleColor={role.color} roleColor2={role.color2} theme={THEMES[session.theme].kind} archetypeCtx={archetypeCtx} onClose={() => setGreetOpen(false)}/>}
    </div>);
}

export { Sidebar };
