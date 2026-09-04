function buildLemniscatePath(W, H, pad) {
    const cx = W / 2, cy = H / 2, a = W / 2 - pad, b = H / 2 - pad;
    let d = "";
    for (let i = 0; i <= 100; i++) {
        const t = (i / 100) * Math.PI * 2;
        const denom = 1 + Math.sin(t) * Math.sin(t);
        const x = cx + a * Math.cos(t) / denom;
        const y = cy + b * Math.sin(t) * Math.cos(t) / denom;
        d += (i === 0 ? "M" : "L") + x.toFixed(2) + "," + y.toFixed(2) + " ";
    }
    return d + "Z";
}

export { buildLemniscatePath };
