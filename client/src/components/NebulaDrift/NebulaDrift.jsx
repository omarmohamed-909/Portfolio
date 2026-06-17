import { useEffect, useRef } from "react";
import styles from "./NebulaDrift.module.css";

const CONFIG = {
  desktop:  { count: 65, fps: 30, connDist: 130, glowR: 5, ptclOp: 0.25, lineOp: 0.05 },
  mobile:   { count: 25, fps: 20, connDist: 80,  glowR: 3, ptclOp: 0.15, lineOp: 0.03 },
  speed:    0.15,
  mouseR:   130,
  mouseStr: 0.4,
};

const NebulaDrift = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const frameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const isMobile = window.innerWidth < 768;
    const cfg = isMobile ? CONFIG.mobile : CONFIG.desktop;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const LIGHT_COLORS = { hMin: 199, hMax: 217, sMin: 30, sMax: 55, lMin: 20, lMax: 35 };
    const DARK_COLORS  = { hMin: 190, hMax: 240, sMin: 75, sMax: 100, lMin: 45, lMax: 65 };

    const randomHue = (isLight) => {
      const c = isLight ? LIGHT_COLORS : DARK_COLORS;
      return {
        hue: c.hMin + Math.random() * (c.hMax - c.hMin),
        sat: c.sMin + Math.random() * (c.sMax - c.sMin),
        lit: c.lMin + Math.random() * (c.lMax - c.lMin),
      };
    };

    /* particle class */
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * CONFIG.speed;
        this.vy = (Math.random() - 0.5) * CONFIG.speed;
        this.phase = Math.random() * Math.PI * 2;
        this.size = 1.2 + Math.random() * 1.8;
      }
    }

    const particles = Array.from({ length: cfg.count }, () => {
      const p = new Particle();
      Object.assign(p, randomHue(false));
      return p;
    });

    let time = 0;
    let last = 0;
    const interval = 1000 / cfg.fps;
    let prevTheme = null;

    const animate = (ts) => {
      const delta = ts - last;
      if (delta >= interval) {
        last = ts;
        time += 1;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const isLight = document.documentElement.getAttribute("data-theme") === "light";

        /* regenerate particle colors on theme toggle */
        if (prevTheme !== null && prevTheme !== isLight) {
          particles.forEach(p => Object.assign(p, randomHue(isLight)));
        }
        prevTheme = isLight;

        const ptclOp   = isLight ? 0.45 : cfg.ptclOp;
        const lineOp   = isLight ? 0.15 : cfg.lineOp;

        /* ── update & draw particles ── */
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          /* mouse repulse */
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const nearMouse = dist < CONFIG.mouseR && dist > 0;
          if (nearMouse) {
            const f = (CONFIG.mouseR - dist) / CONFIG.mouseR;
            p.vx += (dx / dist) * f * CONFIG.mouseStr * 0.1;
            p.vy += (dy / dist) * f * CONFIG.mouseStr * 0.1;
          }

          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.98;
          p.vy *= 0.98;

          /* wrap around edges */
          if (p.x < -30) p.x = canvas.width + 30;
          if (p.x > canvas.width + 30) p.x = -30;
          if (p.y < -30) p.y = canvas.height + 30;
          if (p.y > canvas.height + 30) p.y = -30;

          /* pulse & mouse glow */
          const pulse = 0.6 + Math.sin(time * 0.025 + p.phase) * 0.4;
          const mouseGlow = nearMouse ? (1 - dist / CONFIG.mouseR) * 0.45 : 0;
          const litBoost = isLight ? 12 : 20;
          const centerBoost = isLight ? 20 : 30;
          const opacity = Math.min(ptclOp * pulse + mouseGlow * 0.5, isLight ? 0.5 : 0.7);
          const glowR = cfg.glowR + mouseGlow * 4;
          const dotR = p.size + mouseGlow * 2;

          /* soft radial glow */
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
          grad.addColorStop(0,   `hsla(${p.hue}, ${p.sat}%, ${p.lit + litBoost}%, ${opacity})`);
          grad.addColorStop(0.3, `hsla(${p.hue}, ${p.sat}%, ${p.lit}%, ${opacity * 0.45})`);
          grad.addColorStop(1,   `hsla(${p.hue}, ${p.sat}%, ${p.lit}%, 0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          /* bright centre dot */
          ctx.beginPath();
          ctx.arc(p.x, p.y, dotR * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, ${p.lit + centerBoost}%, ${opacity})`;
          ctx.fill();
        }

        /* ── connections (rare — skip every other pair) ── */
        for (let i = 0; i < particles.length; i += 2) {
          for (let j = i + 2; j < particles.length; j += 3) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < cfg.connDist) {
              const op = (1 - dist / cfg.connDist) * lineOp;
              const avgH = (particles[i].hue + particles[j].hue) / 2;
              const avgS = isLight ? 40 : 75;
              const avgL = isLight ? 40 : 60;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `hsla(${avgH}, ${avgS}%, ${avgL}%, ${op})`;
              ctx.lineWidth = 0.35;
              ctx.stroke();
            }
          }
        }
      }
      frameRef.current = requestAnimationFrame(animate);
    };

    const onMouse = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener("mousemove", onMouse, { passive: true });
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className={styles.wrapper} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default NebulaDrift;
