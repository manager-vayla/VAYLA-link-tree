/* VAYLA Link Tree — Scroll Progress Indicator
 * Uses requestAnimationFrame throttling (no raw window.scroll event handler
 * re-renders). Hidden entirely under prefers-reduced-motion.
 */
(function () {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prog = document.querySelector('#progress > i');
  if (!prog || reduce) {
    const wrap = document.getElementById('progress');
    if (wrap) wrap.style.display = 'none';
    return;
  }

  let ticking = false;

  function update() {
    const s = document.documentElement.scrollTop || document.body.scrollTop;
    const m = (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight;
    prog.style.height = (m > 0 ? (s / m) * 100 : 0) + '%';
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });

  update();
})();
