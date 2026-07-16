/* VAYLA Link Tree — Background & Atmosphere
 * Handles: dot-grid canvas, ambient aurora blobs, vignette, grain.
 * Inspired by uilayouts ambient backdrop patterns.
 */
(function () {
  'use strict';

  const canvas = document.getElementById('canvas-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const SPACING = 42;
  const BASE_R = 1.1;
  const RAD = 170;
  const BOOST = 0.6;
  const DPR_CAP = 1.75;

  let W = 0, H = 0, dpr = 1;
  let dots = [];
  let mouse = { x: -9999, y: -9999 };
  let running = true;
  let rafId = null;
  let resizeTimer = 0;

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  function build() {
    const cols = Math.ceil(W / SPACING) + 2;
    const rows = Math.ceil(H / SPACING) + 2;
    dots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({
          x: c * SPACING,
          y: r * SPACING,
          phase: Math.random() * Math.PI * 2
        });
      }
    }
  }

  function frame(t) {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);

    const t1 = t * 0.0003;

    /* Ambient aurora blobs */
    const ax1 = W * 0.18 + Math.sin(t1) * 80;
    const ay1 = H * 0.12 + Math.cos(t1 * 0.7) * 60;
    const b1 = ctx.createRadialGradient(ax1, ay1, 0, ax1, ay1, 460);
    b1.addColorStop(0, 'rgba(32,230,230,0.10)');
    b1.addColorStop(1, 'transparent');
    ctx.fillStyle = b1;
    ctx.fillRect(0, 0, W, H);

    const ax2 = W * 0.82 + Math.cos(t1 * 0.8) * 70;
    const ay2 = H * 0.82 + Math.sin(t1 * 0.6) * 80;
    const b2 = ctx.createRadialGradient(ax2, ay2, 0, ax2, ay2, 420);
    b2.addColorStop(0, 'rgba(255,64,84,0.06)');
    b2.addColorStop(1, 'transparent');
    ctx.fillStyle = b2;
    ctx.fillRect(0, 0, W, H);

    /* Grid dots with pointer proximity */
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      const ox = d.x + Math.cos(t * 0.0006 + d.phase) * 1.1;
      const oy = d.y + Math.sin(t * 0.0008 + d.phase) * 1.5;
      const dx = ox - mouse.x;
      const dy = oy - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const prox = Math.max(0, 1 - dist / RAD);
      const r = BASE_R + prox * 1.5;
      const a = (0.18 + prox * BOOST) * 0.55;
      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245,239,230,' + a + ')';
      ctx.fill();
    }

    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (!running) {
      running = true;
      rafId = requestAnimationFrame(frame);
    }
  }
  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(size, 120);
  }, { passive: true });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  size();
  frame(0);

  window.VAYLA_BG = { stop, start };
})();
