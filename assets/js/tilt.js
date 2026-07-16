/* VAYLA Link Tree — Card 3D tilt (vanilla, no library)
 * Pointer-driven rotateX/rotateY in CSS variables. All motion reads
 * pointer position with rAF batching — never useState, never raw
 * window.scroll. Honors prefers-reduced-motion.
 *
 * Pattern inspired by animate-ui (imskyleen) tilt cards, re-implemented
 * for a no-build static page.
 */
(function () {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const supportsHover = matchMedia('(hover: hover)').matches;

  const TILT_MAX = 5;            /* degrees */
  const SHEEN_OPACITY = 0.18;
  const RESET_DURATION = 600;    /* ms */

  function attach(card) {
    let rect = card.getBoundingClientRect();
    let rafPending = false;
    let pointerX = 0, pointerY = 0;
    let active = false;

    function measure() {
      rect = card.getBoundingClientRect();
    }

    function setVars(px, py) {
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (px - cx) / (rect.width / 2);
      const dy = (py - cy) / (rect.height / 2);
      const rx = (-dy * TILT_MAX).toFixed(2);
      const ry = (dx * TILT_MAX).toFixed(2);
      card.style.setProperty('--tilt-rx', rx + 'deg');
      card.style.setProperty('--tilt-ry', ry + 'deg');
      const sxPct = ((dx + 1) / 2) * 100;
      const syPct = ((dy + 1) / 2) * 100;
      card.style.setProperty('--sheen-x', sxPct + '%');
      card.style.setProperty('--sheen-y', syPct + '%');
    }

    function clearVars() {
      card.style.removeProperty('--tilt-rx');
      card.style.removeProperty('--tilt-ry');
    }

    function schedule() {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        if (active) setVars(pointerX, pointerY);
        rafPending = false;
      });
    }

    card.addEventListener('pointerenter', () => {
      measure();
      active = true;
    });
    card.addEventListener('pointermove', (e) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      schedule();
    }, { passive: true });
    card.addEventListener('pointerleave', () => {
      active = false;
      clearVars();
    });
    card.addEventListener('pointercancel', () => {
      active = false;
      clearVars();
    });
  }

  const cards = document.querySelectorAll('.card[data-tilt]');
  if (!cards.length || reduce || !supportsHover) return;

  cards.forEach(attach);
})();
