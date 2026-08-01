const COLORS = ["#ffc53d", "#ff3d80", "#00c48c", "#2f7de1", "#ff5a4e", "#14213d"];
const GOLD_COLORS = ["#ffd700", "#ffe9a8", "#fff4d6", "#f0c14b", "#ffffff"];

/**
 * Fires a burst of DOM confetti pieces, self-cleaning after they finish
 * falling. No canvas, no deps — just absolutely-positioned divs.
 */
export function fireConfetti(count = 60, palette = COLORS) {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.inset = "0";
  container.style.pointerEvents = "none";
  container.style.zIndex = "300";
  document.body.appendChild(container);

  for (let i = 0; i < count; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.background = palette[i % palette.length];
    piece.style.animationDuration = 1.6 + Math.random() * 1.4 + "s";
    piece.style.animationDelay = Math.random() * 0.3 + "s";
    piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    container.appendChild(piece);
  }

  setTimeout(() => container.remove(), 3200);
}

export function fireLegendaryConfetti() {
  fireConfetti(220, GOLD_COLORS);
}
