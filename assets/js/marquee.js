/* VAYLA Link Tree — Marquee ticker
 * Keeps the kinetic energy of the loop. Hover pauses.
 * Honors prefers-reduced-motion. The VAYLA alt text gets a quick
 * one-shot "decode" effect, settled within 220ms.
 */
(function () {
  'use strict';

  const marquees = document.querySelectorAll('.marquee');
  if (!marquees.length) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    marquees.forEach((m) => {
      const t = m.querySelector('.marquee-track');
      if (t) t.style.animation = 'none';
    });
    return;
  }

  function decodeOnce(el) {
    if (!el) return;
    const original = el.dataset.original || (el.dataset.original = el.textContent);

    /* if reduced motion, just keep the original text */
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = original;
      return;
    }

    const POOL = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789'.split('');
    let frame = 0;
    /* Faster + simpler: 4 frames total, ~70ms. The very last frame
       writes the original text. Last-letter settle is guaranteed. */
    const TOTAL = 4;

    function tick() {
      if (frame >= TOTAL) {
        el.textContent = original;
        return;
      }
      /* reveal at frame f = f / TOTAL * length (rounded up),
         so at f=0 → 0, f=1 → ceil(L/4), f=2 → ceil(L/2),
         f=3 → ceil(3L/4), f=4 →  L (settled).
         Actually with TOTAL=4 we want reveal to *almost* complete
         before settle. Use floor instead of ceil, and reserve one
         frame for full settle. */
      const reveal = Math.floor((frame / TOTAL) * original.length);
      let out = '';
      for (let j = 0; j < original.length; j++) {
        if (j < reveal) out += original[j];
        else out += POOL[Math.floor(Math.random() * POOL.length)];
      }
      el.textContent = out;
      frame++;
      if (frame < TOTAL) requestAnimationFrame(tick);
      else el.textContent = original;
    }
    el.textContent = original; /* start clean */
    requestAnimationFrame(() => { frame = 0; tick(); });
  }

  marquees.forEach((m) => {
    const track = m.querySelector('.marquee-track');
    if (!track) return;

    /* The marquee already reads cleanly on first paint; we keep the
       alt text as-is. The decode effect re-fires ONLY after the
       user has scrolled past the marquee AND it comes back into
       view. This avoids any race with the initial paint
       (notably headless screenshotting). */
    const alts = track.querySelectorAll('.alt');
    alts.forEach((el) => { el.dataset.original = el.textContent; });

    if ('IntersectionObserver' in window) {
      let past = false;          /* has user ever left the marquee? */
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (past) {
              /* re-entry -> fire decode */
              setTimeout(() => alts.forEach((el) => decodeOnce(el)), 200);
              past = false;
            }
          } else {
            past = true;
          }
        });
      }, { threshold: 0.1 });
      io.observe(m);
    }

    /* Hover pause */
    m.addEventListener('mouseenter', () => { track.style.animationPlayState = 'paused'; });
    m.addEventListener('mouseleave', () => { track.style.animationPlayState = 'running'; });
    m.addEventListener('focusin', () => { track.style.animationPlayState = 'paused'; });
    m.addEventListener('focusout', () => { track.style.animationPlayState = 'running'; });
  });
})();
