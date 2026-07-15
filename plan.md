# VAYLA Link Tree — Comprehensive Upgrade Plan

> **Status:** Planning document. Every section is actionable and ordered.
> **Scope:** Rebuild the visual + interaction layer of the VAYLA link tree (`index.html` + supporting assets) to a "K-Arena meets Web3" production-grade landing experience that uses the taste-skill principles, dynamic UI components (animate-ui, uilayouts, uiverse, theatre.js for orchestrated motion), and 60fps-feeling motion — while staying within the **single-file static deploy** constraint of GitHub Pages.

---

## 0. Design Read (taste-skill §0)

> *"Reading this as: single-page Web3 / K-POP ecosystem hub for the VAYLA community, with a **dark concert-stage / cyberpunk** language, leaning toward **animate-ui primitives + uilayouts bento + custom Three.js + Theatre.js choreographed motion**."*

**Audience:** Existing Vaylian community, K-POP-curious crypto users, B2B partners (LinkedIn), quest hunters. Mixed: fans want energy, business wants polish.

**Brand constraints (non-negotiable):**
- Dark mode only — `--bg: #050606` is canon. No light-mode sections.
- Cyan `#20E6E6` + Red `#FF4054` dual-accent concert lighting.
- Geist + Geist Mono typography (already loaded).
- 3D VAYLA token coin stays as the visual signature.
- Keep the page a *link hub*, not a marketing site — density stays low, all action is in the cards.

**Three Dials (taste-skill §1):**
- `DESIGN_VARIANCE: 8` (asymmetric bento, oversized numerals, split-grid hero)
- `MOTION_INTENSITY: 8` (Theatre.js timeline + GSAP ScrollTrigger + Framer Motion + animate-ui primitives)
- `VISUAL_DENSITY: 4` (K-Arena, not cockpit)

---

## 1. High-Level Architecture

### 1.1 Stack (kept zero-build, augmented via CDN)
- **HTML/CSS/JS** in single `index.html` (no bundler).
- **CSS:** Tailwind v3.4 via Play CDN (`<script src="https://cdn.tailwindcss.com">`) — utility-first, but our brand tokens stay in `:root` as CSS variables that Tailwind aliases via `theme.extend.colors`. Rationale: lets us adopt uilayouts/uiverse snippets that depend on Tailwind classes without rewriting.
- **JS libraries (CDN, importmap):**
  - `three@0.160.0` (already used) — 3D coin.
  - `motion@11` (Framer Motion core) — entry stagger, hover physics, layout transitions.
  - `gsap@3.12` + `ScrollTrigger` — scroll-driven reveals on the 3D divider & bento cells.
  - `theatre@0.7` — choreograph hero + coin + marquee as one timeline.
  - `lenis@1.1` — buttery smooth scroll (replaces native `scroll-behavior`).
  - `animejs@3.2` — light micro-interactions on chips / arrows.
- **Fonts:** Keep Geist + Geist Mono. Add one variable display cut: `"Geist", "Geist Mono"` weights 300–900. No new font (serif ban per taste-skill §4.1 — premium consumer rule does not apply but keeping a unified mono+sans pair is on-brief).

### 1.2 File layout
```
VAYLA-link-tree/
├── index.html                 # rebuilt single-file app (style + script inline)
├── DESIGN.md                  # this file
├── plan.md                    # this document (planning only)
├── assets/
│   ├── css/                   # optional extracted styles (kept inline for now)
│   ├── js/
│   │   ├── theatre-projection.js   # pre-baked Theatre.js state
│   │   ├── coin.js                 # extracted Three.js coin module
│   │   ├── background.js           # dot grid + grain + aurora
│   │   └── interactions.js         # motion + gsap wiring
│   └── lib/                   # vendored copies of uiverse / animate-ui snippets we borrow
├── logo.jpg
├── (EN)_VAYLA_WHITEPAPER_v3.8.pdf
└── images/
    ├── vayla_logo_icon_new.jpg
    ├── vayla_avatar_glitch.webp     # NEW: animated avatar alt
    ├── arena_card_visual.webp       # NEW: Arena card visual
    ├── whitepaper_visual.webp       # NEW
    ├── coingecko_visual.webp        # NEW
    ├── cmc_visual.webp              # NEW
    ├── zealy_visual.webp            # NEW
    ├── social_x.webp                # NEW
    ├── social_tg.webp               # NEW
    ├── social_dc.webp               # NEW
    ├── social_li.webp               # NEW
    └── 3D/coin-preview.html
```

