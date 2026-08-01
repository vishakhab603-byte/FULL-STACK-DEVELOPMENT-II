import { useEffect, useRef } from 'react';
import { useAppSelector } from '../../app/hooks';

const COLORS = ['#6d4bff', '#00b8d9', '#ff6bd6', '#39ff6a', '#ffc04d', '#ff6fa5'];

export default function ConfettiBurst() {
  const nonce = useAppSelector((s) => s.ui.confettiNonce);
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    if (nonce === 0) return; // don't fire on initial mount

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const originX = width / 2;
    const originY = height / 3;
    const count = 90;

    particlesRef.current = Array.from({ length: count }, () => ({
      x: originX,
      y: originY,
      vx: (Math.random() - 0.5) * 14,
      vy: Math.random() * -12 - 4,
      size: Math.random() * 6 + 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      spin: (Math.random() - 0.5) * 20,
      life: 0
    }));

    let frame = 0;
    const maxFrames = 110;

    function tick() {
      frame += 1;
      ctx.clearRect(0, 0, width, height);

      particlesRef.current.forEach((p) => {
        p.vy += 0.35; // gravity
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.spin;
        p.life += 1;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, 1 - frame / maxFrames);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      if (frame < maxFrames) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    }

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [nonce]);

  return <canvas ref={canvasRef} className="confetti-canvas" aria-hidden="true" />;
}
