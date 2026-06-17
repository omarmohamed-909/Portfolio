import { useEffect, useRef } from "react";
import styles from "./GridWaveBackground.module.css";

const CONFIG = {
  desktop:  { cols: 28, rows: 16, amp: 20, fps: 30, ptclOp: 0.45, lineOp: 0.07 },
  mobile:   { cols: 14, rows: 8,  amp: 10, fps: 20, ptclOp: 0.3,  lineOp: 0.04 },
  speed:    0.03,
  freqX:    0.06,
  freqY:    0.04,
  rippleR:  150,
  rippleA:  15,
};

const GridWaveBackground = () => {
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

    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let last = 0;
    const interval = 1000 / cfg.fps;

    const animate = (ts) => {
      const delta = ts - last;
      if (delta >= interval) {
        last = ts;
        time += CONFIG.speed * (delta / interval);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const cols = cfg.cols;
        const rows = cfg.rows;
        const spacingX = canvas.width / (cols + 1);
        const spacingY = canvas.height / (rows + 1);
        const offsetX = spacingX;
        const offsetY = spacingY;

        const points = [];

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const baseX = offsetX + c * spacingX;
            const baseY = offsetY + r * spacingY;

            let wave = Math.sin(c * CONFIG.freqX + r * CONFIG.freqY + time) * cfg.amp;

            const dx = baseX - mouseRef.current.x;
            const dy = baseY - mouseRef.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CONFIG.rippleR) {
              const ripple = Math.sin(dist * 0.05 - time * 2) * CONFIG.rippleA * (1 - dist / CONFIG.rippleR);
              wave += ripple;
            }

            points.push({
              x: baseX,
              y: baseY + wave,
              row: r,
              col: c,
            });
          }
        }

        ctx.lineWidth = 0.5;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const idx = r * cols + c;
            if (c < cols - 1) {
              const p1 = points[idx];
              const p2 = points[idx + 1];
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(0, 212, 255, ${cfg.lineOp})`;
              ctx.stroke();
            }
            if (r < rows - 1) {
              const p1 = points[idx];
              const p2 = points[idx + cols];
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(0, 212, 255, ${cfg.lineOp})`;
              ctx.stroke();
            }
          }
        }

        points.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 212, 255, ${cfg.ptclOp})`;
          ctx.fill();
        });
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

export default GridWaveBackground;