> **Asset note (taste-skill §4.8):** Every card visual must be a real, purpose-built image. The current "favicon-in-a-box" approach (`google.com/s2/favicons?domain=…`) is a banned "div-based fake asset." Generate 9 card-specific 800×800 dark-themed visuals (cyan/red rim glow, faint grid) and ship them as `webp`.

### 1.3 z-index scale (locked)
```
z: 1000  skip link, modals
z:  500  nav (sticky)
z:  400  command palette, tooltips
z:  300  page-level overlays (vignette, grain, cursor follower)
z:  200  scroll progress bar
z:  100  Three.js coin section glow
z:   50  marquee
z:   10  page content
z:    0  dot-grid canvas background
```

---

## 2. Page Structure (section-by-section redesign)

The current page is `hero → marquee → ecosystem (6 cards) → 3D coin → community (4 cards) → footer`. We keep the same narrative arc but add 3 new sections to round it out as a real ecosystem hub, and rework every section with the new motion + visual system.

### 2.1 Section map
| # | Section | Layout family | Purpose |
|---|---|---|---|
| 1 | **Sticky Top Nav** | horizontal pill, 1 line, 64–72px | Anchor links + Live token ticker + command-K |
| 2 | **Hero** | split asymmetric (7/5) — text left, animated coin + ticker right | Identity, single CTA "Enter the Arena" |
| 3 | **Marquee** | kept as single marquee (taste-skill §5: max 1/page) | Channel energy |
| 4 | **Live Token Stats Strip** | 4-column mono data row | Price, mcap, holders, 24h vol (CoinGecko public API) |
| 5 | **Ecosystem Bento** | 3-col + 1 tall feature cell (asymmetric) | 6 cards reshaped into a bento, 1 hero "Arena" tile |
| 6 | **3D Stage Divider** | unchanged height, Theatre.js choreographed | Coin becomes the "track title" of the show |
| 7 | **Live Quests & Drops** | horizontal scroll-snap cards (uilayouts pattern) | Pulled from Zealy (mock if API not accessible) |
| 8 | **Community** | 4-col cards, magnetic hover | X / TG / DC / LinkedIn |
| 9 | **Whitepaper / Lore** | split text-left, scroll-driven 3D-pages visual right | Pull readers into the PDF |
| 10 | **Footer** | mega-footer with status pill, social, sitemap | Standardised, mono |

> **Eyebrow discipline (taste-skill §4.7):** Of these 10 sections, at most 3 may carry an eyebrow label. We will put eyebrows on Hero, Bento, and Whitepaper only. The rest rely on the section's position on the page.

---

## 3. Component Upgrades (concrete)

### 3.1 Nav (NEW)
- Sticky pill (`position: fixed; top: 1rem; left: 50%; translateX(-50%);`), 64px tall, `backdrop-filter: blur(14px) saturate(140%)`, `border: 1px solid var(--line-strong)`, `border-radius: 999px`.
- Contents (single line at desktop):
  `[logo]  Ecosystem  Arena  Quests  Whitepaper  Community   |   $0.0042 +3.1%   [⌘K]`
- Mobile: collapses to `[logo]  [⌘K]  [≡]` → opens a slide-in sheet.
- **Active link indicator:** 1px animated underline that uses `layoutId="nav-underline"` in Framer Motion (taste-skill §5.D).
- **⌘K command palette:** opens a centered modal with fuzzy search across all cards. Implement with `motion + AnimatePresence`. Backdrop blur 24px. Escape closes. Up/Down arrow + Enter to select. Indexes: `{ title, sub, href, chip }[]`.

### 3.2 Hero (REBUILD)
**Layout:** split 7/5 (text left, "stage" right). At `lg:`. Mobile collapses to stacked.

