# AG Live — page brief

Source: `https://www.amitgaurmusic.com/` (single static HTML page, no framework)
Local route: `/ag-live`
Captured: 2026-10-13

## Route map

| Source | Local | Owned by |
| --- | --- | --- |
| `https://www.amitgaurmusic.com/` | `/ag-live` | `src/app/ag-live/` + `src/components/sites/ag-live/` |

Out of scope (links kept pointing at the live site, disclosed in the delivery notes):
`/tag`, `/contact`, `/pricing`, `/terms`, `/privacy`, `/refund`, `/shipping`.

## Platform

- Vanilla HTML/CSS/JS, single document, no build step.
- Page-wide scripts: **GSAP 3.12.5 + ScrollTrigger** (reveals, scrub parallax, counters,
  staggered logo entrance), **Lenis 1.1.14** (`duration 1.25`, custom
  `min(1, 1.001 - 2^-10t)` easing, `smooth: true`) for inertial scrolling,
  **Supabase JS v2** for reviews, `fetch` against the PostgREST REST API for shows/calendar.
- No scroll-snapping, no pinned/sticky sections, no carousels that drive layout height.

## Design tokens (`:root`)

| Token | Value |
| --- | --- |
| `--black` | `#080808` (page background) |
| `--surface` | `#0C0C0F` (alternating section fill) |
| `--surface2` | `#111116` (inputs on `#add-review` card) |
| `--gold` | `#B28833` |
| `--gold2` | `#DAB355` |
| `--text` | `#F0EBE0` |
| `--muted` | `#88887A` |
| `--border` | `rgba(178,136,51,0.18)` |
| `--nav-h` | `72px` |

`#ag-calendar` uses its own background `#0d0d0d` (not a token).
Body: `overflow-x: hidden`, `line-height: 1.65`, `font-weight: 300`, `cursor: none`.

Fixed grain overlay: `body::before`, `inset 0`, `z-index 9998`, `opacity .035`,
SVG `feTurbulence fractalNoise baseFrequency .85 numOctaves 4 stitchTiles stitch`,
`background-size 200px 200px`, `pointer-events: none`.

## Typography

- Display: **Cormorant Garamond** — hero title `clamp(76px, 11.5vw, 152px)` / weight 600 /
  `line-height .88` / `letter-spacing -.025em`. Section titles
  `clamp(44px, 6vw, 86px)` / 600 / `.95`. Panel titles `clamp(32px, 3.5vw, 48px)` / 600 / 1.05.
  Stat numbers 52px / 600. Review quotes `clamp(20px, 2.6vw, 30px)` italic.
- UI: **Inter** 300 body, 400/500 for controls. Eyebrows 9.5–10px, `letter-spacing`
  0.18em–0.3em, uppercase. Links 10–10.5px / 0.16em–0.18em.
- Section eyebrow is a flex row with a 36×1px gold rule after the label; `#clients`
  centres it and hides the rule.

## Layout

- `section { padding: 128px 52px }` at ≥961px. Full-bleed dark, no max-width wrapper:
  content spans the viewport minus 52px gutters on each side.
- `#the-act` — `grid-template-columns: 45% 1fr; gap: 88px; align-items: center`.
  Photo is `height: 620px; object-fit: cover; object-position: center top`.
- `#lineups` — active panel is `grid-template-columns: 1fr 1fr; gap: 72px; align-items: start`.
  Tab strip has `border-bottom: 1px solid var(--border)`, `margin: 64px 0 56px`,
  horizontally scrollable with hidden scrollbar.
- `#the-band` — `repeat(3, 1fr); gap: 14px`, four items so the 4th wraps to row 2.
  Images are `height: 340px` (`.short`), hover `scale(1.04)`.
- `#clients` — centred. Logo grid `repeat(5, 1fr); gap: 14px`, cells `min-height: 118px`,
  `border-radius: 10px`, per-cell `--logo-bg` (mostly `#fff`, some `#3a2151`, some unset).
  Press cells are `width: 190px; min-height: 110px`, each with its own `--logo-bg`.
  Reviews carousel `max-width: 680px`. Review form card `max-width: 680px`.
- `#book` — `grid-template-columns: 1fr 1.3fr; gap: 88px; align-items: start`.
  Form shell is a 1px-gap grid where the gap colour is `var(--border)` and each
  `.form-group` is filled with `var(--surface)`.
- `#footer` — centred, `border-top: 1px solid var(--border)`, logo 52px tall.

### Breakpoints

- `max-width: 960px` — gutters drop to 26px, section padding 88px. Nav links + CTA hide,
  hamburger shows. Hero video is removed and replaced by a static
  `background: url(img/amit-hero.jpg) center 20% / cover`. `#the-act`, `#book` and the
  active tab panel collapse to one column. Band grid to one column, images 240px.
  Logo grid to `repeat(2, 1fr)`. Form rows to one column. Scroll indicator and mute
  button hide.
- `max-width: 640px` — review carousel padding 40/34/32, arrows 30px, show rows become
  `60px 1fr` and the type badge hides.
- `max-width: 480px` — hero title `clamp(60px, 20vw, 80px)`, hero actions stack full width.

## Section order

