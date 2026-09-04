import { TreeRings } from "../shared/TreeRings";
import { ACHIEVEMENTS } from "../../data/achievements";
import { currentLevel } from "../../data/archetypes";

function AchievementCenter({ unlocked, xp }) {
    const { level, next } = currentLevel(xp);
    const span = next ? next.min - level.min : 1;
    const into = next ? xp - level.min : span;
    const pct = next ? Math.min(100, Math.round((into / span) * 100)) : 100;
    const unlockedCount = ACHIEVEMENTS.filter(a => unlocked[a.key]).length;
    return (<div className="fade-in">
      <div className="topbar">
        <div>
          <div className="serif" style={{ fontSize: 24 }}>Achievement Center</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Every achievement below is checked against real state — nothing unlocks on a timer or by chance.</div>
        </div>
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 18, display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 24, alignItems: "center" }}>
        <div className="xp-bar-wrap">
          <div>
            <div className="stat-label">Avtaara</div>
            <div className="stat-big" style={{ fontSize: 28 }}>{level.name}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>
              <span>{xp} XP</span>
              <span>{next ? `${next.min} XP → ${next.name}` : "Max level"}</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: pct + "%" }}/></div>
          </div>
        </div>
        <TreeRings unlockedCount={unlockedCount} total={ACHIEVEMENTS.length} levelName={level.name}/>
      </div>

      <div className="achv-grid">
        {ACHIEVEMENTS.map(a => {
            const isUnlocked = !!unlocked[a.key];
            return (<div key={a.key} className={"achv-card tilt" + (isUnlocked ? " unlocked" : " locked")}>
              <div className="achv-icon" style={{ background: isUnlocked ? "rgba(232,179,76,0.18)" : "rgba(255,255,255,0.06)", color: isUnlocked ? "var(--gold)" : "var(--muted)" }}>
                {isUnlocked ? "★" : "🔒"}
              </div>
              <b style={{ fontSize: 14 }}>{a.label}</b>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{a.desc}</div>
              <div style={{ marginTop: 8 }}><span className={isUnlocked ? "status-ok" : "status-pending"} style={{ fontSize: 10.5 }}>{isUnlocked ? "UNLOCKED" : "LOCKED"}</span></div>
            </div>);
        })}
      </div>
    </div>);
}

export { AchievementCenter };