**Left column (text):**
- Eyebrow: `OFFICIAL · K-ARENA · WEB3` (mono, 11px, tracking 0.22em, cyan).
- Headline: `VAYLA` in Geist 800, `clamp(3.5rem, 9vw, 7rem)`, `line-height: 0.9`, `letter-spacing: -0.05em`, gradient text `linear-gradient(135deg, #F0F0EC 0%, #F0F0EC 35%, #20E6E6 75%, #FF4054 100%)`. Use `background-clip: text; color: transparent`.
- Sub: `Music meets Web3.` (Geist Mono 0.95rem, dim, max-width 48ch). One sentence only — *no fake-precise numbers, no AI fluff.*
- CTAs: 2 buttons, side by side.
  - Primary `Enter the Arena →` (solid cyan background, ink text, 6px radius, `scale(0.97)` on active, spring on hover).
  - Secondary `Read Whitepaper` (ghost with 1px cyan border, fill slides up on hover).

**Right column ("stage"):**
- A 480×480 card, `border-radius: 24px`, with the VAYLA coin centered + 4 stage-rig spotlights painted as radial gradients (one cyan, one red, two teal) at the corners.
- Above the coin: a live "now playing" card (`transform: translateY(-12px)`), `backdrop-filter: blur(20px)`, showing **a faux track ticker** (rotates every 4s through "TRACK 01 · VAYLA ANTHEM", "TRACK 02 · ARENA THEME", "TRACK 03 · BOOST MIX"). Animate the swap with AnimatePresence + Y-slide.
- Below the coin: a chip `LIVE · K-ARENA S02` with a pulsing dot (animate-ui `pulse` pattern, CSS keyframes).
- On hover: coin's edge ring flares 1.4×; corner spotlights breathe harder. Implemented with Theatre.js timeline (`object.coin.glare` + `object.stage.breath`).

**Entry animation:** Theatrical curtain. Headline letters stagger in (`opacity 0→1`, `translateY 24px→0`, stagger 30ms). Sub + CTAs follow at 120ms intervals. Right column fades + scales 0.96→1 at 200ms. Total: ~700ms, easing `cubic-bezier(0.16, 1, 0.3, 1)`.

**Live token stats row** (BENTO cell below hero, full-width): 4 columns, mono, `font-variant-numeric: tabular-nums`.
- `$0.0042  +3.14%  24h`
- `MCAP  $4.18M`
- `HOLDERS  12,847`
- `VOL 24H  $284K`
Data fetched from CoinGecko free API at load, cached in `localStorage` for 60s. If fetch fails, show a `<!-- mock -->` block labeled with `(OFFLINE)` chip. Taste-skill §4.9: no fake-precise numbers without labeling.

### 3.3 Marquee (KEEP, UPGRADE)
- Same band, but:
  - Add a hand-rolled **kinetic typography** effect on the "alt" words: each `VAYLA` instance has a one-time "decoding" animation (`text-shadow` flicker, letter scramble via anime.js, 800ms, `once`).
  - Hover pauses the marquee (CSS `animation-play-state: paused`).
  - Add `aria-label="Featured channels"` and `prefers-reduced-motion: reduce` already kills it — verify.
- Keep this as the *only* marquee on the page.

### 3.4 Ecosystem Bento (REBUILD from 3-col grid → asymmetric bento)
**Grid (desktop):**
```
┌──────────────────┬────────────┬────────────┐
│  ARENA (hero)    │ Website    │ Whitepaper │
│  2x2             │  1x1       │  1x1       │
│                  ├────────────┼────────────┤
│                  │ CoinGecko  │    CMC     │
│                  │  1x1       │  1x1       │
├────────┬─────────┴────────────┴────────────┤
│ Zealy  │   "Get quests, drop rewards"      │
│ 1x1    │   1x1 (text only, mono)          │
└────────┴──────────────────────────────────┘
```
- 12-col grid, `gap: 1px` with a dark background to create hairline compartment lines (taste-skill brutalist §5).
- "ARENA" hero cell: a real Arena product mockup (use the existing `vayla_logo_icon_new.jpg` cropped + a 4-button grid `PLAY · BOOST · CLAIM · TRACK` rendered as pill buttons in a 2x2 inside the cell). This is the bento-background-diversity rule (taste-skill §4.7): at least 2 cells have real visual variation.
- "Whitepaper" cell: a PDF mockup (animate-ui `Cover` or hand-rolled div with header bar + page lines + the whitepaper title in mono). Hover plays a "page flip" micro-animation.
- All cards use **3D tilt on hover** (Framer Motion `useMotionValue`/`useTransform` mapped to rotateX/rotateY ±6°). Glow border lights up on the leading edge based on pointer position.
- Cards have a **magnetic CTA arrow** that follows the pointer at 0.25 strength (animate-ui magnetic button pattern, Motion-based — *not* useState).