1. `#nav` — fixed 72px, transparent until `scrollY > 60`, then `rgba(8,8,8,.88)` +
  `blur(24px)` + bottom border.
2. `#mobile-nav` — fixed panel under the nav, `display:none` toggled by the hamburger.
3. `#hero` — `100svh` (`min-height: 580px`), flex aligned to the bottom,
   `padding: 0 52px 88px`. Video `object-fit: cover; object-position: center 20%` under two
   gradients: a 160° bottom gradient and a 160px top gradient. Title is two
   `overflow:hidden` lines whose words start at `translateY(110%)`.
4. `#ticker` — gold bar, `padding: 13px 0`, items duplicated so the 30s
   `translateX(0 → -50%)` loop is seamless.
5. `#the-act` — photo + copy, 2×2 stats grid with 1px gold gaps, genre pills.
6. `#lineups` — heading, 4 tabs, one panel each with title/desc/ideal-for + members list.
7. `#upcoming` — live show list, `max-width: 860px`, grouped by month label.
8. `#ag-calendar` — month calendar, `max-width: 540px`, prev/next buttons + touch swipe.
9. `#the-band` — 4 images, 3-column grid.
10. `#clients` — centred heading, 13 logo cells, 10 press cells, reviews carousel,
    review CTA row, review form.
11. `#book` — contact stack + inquiry form.
12. `#footer` — gold logo, two nav rows (primary + legal), rule, copyright.
13. `#toast` — fixed bottom-centre, shown when `?thankyou=1`, fades after 5.5s.

## Interactions (trigger → result)

| Trigger | Result |
| --- | --- |
| `window.scrollY > 60` | `#nav` gains `.scrolled` |
| Page load | Hero eyebrow → title words (stagger 0.14) → subtitle → actions → scroll hint |
| Scroll into view at `top 88%` | `.reveal-inner` translates `102% → 0%` (1.05s, `power3.out`) |
| Scroll into view once | Stat numbers count `0 → target` over 1.9s, `power2.out` |
| Scroll | `.act-photo-wrap img` and `.band-img-wrap img` parallax `yPercent -7`, scrubbed |
| Scroll into view at `top 88%` | `.logo-cell` fade/rise in, stagger 0.05 |
| Click a lineup tab | Swap `.active` on the button and the matching `#panel-*` |
| Hover a link/button/tab/logo cell | `body.cursor-hover` → cursor ring 36px → 56px + gold tint |
| Pointer move | 5px gold dot follows exactly; 36px ring lerps at 0.1 |
| Click mute button | Toggle `video.muted`, swap SVG icon, update `aria-pressed`/`aria-label` |
| Click carousel arrow / dot | Move to slide (0.6s opacity + 18px slide), reset 5s autoplay |
| Hover or touch the carousel | Autoplay pauses; resumes on mouse leave |
| Reviews load | 7 approved rows appended as slides after the hard-coded one, dots rebuilt |
| Submit review | Insert row, reset form, `rf-status` shows approval message |
| Click calendar prev/next | Change month, refetch, re-render; left/right swipe ≥50px too |
| Click hamburger (<960px) | Toggle `#mobile-nav`; every item closes it except `/tag` |
| `?thankyou=1` | Show `#toast`, fade at 5.5s, remove at 6.2s |

## Assets

All copied verbatim to `public/sites/ag-live/` — same filenames, same folder layout.

| Local path | Bytes | Notes |
| --- | --- | --- |
| `img/ag-live-logo.png` | 1,060,347 | Nav logo, displayed at 38px tall |
| `img/amit-hero.jpg` | 1,242,145 | Hero poster, act photo, mobile hero background |
| `img/ag-logo-gold.png` | 1,167,205 | Footer logo, 52px tall |
| `img/band-stage-solo.jpg` | 224,434 | Band grid 1 |
| `img/band-casual-bw.jpg` | 5,620,249 | Band grid 2 |
| `img/band-pastel-suits.jpg` | 44,183 | Band grid 3 |
| `img/band-conrad-nye.jpg` | 585,478 | Band grid 4 |
| `logos/*.jpeg` | 13 files | 4 KB – 139 KB, per-cell `--logo-bg` kept |
| `press/*.jpg,png` | 10 files | Each links to its real article |
| `video/ag-live-hero.mp4` | 11,344,370 | Hero background video, `autoplay muted loop playsinline` |

Fonts are loaded from Google Fonts with the exact source query:
`Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600`
and `Inter:wght@200;300;400;500`.

## Data

The shows list, availability calendar and reviews all read the same public Supabase
project (`vqaxatmtomngjffilgtc`) over PostgREST with the site's public anon key,
which ships in the page source.

- `amitgaur_reviews?select=name,review&approved=eq.true&order=created_at.desc&limit=20`
  → 7 rows as of capture.
- `bookings?…&artist=ilike.*AMIT GAUR*&status=neq.cancelled` → **0 rows** for the
  next three months, so the live site currently renders
  "No upcoming shows listed — check back soon." and an all-available calendar.

## Known gaps carried into the clone

- Outbound form actions (`formsubmit.co` for bookings, Supabase `insert` for reviews)
  are not replayed against the live owner's endpoints. Both forms validate and
  complete locally with the same success feedback instead.