/* VAYLA Link Tree — Tonearm toggle
 * Clicking the tonearm pivots it onto/off the vinyl. The coin's
 * spin animation only runs while the tonearm is "loaded".
 * Clicking the disc itself also toggles the tonearm (in addition
 * to the existing concert-light burst in app.js).
 */
(function () {
  'use strict';
  const heroStage = document.querySelector('.hero-stage');
  const tonearm = document.querySelector('.tonearm');
  const coin = document.querySelector('.hero-stage .stage-coin');
  if (!heroStage || !tonearm || !coin) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    heroStage.classList.add('is-loaded');
    tonearm.style.display = 'none';
    return;
  }

  /* Auto-load on first viewport entry, mirroring the concert intro. */
  heroStage.classList.add('is-loaded');
  tonearm.setAttribute('aria-pressed', 'true');

  function applyState(loaded) {
    heroStage.classList.toggle('is-loaded', loaded);
    tonearm.setAttribute('aria-pressed', String(loaded));
    tonearm.setAttribute('aria-label', loaded ? 'Unload the tonearm' : 'Load the tonearm');
  }

  function toggleTonearm() {
    applyState(!heroStage.classList.contains('is-loaded'));
  }

  tonearm.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleTonearm();
  });

  tonearm.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleTonearm();
    }
  });

  /* Clicking the disc area toggles the tonearm without firing the
     concert burst that's bound to .hero-stage itself. */
  coin.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleTonearm();
  });
})();