### 3.5 3D Stage Divider (UPGRADE)
- Height unchanged: 240px desktop, 150px mobile.
- Coin geometry: keep `CylinderGeometry` rim + `CircleGeometry` faces + `TorusGeometry` glow ring.
- **New:** add a 2nd element behind the coin: a slowly rotating thin disc with the VAYLA wordmark repeated radially (TextGeometry if we want a font, or a circular SVG baked into a texture for performance). It floats at `z = -0.4` and rotates the opposite direction at 0.3× speed. Acts as a halo.
- **Theatre.js:** a `coinSequence` sheet that interpolates:
  - `glare` 0→1 on click (900ms `easeOutBack`),
  - `breath` 0.5↔1.0 looped over 5s,
  - `stage.bass` driven by `window.AudioContext` analyser if user consents (optional; off by default — taste-skill §5: "motion must be motivated").
- **Click ripple:** clicking the coin spawns 6 cyan ring-svg particles that expand and fade (anime.js + `<svg>` with `circle` + stroke-dasharray). takt below `pointer-events: none`.
- **Reduced motion:** canvas hides, ribbon content stays, but we render a static 2D logo image instead (no WebGL at all).

### 3.6 Live Quests & Drops (NEW)
- Horizontal scroll-snap row, 4 cards visible at `lg:`, 1.4 at `md:`, 1.1 at `sm:`.
- Each card: a 16:9 cover, eyebrow `QUEST · K-ARENA S02`, title, reward chip (e.g. `+500 $VAYLA`), CTA `Start →`.
- Implementation: pull from Zealy API if available; otherwise ship 4 **mocked-but-labeled** quests (taste-skill §4.9 requires explicit `<!-- mock -->` + a `(DEMO)` chip).
- Snap behavior: `scroll-snap-type: x mandatory; scroll-snap-align: start; overflow-x: auto;` + `-webkit-overflow-scrolling: touch`.
- Edge fade mask (`mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent)`) — same trick we already use on the marquee.

### 3.7 Community (UPGRADE existing 4-col)
- 4-col grid, each card uses a **magnetic hover** (Framer Motion `useMotionValue`).
- On hover: the card lifts 6px, the chip's dot pulses faster, an inline brand-colored glow replaces the cyan glow (TG = `#29a8e0`, DC = `#5865f2`, LI = `#38bdf8`, X = `#F0F0EC`).
- Add a small `aria-label` on each: `Join VAYLA on Telegram (opens in new tab)`.
- Add a `Last activity` mono line: `2m ago · 1.2k online` for TG / DC, `4 posts this week` for X. Pulled from public RSS or hardcoded `(DEMO)` (taste-skill §4.9).

### 3.8 Whitepaper / Lore (NEW)
- Split layout: left = scroll-pinned copy, right = animated 3D page-flip mockup.
- Left text: 3 short paragraphs that reveal as the user scrolls. Each paragraph is `position: sticky; top: 30vh` and cross-fades into the next via GSAP ScrollTrigger `scrub: true`.
- Right: a 3D plane (single `THREE.PlaneGeometry`) showing a mock whitepaper cover (rendered to a canvas texture, three.js `CanvasTexture`). On scroll, the plane rotates from 0° → 360° and the texture crossfades through 4 pages.
- CTA at the end: `Read the full whitepaper (PDF, 38 pages)` opens in new tab.

### 3.9 Footer (UPGRADE)
- 4 columns at desktop, stack at mobile:
  1. Brand block: logo, 1-line tagline, social icons (Phosphor Bold 1.5px stroke).
  2. Sitemap (5 links).
  3. Resources (whitepaper, brand kit, GitHub, status page).
  4. Subscribe: a single email input with inline submit (`status: idle | loading | success | error`).
- Top row: `© 2026 VAYLA · Built for the Vaylian community · Created by Pham Thanh Binh`.
- Bottom row: status pill `● ALL SYSTEMS OPERATIONAL` (cyan, pulse).

