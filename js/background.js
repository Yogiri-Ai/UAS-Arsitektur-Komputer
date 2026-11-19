/**
 * background.js
 * Canvas Background: Partikel Simbol Matematika Interaktif dengan Fisika Kursor
 */

(function () {
  const cv = document.getElementById('bg');
  if (!cv) return;
  const ctx = cv.getContext('2d');

  const SYM = '0123456789+−×÷=π∑√∞%∫≈∆θ'.split('');
  const COL = ['#4de2e8', '#ffd166', '#ff6b9d', '#8cf5a8', '#a99bff'];
  let W, H, dpr;
  let P = [];
  let B = [];
  let mx = -999, my = -999;
  let lastTrail = 0;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    cv.width = W * dpr;
    cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const n = Math.round(Math.min(90, (W * H) / 16000));
    P = [];
    for (let i = 0; i < n; i++) {
      P.push({
        x: Math.random() * W,
        y: Math.random() * H,
        z: 0.3 + Math.random() * 0.7,
        s: SYM[(Math.random() * SYM.length) | 0],
        c: COL[(Math.random() * COL.length) | 0],
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.1 - Math.random() * 0.4,
        r: Math.random() * 6.28,
        vr: (Math.random() - 0.5) * 0.012,
        ox: 0,
        oy: 0
      });
    }
  }

  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('pointermove', e => {
    mx = e.clientX;
    my = e.clientY;
    const t = performance.now();
    if (t - lastTrail > 70 && !reduce) {
      lastTrail = t;
      B.push({
        x: mx,
        y: my,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2 - 0.4,
        s: SYM[(Math.random() * SYM.length) | 0],
        c: COL[(Math.random() * 5) | 0],
        l: 1,
        g: 0,
        sz: 14
      });
    }
  });

  window.addEventListener('pointerleave', () => {
    mx = my = -999;
  });

  window.addEventListener('pointerdown', e => burst(e.clientX, e.clientY, 14));

  function burst(x, y, n) {
    if (reduce) return;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.28;
      const v = 2 + Math.random() * 5;
      B.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - 2,
        s: SYM[(Math.random() * SYM.length) | 0],
        c: COL[(Math.random() * 5) | 0],
        l: 1,
        g: 0.12,
        sz: 16 + Math.random() * 16
      });
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    const px = mx > 0 ? mx / W - 0.5 : 0;
    const py = my > 0 ? my / H - 0.5 : 0;

    for (const p of P) {
      if (!reduce) {
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
      }
      if (p.y < -40) p.y = H + 40;
      if (p.x < -40) p.x = W + 40;
      if (p.x > W + 40) p.x = -40;

      const dx = p.x + p.ox - mx;
      const dy = p.y + p.oy - my;
      const d = Math.hypot(dx, dy);

      if (d < 150 && d > 0) {
        const f = (150 - d) / 150;
        p.ox += (dx / d) * f * 4;
        p.oy += (dy / d) * f * 4;
      }
      p.ox *= 0.92;
      p.oy *= 0.92;

      const X = p.x + p.ox - px * 60 * p.z;
      const Y = p.y + p.oy - py * 60 * p.z;

      if (d < 190) {
        ctx.strokeStyle = p.c;
        ctx.globalAlpha = (1 - d / 190) * 0.5;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(X, Y);
        ctx.lineTo(mx, my);
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(X, Y);
      ctx.rotate(p.r);
      ctx.globalAlpha = (0.18 + p.z * 0.4) * (d < 150 ? 1.8 : 1);
      ctx.fillStyle = p.c;
      ctx.font = `700 ${14 + p.z * 34}px 'Fira Code', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (p.z > 0.75) {
        ctx.shadowColor = p.c;
        ctx.shadowBlur = 14;
      }
      ctx.fillText(p.s, 0, 0);
      ctx.restore();
    }

    ctx.shadowBlur = 0;
    for (let i = B.length - 1; i >= 0; i--) {
      const b = B[i];
      b.x += b.vx;
      b.y += b.vy;
      b.vy += b.g;
      b.l -= 0.018;
      if (b.l <= 0) {
        B.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = b.l;
      ctx.fillStyle = b.c;
      ctx.font = `800 ${b.sz}px 'Fira Code', monospace`;
      ctx.fillText(b.s, b.x, b.y);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(loop);
  }

  window.burst = burst;
  window.initBackgroundLoop = () => loop();
})();
