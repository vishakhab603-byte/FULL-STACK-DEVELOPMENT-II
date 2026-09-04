function Scene3D({ kind }) {
  if (kind === "cosmic" || kind === "nebula" || kind === "storm") return (
    <div className={`scene3d-wrap scene3d-gyro scene-${kind}`} aria-hidden="true">
      <div className="gyro-orb"><div className="gyro-ring gyro-ring-x"/><div className="gyro-ring gyro-ring-y"/><div className="gyro-ring gyro-ring-z"/><div className="gyro-core"/><div className="gyro-satellite sat-a"/><div className="gyro-satellite sat-b"/></div>
      <div className="orb-particle p1"/><div className="orb-particle p2"/><div className="orb-particle p3"/><div className="orb-particle p4"/>
      <div className="orb-halo"/>
    </div>
  );
  if (kind === "grid") return (
    <div className="scene3d-wrap scene3d-tunnel scene-grid" aria-hidden="true">
      <div className="grid-tunnel">
        {[0,1,2,3,4,5,6,7,8].map(i => <div key={i} className="tunnel-ring" style={{animationDelay:`${i * -0.62}s`}}/>)}
      </div>
      <div className="tunnel-core"/><div className="tunnel-ray ray-a"/><div className="tunnel-ray ray-b"/><div className="tunnel-ray ray-c"/><div className="tunnel-scanline"/>
    </div>
  );
  if (kind === "zen") return (
    <div className="scene3d-wrap scene3d-stone scene-zen" aria-hidden="true">
      <div className="floating-stone"><div className="stone-face stone-top"/><div className="stone-face stone-front"/><div className="stone-face stone-side"/></div>
      <div className="zen-orbit"><span/><span/><span/></div><div className="zen-moon"/><div className="zen-petal petal-a"/><div className="zen-petal petal-b"/>
    </div>
  );
  if (kind === "sunset") return (
    <div className="scene3d-wrap scene3d-peaks scene-sunset" aria-hidden="true">
      <div className="peaks-scene"><div className="peak-sun"/><div className="peak-layer peak-back"/><div className="peak-layer peak-mid"/><div className="peak-layer peak-front"/></div>
      <div className="sun-rays"/><div className="sun-flare"/><div className="sun-halo-3d"/>
    </div>
  );
  if (kind === "aurora") return (
    <div className="scene3d-wrap scene3d-helix scene-aurora" aria-hidden="true">
      <div className="ribbon-helix">{[0,1,2,3,4,5,6,7].map(i => <div key={i} className="helix-band" style={{animationDelay:`${i * -0.42}s`,top:`${i * 12.5}%`}}/>)}</div>
      <div className="helix-core"/><div className="aurora-orbit"/><div className="helix-particle hp-a"/><div className="helix-particle hp-b"/><div className="helix-particle hp-c"/>
    </div>
  );
  return null;
}
export { Scene3D };