---

## 4. Motion System (end-to-end)

### 4.1 Theatre.js sheet tree
```
sheet("vayla-root")
├── "hero"  {headline.chars.y, headline.chars.o, sub.y, sub.o, cta1.y, cta1.o, cta2.y, cta2.o, stage.scale, stage.o}
├── "coin"  {coin.glare, coin.breath, coin.haloAngle, stage.bass}
├── "bento" {cell1.x, cell1.y, cell1.o, cell1.rz, ...}        // per-cell reveals
├── "quests" {card1.x, card1.o, ...}                            // per-card
├── "scroll" {progress, parallaxY}                              // driven by ScrollTrigger
└── "ambient" {marquee.speed, dotGrid.brightness, grain.alpha}  // subtle persistent
```
Boot: 1.5s after first paint. Use Theatre's `studio.initialize()` only in dev — in prod, run the **pre-baked projection** (`assets/js/theatre-projection.js`) generated from studio. No editor in production.

### 4.2 Scroll-driven reveals
- Use **GSAP ScrollTrigger** (allowed; `window.scroll` is banned — ScrollTrigger is the official alternative per taste-skill §5.D).
- `pin: true` on the 3D coin and the Whitepaper / Lore right column.
- All entrance animations triggered via `IntersectionObserver` (taste-skill §5.D): `threshold: 0.15`, `rootMargin: "0px 0px -10% 0px"`. On enter, run the appropriate Theatre.js sequence with `position: 0`.

### 4.3 Hover physics
- Cards: `useMotionValue` for x/y/rotateX/rotateY; `useTransform` for sheen position. No useState. No `window.mousemove` on a React tree.
- Marquee items: pure CSS `:hover` pause.
- Magnetic CTA: pointer-driven, springs `{stiffness: 200, damping: 18}`.

### 4.4 Reduced motion (mandatory, taste-skill §6.B)
- Single check: `useReducedMotion()` from `motion/react` + CSS `@media (prefers-reduced-motion: reduce)`.
- Collapse: all Theatre timelines to static frames; all GSAP scrubbings to instant; all marquee/coin halos to static; three.js canvas replaced with a static 2D logo image.
- 3D coin section height stays 240px but becomes a static poster.

### 4.5 Smooth scroll
- Replace native `scroll-behavior: smooth` with **Lenis** (1.1KB) for buttery interpolation. Honor `prefers-reduced-motion`.

---

## 5. Background & Atmosphere (rewrite)

### 5.1 Replace dot grid with a **layered aurora**
- Layer 0 (z 0): a single full-viewport `<canvas>` rendering:
  - 2 large soft radial blobs (cyan, red) drifting via `cos/sin` time.
  - A fine grid of 1px dots, 48px spacing, opacity 0.12, reacting to pointer proximity (keep current behavior).
  - An extremely subtle horizontal "scanline" that travels top→bottom every 8s (opacity 0.04, single `1px` tall `linear-gradient`).
- Layer 1 (z 1): grain (kept, `opacity: 0.05`, `mix-blend-mode: overlay`).
- Layer 2 (z 1): vignette (kept).
- Layer 3 (z 300): a custom cursor follower — a 16px cyan ring that follows the pointer with 120ms easing (animate-ui `cursor-follow`). Hide on touch devices.

### 5.2 Per-section "spotlight" overlays
- Each bento cell has its own **conic gradient** masked to its border-radius, slowly rotating (1 turn per 60s), tinted to the cell's accent. Adds depth without noise.
- Stage divider keeps its current beam + corner spotlights.

### 5.3 Color tokens (extended)
Add to `:root`:
```
--bg-elev:    #0A1414;    /* raised surfaces, footer */
--bg-card:    #0F1818;    /* bento cells */
--glow-cyan:  rgba(32, 230, 230, 0.45);
--glow-red:   rgba(255, 64, 84, 0.40);
--glow-teal:  rgba(82, 188, 185, 0.35);
--sh-hover:   0 1px 0 rgba(255,255,255,0.10) inset, 0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px var(--line-accent);
```
Lock the palette: cyan + red are the **only** glow sources. No purple, no AI-lila (taste-skill §4.2).

---

## 6. Dynamic Components — Borrowed Patterns (with attribution)

