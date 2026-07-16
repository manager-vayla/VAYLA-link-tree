/* VAYLA Link Tree — 3D Stage / VAYLA Token Coin
 * ------------------------------------------------------------------
 *  Layer 1  Three.js — central metallic coin (cylinder rim + disc caps
 *           + glow ring), counter-rotating halo disc, 4 corner stage
 *           spotlights.
 *  Layer 2  2D overlay canvas — pulse waveform ring around the coin
 *           that breathes on a beat, click-burst beams, glow halo.
 *
 *  Click on the overlay triggers a synchronized flip on both layers.
 *  Honors prefers-reduced-motion with a static 2D fallback.
 *  Pauses when scrolled offscreen or tab hidden.
 */
(function () {
  'use strict';

  const container = document.getElementById('divider3d');
  if (!container) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Static fallback ───────────────────────────────────────────── */
  if (reduce) {
    container.insertAdjacentHTML('beforeend', `
      <div class="beam-top"></div>
      <div class="beam-bottom"></div>
      <div class="coin-static" aria-hidden="true">
        <img src="assets/images/logo.jpg" alt="VAYLA token" />
      </div>
    `);
    return;
  }

  /* ── Build two canvases: webgl (bottom) + 2d (overlay) ─────────── */
  const glCanvas = document.createElement('canvas');
  glCanvas.id = 'd3d-canvas';
  glCanvas.setAttribute('aria-hidden', 'true');
  glCanvas.style.zIndex = '2';
  container.appendChild(glCanvas);

  const ovCanvas = document.createElement('canvas');
  ovCanvas.id = 'd3d-overlay';
  ovCanvas.setAttribute('aria-hidden', 'true');
  ovCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3;';
  container.appendChild(ovCanvas);

  /* Inline V-mark SVG used for fallbacks */
  const V_SVG = `<img src="assets/images/logo.jpg" alt="VAYLA token" />`;

  /* simple WebGL check */
  const probe = glCanvas.getContext('webgl2') || glCanvas.getContext('webgl');
  if (!probe) {
    /* No WebGL — keep static-only */
    container.insertAdjacentHTML('beforeend', `
      <div class="coin-static" aria-hidden="true">${V_SVG}</div>
    `);
    return;
  }

  /* Shared state used by both layers */
  let flipState = null;       /* {t0, dur, fromY, toY} or null */
  let burstState = { t0: -1e9 }; /* click time, used by both layers */
  let visible = true;

  /* Click handler — fires flip + burst on both layers */
  function triggerFlip() {
    burstState = { t0: performance.now() };
    container.classList.add('glow-active');
    setTimeout(() => container.classList.remove('glow-active'), 1300);

    /* signal 3D layer */
    container.dispatchEvent(new CustomEvent('vayla:flip'));
  }
  ovCanvas.style.pointerEvents = 'auto';
  ovCanvas.style.cursor = 'grab';
  ovCanvas.addEventListener('pointerdown', (event) => {
    event.stopPropagation();
    triggerFlip();
  });
  container.addEventListener('touchstart', (event) => {
    if (event.target === container || event.target === ovCanvas) triggerFlip();
  }, { passive: true });

  /* Intersection-driven pause */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { visible = entry.isIntersecting; });
    }, { threshold: 0.05 });
    io.observe(container);
  }
  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
  });

  /* ═══════════════════════════════════════════════════════════════════
     THREE.JS — COIN
     ═══════════════════════════════════════════════════════════════════ */
  (async function init3D() {
    let THREE;
    try { THREE = await import('three'); }
    catch (e) {
      /* CDN failure — fallback image */
      container.insertAdjacentHTML('beforeend', `
        <div class="coin-static" aria-hidden="true">${V_SVG}</div>
      `);
      return;
    }
    buildScene(THREE);
  })();
  /* redundant fallbacks reference the same image */
  if (!('VAYLA_V_SVG_REF' in window)) window.VAYLA_V_SVG_REF = V_SVG;

  function buildScene(THREE) {
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    let DW = 0, DH = 0;
    function size() {
      DW = container.clientWidth;
      DH = container.clientHeight;
      renderer.setSize(DW, DH, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    }

    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0.2, 7.5);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0x303050, 0.7));
    const key = new THREE.DirectionalLight(0xffeedd, 0.9); key.position.set(3, 4, 5); scene.add(key);
    const fill = new THREE.DirectionalLight(0x20E6E6, 0.3); fill.position.set(-3, 1, -4); scene.add(fill);

    const cornerDefs = [
      { color: 0x20E6E6, pos: [-3.5,  2.5, 4.0], intensity: 2.5 },
      { color: 0xFF4054, pos: [ 3.5,  2.5, 4.0], intensity: 2.0 },
      { color: 0x52BCB9, pos: [-3.5, -2.5, 4.0], intensity: 2.2 },
      { color: 0x21FFF4, pos: [ 3.5, -2.5, 4.0], intensity: 2.8 }
    ];
    const cornerLights = cornerDefs.map((cfg) => {
      const l = new THREE.PointLight(cfg.color, cfg.intensity, 8);
      l.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      scene.add(l);
      return l;
    });

    /* Coin */
    const coinGroup = new THREE.Group();
    scene.add(coinGroup);
    const COIN_R = 0.95, COIN_H = 0.18, SEGS = 96;

    const edgeMat = new THREE.MeshStandardMaterial({
      color: 0x1a6e6e, metalness: 0.92, roughness: 0.14,
      emissive: 0x0a2f2f, emissiveIntensity: 0.6
    });
    const capMatF = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const capMatB = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const edgeGeo = new THREE.CylinderGeometry(COIN_R, COIN_R, COIN_H, SEGS, 1, true);
    const rim = new THREE.Mesh(edgeGeo, edgeMat); rim.rotation.x = Math.PI * 0.5; coinGroup.add(rim);

    const faceGeo = new THREE.CircleGeometry(COIN_R, SEGS);
    const frontFace = new THREE.Mesh(faceGeo, capMatF); frontFace.position.z = COIN_H / 2; coinGroup.add(frontFace);
    const backFace = new THREE.Mesh(faceGeo.clone(), capMatB); backFace.position.z = -COIN_H / 2; backFace.rotation.y = Math.PI; coinGroup.add(backFace);

    /* Logo textures */
    const texLoader = new THREE.TextureLoader();
    texLoader.load(
      'assets/images/logo.jpg',
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        const back = tex.clone(); back.needsUpdate = true; back.center.set(0.5, 0.5);
        capMatF.map = tex; capMatB.map = back; capMatF.needsUpdate = true; capMatB.needsUpdate = true;
      },
      undefined,
      () => { capMatF.color.set(0x20E6E6); capMatB.color.set(0x20E6E6); capMatF.needsUpdate = true; capMatB.needsUpdate = true; }
    );

    const ringGeo = new THREE.TorusGeometry(COIN_R + 0.02, 0.04, 20, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x20E6E6, metalness: 0.95, roughness: 0.06,
      emissive: 0x20E6E6, emissiveIntensity: 0.7
    });
    const edgeRing = new THREE.Mesh(ringGeo, ringMat);
    coinGroup.add(edgeRing);

    /* Halo disc */
    const haloCanvas = document.createElement('canvas');
    haloCanvas.width = 512; haloCanvas.height = 512;
    const hctx = haloCanvas.getContext('2d');
    hctx.translate(256, 256);
    hctx.fillStyle = 'rgba(32,230,230,0.10)'; hctx.fillRect(-256, -256, 512, 512);
    hctx.font = '600 26px "Geist Mono", monospace';
    hctx.fillStyle = 'rgba(32,230,230,0.85)'; hctx.textAlign = 'center'; hctx.textBaseline = 'middle';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      hctx.save(); hctx.translate(Math.cos(a) * 200, Math.sin(a) * 200); hctx.rotate(a);
      hctx.fillText('VAYLA', 0, 0); hctx.restore();
    }
    const haloTex = new THREE.CanvasTexture(haloCanvas);
    haloTex.colorSpace = THREE.SRGBColorSpace;
    const haloMat = new THREE.MeshBasicMaterial({ map: haloTex, transparent: true, opacity: 0.32, depthWrite: false });
    const halo = new THREE.Mesh(new THREE.CircleGeometry(COIN_R + 0.25, 96), haloMat);
    halo.position.z = -0.4;
    scene.add(halo);

    /* ── Click handler (3D layer) ── */
    container.addEventListener('vayla:flip', () => {
      if (flipState) return;
      flipState = {
        t0: performance.now(), dur: 900,
        fromY: coinGroup.rotation.y % (Math.PI * 2),
        toY: (coinGroup.rotation.y % (Math.PI * 2)) + Math.PI
      };
    });

    const easeOutBack = (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

    /* ── Animation loop ── */
    let nPhase = 0;
    let raf = 0;
    function tick(t) {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      DW = container.clientWidth; DH = container.clientHeight;
      renderer.setSize(DW, DH, false);
      camera.aspect = DW / Math.max(DH, 1);
      camera.updateProjectionMatrix();

      const sr = container.getBoundingClientRect();
      const cy = sr.top + sr.height / 2;
      const vh = window.innerHeight / 2;
      const dist = Math.abs(cy - vh);
      const snap = Math.max(0, Math.min((vh * 0.75 - dist) / (vh * 0.75), 1));
      const tt = t * 0.001;
      const beat = Math.sin(tt * 2.2) * 0.5 + 0.5;
      /* Burst factor (decays after click) */
      const sinceClick = (t - burstState.t0) / 1000;
      const burst = sinceClick < 0 ? 0 : Math.max(0, 1 - sinceClick / 1.4);

      nPhase += 0.00025;
      const rx = Math.sin(tt * 0.23 + nPhase * 1.7) * 0.06 + Math.sin(tt * 0.41 + 2.1) * 0.04;
      const rz = Math.cos(tt * 0.29 + nPhase * 1.3) * 0.1 + Math.sin(tt * 0.53 + 3.7) * 0.06;
      const targetScale = flipState ? 1 + Math.sin(Math.min((t - flipState.t0) / flipState.dur, 1) * Math.PI) * 0.28 + burst * 0.05 : 1 + snap * 0.08 + beat * 0.03;

      if (flipState) {
        const pr = Math.min((t - flipState.t0) / flipState.dur, 1);
        coinGroup.rotation.y = flipState.fromY + (flipState.toY - flipState.fromY) * easeOutBack(pr);
        coinGroup.scale.setScalar(targetScale);
        ringMat.emissiveIntensity = 0.7 + Math.sin(pr * Math.PI) * 0.8 + burst * 1.4;
        if (pr >= 1) { coinGroup.rotation.y = flipState.toY; flipState = null; }
      } else {
        coinGroup.rotation.y += 0.015 + snap * 0.03 + Math.sin(tt * 0.17 + nPhase) * 0.008;
        coinGroup.rotation.x += (rx - coinGroup.rotation.x) * 0.06;
        coinGroup.rotation.z += (rz - coinGroup.rotation.z) * 0.06;
        coinGroup.scale.setScalar(targetScale);
      }

      if (!flipState) {
        edgeMat.emissiveIntensity = 0.6 + snap * 0.3 + beat * 0.12 + burst * 1.0;
        ringMat.emissiveIntensity = 0.7 + snap * 0.25 + beat * 0.18 + burst * 1.2;
      }

      halo.rotation.z -= 0.0025;
      halo.material.opacity = 0.18 + snap * 0.18;

      for (let i = 0; i < cornerLights.length; i++) {
        cornerLights[i].intensity = cornerDefs[i].intensity * (0.6 + snap * 0.4 + Math.sin(tt * 1.5 + i * 1.2 + beat) * 0.15 + burst * 1.5);
      }
      renderer.render(scene, camera);
    }
    new ResizeObserver(size).observe(container);
    size();
    tick(0);
    /* pause when offscreen */
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          visible = entry.isIntersecting;
          if (visible && !raf) tick(performance.now());
        });
      }, { threshold: 0.05 });
      io.observe(container);
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { if (raf) cancelAnimationFrame(raf); raf = 0; }
      else if (!raf && visible) tick(performance.now());
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     2D OVERLAY — Waveform ring + concert beams + click burst
     ═══════════════════════════════════════════════════════════════════ */
  const ovCtx = ovCanvas.getContext('2d');
  const BARS = 64;
  const barPhase = new Array(BARS);
  for (let i = 0; i < BARS; i++) barPhase[i] = Math.random() * Math.PI * 2;

  let DW2 = 0, DH2 = 0;
  function resize2() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    DW2 = container.clientWidth;
    DH2 = container.clientHeight;
    ovCanvas.width = Math.floor(DW2 * dpr);
    ovCanvas.height = Math.floor(DH2 * dpr);
    ovCanvas.style.width = DW2 + 'px';
    ovCanvas.style.height = DH2 + 'px';
    ovCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize2();
  new ResizeObserver(resize2).observe(container);

  function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }

  function drawWave(t) {
    const cx = DW2 / 2;
    const cy = DH2 / 2;
    const tt = t * 0.001;
    const beat = Math.sin(tt * 2.2) * 0.5 + 0.5;
    const sinceClick = (t - burstState.t0) / 1000;
    const burst = sinceClick < 0 ? 0 : Math.max(0, 1 - sinceClick / 1.4);

    /* Coin visual radius in CSS px.
       Roughly maps to mesh COIN_R=0.95 at camera distance 7.5 → tan(0.5) ≈ 0.55, * 7.5 ≈ 4px per unit → ~3.8px isn't right;
       We just use a fraction of min(W,H). */
    const rInner = Math.min(DW2, DH2) * 0.16;
    const rOuter = Math.min(DW2, DH2) * 0.22;

    /* Concentric soft halo (always on, brighter on click) */
    const halo = ovCtx.createRadialGradient(cx, cy, rInner * 0.5, cx, cy, rOuter * 1.6);
    halo.addColorStop(0, `rgba(32, 230, 230, ${0.04 + burst * 0.18})`);
    halo.addColorStop(0.6, `rgba(32, 230, 230, ${0.02 + burst * 0.06})`);
    halo.addColorStop(1, 'rgba(32, 230, 230, 0)');
    ovCtx.fillStyle = halo;
    ovCtx.fillRect(0, 0, DW2, DH2);

    /* Music wave — 64 radial bars */
    for (let i = 0; i < BARS; i++) {
      const angle = (i / BARS) * Math.PI * 2 - Math.PI / 2;
      const sample = (
        Math.sin(tt * 2.6 + barPhase[i]) * 0.5 +
        Math.sin(tt * 4.8 + barPhase[i] * 1.7) * 0.3 +
        Math.sin(tt * 1.7 + barPhase[i] * 0.6) * 0.2
      ) * 0.5 + 0.5;
      const amp = 6 + sample * (16 + beat * 18 + burst * 50);
      ovCtx.lineWidth = 2 + burst * 1.5;
      ovCtx.lineCap = 'round';
      ovCtx.strokeStyle = (i % 6 === 0)
        ? `rgba(255, 64, 84, ${0.7 + beat * 0.3})`
        : `rgba(32, 230, 230, ${0.7 + beat * 0.3})`;
      const x1 = cx + Math.cos(angle) * rOuter;
      const y1 = cy + Math.sin(angle) * rOuter;
      const x2 = cx + Math.cos(angle) * (rOuter + amp);
      const y2 = cy + Math.sin(angle) * (rOuter + amp);
      ovCtx.beginPath();
      ovCtx.moveTo(x1, y1);
      ovCtx.lineTo(x2, y2);
      ovCtx.stroke();
    }

    /* Inner ring outline (faint, beat-modulated) */
    ovCtx.lineWidth = 1.2 + beat * 0.5 + burst * 1.5;
    ovCtx.strokeStyle = `rgba(32, 230, 230, ${0.18 + beat * 0.18 + burst * 0.6})`;
    ovCtx.beginPath();
    ovCtx.arc(cx, cy, rOuter + 4, 0, Math.PI * 2);
    ovCtx.stroke();

    /* Click burst: expanding ring + radial beams + glow */
    if (burst > 0.02) {
      const expand = easeOutCubic(burst);
      const rBurst = rInner + (rOuter * 1.5 - rInner) * expand * 2;

      /* Expanding rings (3 concentric) */
      for (let k = 0; k < 3; k++) {
        const rk = rBurst + k * 20;
        ovCtx.lineWidth = (2.5 - k * 0.6) * burst;
        ovCtx.strokeStyle = k % 2
          ? `rgba(255, 64, 84, ${burst * 0.7})`
          : `rgba(32, 230, 230, ${burst * 0.7})`;
        ovCtx.beginPath();
        ovCtx.arc(cx, cy, rk, 0, Math.PI * 2);
        ovCtx.stroke();
      }

      /* Radial beams */
      const beamCount = 12;
      for (let i = 0; i < beamCount; i++) {
        const a = (i / beamCount) * Math.PI * 2;
        const len = Math.min(DW2, DH2) * 0.55 * expand;
        ovCtx.lineWidth = 1.5 * burst;
        ovCtx.strokeStyle = i % 2
          ? `rgba(255, 64, 84, ${burst * 0.75})`
          : `rgba(32, 230, 230, ${burst * 0.85})`;
        ovCtx.beginPath();
        ovCtx.moveTo(cx + Math.cos(a) * rOuter, cy + Math.sin(a) * rOuter);
        ovCtx.lineTo(cx + Math.cos(a) * (rOuter + len), cy + Math.sin(a) * (rOuter + len));
        ovCtx.stroke();
      }

      /* Glow ring on coin border */
      ovCtx.lineWidth = 3 * burst;
      ovCtx.strokeStyle = `rgba(255, 255, 255, ${burst * 0.4})`;
      ovCtx.beginPath();
      ovCtx.arc(cx, cy, rInner, 0, Math.PI * 2);
      ovCtx.stroke();
    }
  }

  /* 2D rAF loop */
  let raf2 = 0;
  let visible2 = true;
  function tick2(t) {
    raf2 = requestAnimationFrame(tick2);
    if (!visible2) return;
    ovCtx.clearRect(0, 0, DW2, DH2);
    drawWave(t);
  }
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        visible2 = entry.isIntersecting;
        if (visible2 && !raf2) tick2(performance.now());
      });
    }, { threshold: 0.05 });
    io.observe(container);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (raf2) cancelAnimationFrame(raf2); raf2 = 0; }
    else if (!raf2 && visible2) tick2(performance.now());
  });
  tick2(performance.now());
})();
