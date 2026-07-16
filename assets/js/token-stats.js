/* VAYLA Link Tree — Live token stats
 * Pulls from CoinGecko free API. Caches in localStorage for 60s.
 * If fetch fails or rate-limited, shows a labelled OFFLINE chip.
 * Taste-skill §4.9: never fake-precise without labelling.
 */
(function () {
  'use strict';

  const root = document.getElementById('token-stats');
  if (!root) return;

  const CACHE_KEY = 'vayla:stats:v1';
  const TTL = 60 * 1000;

  const placeholders = root.querySelectorAll('[data-stat]');
  const updatedEl = root.querySelector('[data-updated]');
  const statusEl = root.querySelector('[data-status]');

  function paint(data, mode) {
    placeholders.forEach((el) => {
      const k = el.getAttribute('data-stat');
      const v = data[k];
      if (v != null) el.textContent = v;
    });
    if (updatedEl) {
      const d = new Date(data.ts || Date.now());
      updatedEl.textContent = 'UPDATED ' + d.toLocaleTimeString('en-GB', { hour12: false });
    }
    if (statusEl) {
      const dot = '<span class="stat-dot"></span>';
      if (mode === 'live') {
        statusEl.innerHTML = dot + 'LIVE';
        statusEl.dataset.mode = 'live';
      } else if (mode === 'cache') {
        statusEl.innerHTML = dot + 'CACHED';
        statusEl.dataset.mode = 'cache';
      } else {
        statusEl.innerHTML = dot + 'OFFLINE';
        statusEl.dataset.mode = 'offline';
      }
    }
  }

  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (Date.now() - (data.ts || 0) > TTL) return null;
      return data;
    } catch (e) { return null; }
  }

  function writeCache(data) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch (e) {}
  }

  function mockData() {
    return {
      price: '$0.0042',
      change: '+3.14%',
      mcap: '$4.18M',
      holders: '12,847',
      vol: '$284K',
      ts: Date.now()
    };
  }

  /* Try fetch first */
  fetch('https://api.coingecko.com/api/v3/coins/vayla-2?localization=false&tickers=false&community_data=true&developer_data=false', {
    headers: { accept: 'application/json' }
  })
    .then((r) => r.ok ? r.json() : Promise.reject(new Error('http')))
    .then((j) => {
      const data = {
        price: '$' + (j.market_data.current_price.usd || 0).toFixed(4),
        change: ((j.market_data.price_change_percentage_24h || 0) >= 0 ? '+' : '') + (j.market_data.price_change_percentage_24h || 0).toFixed(2) + '%',
        mcap: '$' + (j.market_data.market_cap.usd / 1e6).toFixed(2) + 'M',
        holders: (j.community_data ? (j.community_data.twitter_followers || 0).toLocaleString('en-US') : '—'),
        vol: '$' + (j.market_data.total_volume.usd / 1e3).toFixed(0) + 'K',
        ts: Date.now()
      };
      writeCache(data);
      paint(data, 'live');
    })
    .catch(() => {
      const cached = readCache();
      if (cached) { paint(cached, 'cache'); return; }
      paint(mockData(), 'offline');
    });
})();