We will *borrow the visual pattern* (not the React source) from the libraries the user mentioned, then hand-implement the markup in our single-file context.

| Source | What we borrow | How we ship it |
|---|---|---|
| **animate-ui** (imskyleen) | Magnetic button, scroll-reveal cards, marquee, ticker | Re-implement as CSS + Motion in `interactions.js`. Attribution: `<!-- pattern inspired by animate-ui (imskyleen) -->` |
| **uilayouts** (ui-layouts) | Bento grid, scroll-snap, sticky stack | Re-implement as CSS Grid + GSAP. Attribution in code comment. |
| **uiverse** (uiverse-io) | Chip variants, button states, glow card | Hand-roll equivalent with our tokens (the originals use light tokens; we need dark). |
| **theatre.js** (theatre-js) | Choreography graph for hero + coin | Use the actual library. We pre-bake the projection to keep the bundle lean. |

**Honesty rule (taste-skill §2.B):** every snippet we copy is annotated. No source is wrapped in mystery.

---

## 7. Accessibility Upgrades

- **Skip link:** already present, keep.
- **Focus rings:** all cards & CTAs get a 2px cyan ring with 3px offset on `:focus-visible`. The current 2px magenta (which is aliased to cyan) stays.
- **Motion:** see §4.4.
- **Color contrast audit (WCAG AA):**
  - `--ink #F0F0EC` on `--bg #050606` = 18.5:1 ✓
  - `--ink-dim #D5D5D2` on `--bg #050606` = 15.2:1 ✓
  - `--ink-mute #A0A0A0` on `--bg #050606` = 8.6:1 ✓
  - `#20E6E6` on `#050606` = 13.1:1 ✓
  - `#FF4054` on `#050606` = 5.4:1 ✓ (use only for ≥18px or bold)
  - White-on-cyan CTA: ink `#050606` text on `#20E6E6` = 13.1:1 ✓
- **Keyboard nav:** `Tab` cycles through cards in DOM order. `⌘K` opens command palette. `Esc` closes. `Arrow Up/Down` navigates palette.
- **Screen reader:** every card has a clear `aria-label`: `VAYLA Arena — Play & Earn (opens in new tab)`.
- **Reduced transparency:** glass surfaces provide a solid-fill fallback via `@media (prefers-reduced-transparency)`.

---

## 8. Performance Plan

- **LCP target < 2.0s** (currently ~1.0s; adding libs could push it).
  - Preload `logo.jpg` and one hero card visual.
  - `fetchpriority="high"` on the hero image.
  - `theatre-projection.js` deferred; loaded only after first paint.
