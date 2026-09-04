function setupGlobalInteractions() {
    const TRAIL_LEN = 7;
    const trailEls = [];
    for (let i = 0; i < TRAIL_LEN; i++) {
        const d = document.createElement("div");
        d.className = "cursor-trail-dot";
        d.style.opacity = String(1 - i / TRAIL_LEN);
        d.style.width = d.style.height = (7 - i * 0.6) + "px";
        document.body.appendChild(d);
        trailEls.push({ el: d, x: 0, y: 0 });
    }

    let mouseX = -100, mouseY = -100;
    let targetMagnet = null;
    let targetLight = null;
    let targetTilt = null;
    let rafId = null;

    const clearTransform = (el) => {
        if (!el) return;
        el.style.removeProperty("transform");
        el.classList.remove("magnet-active", "tilt-active");
    };

    function onMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        document.documentElement.style.setProperty("--pointer-x", `${e.clientX}px`);
        document.documentElement.style.setProperty("--pointer-y", `${e.clientY}px`);

        const nextMagnet = e.target.closest?.(".btn-primary");
        if (nextMagnet !== targetMagnet) {
            clearTransform(targetMagnet);
            targetMagnet = nextMagnet;
        }

        const nextLight = e.target.closest?.(".card, .mirror-panel, .pipeline-col, .achv-card");
        if (nextLight !== targetLight) {
            if (targetLight) {
                targetLight.style.removeProperty("--mx");
                targetLight.style.removeProperty("--my");
            }
            targetLight = nextLight;
        }
        if (targetLight) {
            const rect = targetLight.getBoundingClientRect();
            targetLight.style.setProperty("--mx", `${e.clientX - rect.left}px`);
            targetLight.style.setProperty("--my", `${e.clientY - rect.top}px`);
        }

        const nextTilt = e.target.closest?.(".tilt");
        if (nextTilt !== targetTilt) {
            clearTransform(targetTilt);
            targetTilt = nextTilt;
        }
    }

    function onMouseDown(e) {
        const btn = e.target.closest?.(".btn");
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const span = document.createElement("span");
        span.className = "btn-ripple";
        const size = Math.max(rect.width, rect.height) * 1.4;
        span.style.width = span.style.height = size + "px";
        span.style.left = (e.clientX - rect.left) + "px";
        span.style.top = (e.clientY - rect.top) + "px";
        btn.appendChild(span);
        window.setTimeout(() => span.remove(), 600);
    }

    function tick() {
        let leadX = mouseX, leadY = mouseY;
        trailEls.forEach((t, i) => {
            const lag = i === 0 ? 0.5 : 0.35;
            t.x += (leadX - t.x) * lag;
            t.y += (leadY - t.y) * lag;
            t.el.style.transform = `translate3d(${t.x}px, ${t.y}px, 0) translate(-50%,-50%)`;
            leadX = t.x;
            leadY = t.y;
        });

        if (targetMagnet) {
            const rect = targetMagnet.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (mouseX - cx) * 0.16;
            const dy = (mouseY - cy) * 0.16;
            targetMagnet.classList.add("magnet-active");
            targetMagnet.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
        }

        if (targetTilt) {
            const rect = targetTilt.getBoundingClientRect();
            const nx = (mouseX - rect.left) / rect.width - 0.5;
            const ny = (mouseY - rect.top) / rect.height - 0.5;
            targetTilt.classList.add("tilt-active");
            targetTilt.style.transform = `perspective(900px) rotateX(${ny * -5}deg) rotateY(${nx * 5}deg) translateZ(5px)`;
        }
        rafId = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    rafId = requestAnimationFrame(tick);

    return function cleanup() {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mousedown", onMouseDown);
        if (rafId) cancelAnimationFrame(rafId);
        clearTransform(targetMagnet);
        clearTransform(targetTilt);
        if (targetLight) {
            targetLight.style.removeProperty("--mx");
            targetLight.style.removeProperty("--my");
        }
        trailEls.forEach(t => t.el.remove());
    };
}

export { setupGlobalInteractions };
