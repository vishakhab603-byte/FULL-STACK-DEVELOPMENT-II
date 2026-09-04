import { THEME_SPARK } from "../../data/roleGlyph";

function Avatar({ color, color2, big, pulseKey, glyph, theme, onClick }) {
    const orbit = big ? 62 : 26;
    const spark = THEME_SPARK[theme] || "✦";
    return (<div className={"avatar" + (big ? " big" : "")} style={{ "--ac": color, "--ac2": color2 || color, cursor: onClick ? "pointer" : undefined }} key={pulseKey} onClick={onClick}>
      <div className="avatar-glow"/>
      <div className="avatar-ring2"/>
      <div className="avatar-ring"/>
      <div className="avatar-spark" style={{ "--orbit": orbit + "px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: big ? 11 : 7, background: "transparent", boxShadow: "none", color: "#fff" }}>{spark}</div>
      <div className="core">
        <div className="core-inner">{glyph || "◆"}</div>
      </div>
    </div>);
}

export { Avatar };