- **INP < 150ms**: all motion uses `transform`/`opacity` only. `will-change` only on the coin, hero card, and any currently-animating element.
- **CLS < 0.05**: reserve explicit `aspect-ratio` on every card visual, the 3D canvas, and the command palette.
- **Three.js:** render at `Math.min(devicePixelRatio, 1.75)`. Pause on `visibilitychange`. Skip frames when coin is offscreen (IntersectionObserver).
- **Bundle strategy:** all libs from CDN with SRI hashes. We do not bundle. Total extra JS ≈ 220KB gzipped (motion 35, gsap 60, lenis 5, theatre-projection 30, three 130). Reasonable for the upgrade.
- **Asset strategy:** convert all new card visuals to `.webp`, 800×800, ≤ 60KB each. Lazy-load everything below the fold (`loading="lazy"`).
- **Fonts:** keep Google Fonts but add `font-display: swap`. Drop Geist weights 900 and 300 (we don't use them).

---

## 9. SEO & Metadata Upgrades

- **JSON-LD:** expand Organization → `Organization` + `WebSite` + `BreadcrumbList` + `FAQPage` (with 4 mock FAQs about VAYLA — `<!-- mock -->`-labeled).
- **Open Graph image:** ship a 1200×630 dynamic OG image (a static 1.4MB jpg is fine; the current is `logo.jpg` which is 300×300 — too small for OG).
- **Twitter card:** keep `summary_large_image` but with the new OG image.
- **Canonical:** keep.
- **Robots:** `index, follow, max-image-preview: large`.

---

## 10. Implementation Phasing (deliverable order)

| Phase | Deliverable | Acceptance criteria |
|---|---|---|
| **P0 — Foundation** | New `assets/js` skeleton, CDN libs, Theatre.js projection, Lenis, color tokens | Page loads in < 2.0s, no console errors, all libs resolve |
| **P1 — Hero + Nav** | New nav with ⌘K, split hero, live stats row | Hero fits in `100dvh` on desktop, no scroll-to-CTA, headline ≤ 2 lines, sub ≤ 20 words, eyebrows count = 1 |
| **P2 — Bento** | Asymmetric ecosystem bento with 3D-tilt cards, magnetic CTAs | Each cell has explicit `aspect-ratio`, all 6 cards keyboard-reachable, mobile collapses to 1-col |
| **P3 — Coin** | Theatre.js-choreographed coin, halo, click ripple | Click triggers ripple + glare, reduced-motion falls back to static image, `<=820px` canvas still 30+ FPS |
| **P4 — Quests** | Horizontal scroll-snap with 4 mock-labeled quest cards | Scroll-snap works on touch, edges fade, ⌘K indexes them |
| **P5 — Community + Whitepaper** | 4-col community with magnetic hover, split whitepaper with 3D page-flip | Last-activity chips labeled `(DEMO)` if mocked; whitepaper right column pins properly |
| **P6 — Footer + ⌘K** | Mega-footer with subscribe input, command palette polish | Subscribe shows all 4 states; palette has full keyboard support |
| **P7 — A11y + Perf** | Audit pass | Lighthouse: Perf ≥ 95, A11y = 100, Best Practices ≥ 95, SEO = 100 |
| **P8 — Polish** | Cursor follower, final timings, OG image | All hover states have spring physics; grain stays ≤ 0.05 opacity |

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| CDN libs blocked in some regions | Page breaks | Add SRI hashes + a local fallback (`assets/lib/`) committed to the repo for the 4 critical libs |
| Theatre.js bundle size | +30KB gz | Use pre-baked projection in prod, not the studio |
| Three.js on low-end mobile | Janky coin | Pixel ratio cap, frame skip on slow devices, fallback to static image below `≤ 600px` |
| Animated images ignored by some browsers | Visual loss | All visuals have a static poster; the 3D section has a 2D fallback |
| Lenis interferes with `position: sticky` | Layout bugs | Disable Lenis when `prefers-reduced-motion: reduce`; test every sticky element |
| AI-tells creeping back into copy | Brand damage | Run the taste-skill §4.9 copy self-audit on every string before merge |

---

## 12. Pre-Flight Checklist (gating ship)

- [ ] No `Inter` font; no `Fraunces` / `Instrument Serif`; no serif default.
- [ ] No `#000000` or `#ffffff` anywhere.
- [ ] No more than 1 marquee on the page.
- [ ] No more than 1 eyebrow per 3 sections (eyebrow count = 3 / 10 sections).
- [ ] No two CTAs with the same intent (we have one "Enter the Arena" + one "Read Whitepaper" + one "Read more" in the whitepaper section — verify the third is clearly different).
- [ ] Hero fits in `100dvh` at desktop, 2 lines headline max, sub ≤ 20 words.
- [ ] Every card has a real image, not a div fake.
- [ ] Every CTA passes WCAG AA contrast.
- [ ] `prefers-reduced-motion: reduce` collapses every animation to a sensible static state.
- [ ] Lighthouse Perf ≥ 95, A11y = 100.
- [ ] No `window.addEventListener("scroll", …)`.
- [ ] No `useState` for continuous pointer/scroll values.
- [ ] All z-index values are from the documented scale in §1.3.
- [ ] All copy audited for AI fluff (`Elevate`, `Seamless`, `Unleash`, `Next-Gen`, `Game-changer`, `Delve`).
- [ ] No em-dashes in display headlines (taste-skill §9.G, sourced from the rest of the skill docs).
- [ ] All external library attributions in code comments.

---

## 13. Source-of-Truth Documents

- This `plan.md` — the upgrade blueprint.
- `DESIGN.md` — the canonical design system (tokens, components, ASCII). This plan only adds or supersedes; tokens remain the source of truth.
- `README.md` — the public-facing one-pager; update live URL + add a "What's new in 2026.1" note pointing to this plan.

---

**End of plan.md** — implementation begins with Phase P0.
