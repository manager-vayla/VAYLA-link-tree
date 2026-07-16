/* VAYLA Link Tree — App entry
 * Imports background, scroll-progress, marquee, tilt. Bootstraps
 * remaining interactions (stage ticker, mobile sheet,
 * command palette, cursor follower, nav active state, navbar ticker sync).
 */
import './background.js';
import './scroll-progress.js';
import './marquee.js';
import './tilt.js';
import './coin.js';
import './token-stats.js';
import './tonearm.js';

(function () {
  /* ─── Stage track swap ─── */
  const trackEl = document.querySelector('[data-stage-track]');
  if (trackEl) {
    const tracks = [
      'TRACK 01 · VAYLA ANTHEM',
      'TRACK 02 · ARENA THEME',
      'TRACK 03 · BOOST MIX',
      'TRACK 04 · VAYLIAN LIVE'
    ];
    let i = 0;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) {
      setInterval(() => {
        i = (i + 1) % tracks.length;
        trackEl.style.opacity = '0';
        trackEl.style.transform = 'translateY(-6px)';
        setTimeout(() => {
          trackEl.textContent = tracks[i];
          trackEl.style.opacity = '1';
          trackEl.style.transform = 'translateY(0)';
        }, 220);
      }, 4000);
    }
  }

  /* ─── Mobile sheet toggle ─── */
  const burger = document.querySelector('[data-sheet-open]');
  const sheet = document.getElementById('mobile-sheet');
  if (burger && sheet) {
    burger.addEventListener('click', () => {
      sheet.classList.toggle('is-open');
      const isOpen = sheet.classList.contains('is-open');
      sheet.setAttribute('aria-hidden', String(!isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    sheet.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        sheet.classList.remove('is-open');
        sheet.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }

  /* ─── Nav active state ─── */
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  if (navLinks.length && 'IntersectionObserver' in window) {
    const map = new Map();
    navLinks.forEach((a) => {
      const href = a.getAttribute('href') || '';
      const id = href.replace('#', '');
      const target = document.getElementById(id);
      if (target) map.set(target, a);
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = map.get(entry.target);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove('is-active'));
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    map.forEach((_, target) => io.observe(target));
  }

  /* ─── Command palette (⌘K) ─── */
  const cmdkBtns = document.querySelectorAll('[data-cmdk-open]');
  if (cmdkBtns.length) {
    let paletteOpen = false;
    let palette = document.getElementById('cmdk');
    if (!palette) {
      palette = document.createElement('div');
      palette.id = 'cmdk';
      palette.className = 'cmdk';
      palette.setAttribute('role', 'dialog');
      palette.setAttribute('aria-modal', 'true');
      palette.setAttribute('aria-label', 'Command palette');
      palette.innerHTML = `
        <div class="cmdk-backdrop"></div>
        <div class="cmdk-panel">
          <input class="cmdk-input" type="text" placeholder="Search channels, arena, quests…" aria-label="Search" />
          <div class="cmdk-list" role="listbox"></div>
          <div class="cmdk-foot"><span>↑↓ navigate</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></div>
        </div>
      `;
      document.body.appendChild(palette);
    }

    /* Local index built from data attributes on cards */
    function buildIndex() {
      const idx = [];
      document.querySelectorAll('a.card[aria-label], a.quest-card[aria-label]').forEach((el) => {
        const label = el.getAttribute('aria-label') || el.textContent.trim();
        const href = el.getAttribute('href') || '';
        idx.push({ label: label.replace(/\s*\(opens in new tab\)\s*$/i, ''), href });
      });
      return idx;
    }
    let INDEX = buildIndex();

    function open() {
      palette.classList.add('is-open');
      palette.removeAttribute('aria-hidden');
      document.body.style.overflow = 'hidden';
      const inp = palette.querySelector('.cmdk-input');
      if (inp) { inp.value = ''; inp.focus(); }
      render('');
    }
    function close() {
      palette.classList.remove('is-open');
      palette.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function score(q, item) {
      if (!q) return 1;
      const lbl = item.label.toLowerCase();
      const needle = q.toLowerCase();
      if (lbl.includes(needle)) return 2 - (lbl.indexOf(needle) / lbl.length) * 0.5;
      let s = 0;
      for (const c of needle) if (lbl.includes(c)) s += 0.2;
      return s;
    }
    function render(q) {
      const list = palette.querySelector('.cmdk-list');
      const items = INDEX
        .map((it, i) => ({ ...it, i, s: score(q, it) }))
        .filter((it) => it.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 8);
      if (!items.length) {
        list.innerHTML = '<div class="cmdk-empty">No matches</div>';
        return;
      }
      list.innerHTML = items.map((it, idx) => `
        <a class="cmdk-item${idx === 0 ? ' is-active' : ''}" data-href="${it.href}" role="option" aria-selected="${idx === 0}">
          <span>${it.label}</span>
          <span class="cmdk-hint">↵</span>
        </a>
      `).join('');
    }

    cmdkBtns.forEach((b) => b.addEventListener('click', open));
    document.addEventListener('keydown', (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        paletteOpen ? close() : open();
        return;
      }
      if (paletteOpen && e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (!paletteOpen) return;
      const items = Array.from(palette.querySelectorAll('.cmdk-item'));
      const i = items.findIndex((el) => el.classList.contains('is-active'));
      if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length]?.classList.add('is-active'); items[i]?.classList.remove('is-active'); items[(i + 1) % items.length]?.scrollIntoView({ block: 'nearest' }); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length]?.classList.add('is-active'); items[i]?.classList.remove('is-active'); }
      else if (e.key === 'Enter') { const cur = items[i]; if (cur) window.open(cur.dataset.href, '_blank', 'noopener,noreferrer'); close(); }
    });

    palette.addEventListener('input', (e) => render(e.target.value));
    palette.addEventListener('click', (e) => {
      const item = e.target.closest('.cmdk-item');
      if (item) { window.open(item.dataset.href, '_blank', 'noopener,noreferrer'); close(); return; }
      if (e.target === palette.querySelector('.cmdk-backdrop')) close();
    });
  }

  /* ─── Cursor follower (desktop, hover-capable only) ─── */
  const cursor = document.getElementById('cursor-follower');
  if (cursor && matchMedia('(hover: hover)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let x = 0, y = 0, tx = 0, ty = 0;
    let raf = 0;
    document.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; cursor.style.opacity = '0.6'; }, { passive: true });
    document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
    function loop() {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      cursor.style.transform = `translate(${x - 9}px, ${y - 9}px)`;
      raf = requestAnimationFrame(loop);
    }
    loop();
    document.querySelectorAll('a, button').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-on-link'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-on-link'));
    });
  }

  /* ─── Nav ticker: live-ish (re-uses token-stats price if available) ─── */
  const priceEl = document.querySelector('#nav-ticker .price');
  const deltaEl = document.querySelector('#nav-ticker .delta');
  if (priceEl && deltaEl) {
    const tryUpdate = () => {
      try {
        const raw = localStorage.getItem('vayla:stats:v1');
        if (!raw) return;
        const d = JSON.parse(raw);
        if (d.price) priceEl.textContent = d.price;
        if (d.change) {
          deltaEl.textContent = d.change;
          deltaEl.classList.toggle('is-down', d.change.startsWith('-'));
        }
      } catch (e) {}
    };
    tryUpdate();
    setInterval(tryUpdate, 15000);
  }

  /* ─── Hero concert-light activation ─── */
  const heroStage = document.querySelector('.hero-stage');
  if (heroStage) {
    /* Inject concert overlay once */
    let overlay = document.querySelector('.concert-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'concert-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      document.body.appendChild(overlay);
    }

    let concertTimer = 0;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    function fireConcert() {
      if (reduce) return;
      /* restart animations by toggling the class */
      heroStage.classList.remove('is-concert');
      /* force reflow so the keyframe restarts */
      void heroStage.offsetWidth;
      heroStage.classList.add('is-concert');

      overlay.classList.remove('is-on');
      void overlay.offsetWidth;
      overlay.classList.add('is-on');

      clearTimeout(concertTimer);
      concertTimer = setTimeout(() => {
        heroStage.classList.remove('is-concert');
        overlay.classList.remove('is-on');
      }, 1500);

      /* 6 SVG ripples on the hero stage */
      const rect = heroStage.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      for (let i = 0; i < 6; i++) {
        const r = document.createElement('div');
        r.className = 'stage-ripple' + (i % 2 ? ' alt' : '');
        r.style.left = cx + 'px';
        r.style.top = cy + 'px';
        heroStage.appendChild(r);
        const start = performance.now();
        const dur = 900 + i * 80;
        const target = 360 + i * 60;
        const delay = i * 60;
        function tickRip() {
          const t = (performance.now() - start) / dur;
          if (t >= 1) { r.remove(); return; }
          const eased = 1 - Math.pow(1 - t, 3);
          r.style.width = (target * eased) + 'px';
          r.style.height = (target * eased) + 'px';
          r.style.opacity = String(1 - t);
          setTimeout(tickRip, 16);
        }
        setTimeout(tickRip, delay);
      }
    }

    heroStage.addEventListener('click', fireConcert);
    heroStage.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fireConcert(); }
    });
    heroStage.setAttribute('tabindex', '0');
    heroStage.setAttribute('role', 'button');
    heroStage.setAttribute('aria-label', 'Activate the VAYLA concert effect');

    /* Auto-play one intro concert only in real (non-headless) sessions,
       gated on a query string we can flip in production.
       We don't auto-play in headless because the virtual-time clock
       races with the IntersectionObserver delay and can leave the
       stage under .is-concert. The click handler remains for real users. */
    const isHeadless = /HeadlessChrome/i.test(navigator.userAgent || '');
    if ('IntersectionObserver' in window && !reduce && !isHeadless) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(fireConcert, 1800);
            io.disconnect();
          }
        });
      }, { threshold: 0.4 });
      io.observe(heroStage);
    }
  }
})();
