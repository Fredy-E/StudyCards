# Fault Code Study Cards — Offline Prototype

**Experimental concept prototype — idea exploration only.**

Flashcards for automotive fault-code triage drills. Fully offline browser prototype:
`index.html` + `app.js` + `style.css`. No build step, no CDN, no runtime deps, no web storage.

## How to open (file://)

1. Open the folder `study-cards/` in your file manager.
2. Double-click `index.html` — it opens via `file://` in any modern browser.
3. No server, no install, no internet needed. Works with Wi-Fi off.

## Features

- Flip card (click / Enter / Space / `F`)
- Shuffle (`S` button) — preserves set, deterministic when seeded
- Mark known (`K`) / unknown (`U`), session score (Known · Unknown · marked · %)
- Filter by system (Engine / Emissions / Transmission / Brakes / Electrical / All)
- Keyboard accessible: Tab reaches all controls; `←`/`→` navigate; shortcuts listed on page
- Session-only marks — reload resets (nothing persisted by design)

## TDD evidence (node:test, RED → GREEN)

- Tests: `deck.test.js` — 14 tests / 4 suites:
  - deck validation rejects malformed cards (6)
  - shuffle preserves set (3)
  - scoring counts (3)
  - filter by system (2)
- RED (before `app.js` existed): `Cannot find module './app.js'` — 0 pass / 1 fail
- GREEN (after implementation): `node --test deck.test.js` → **14 pass / 0 fail**

## Honest limits

- **Study aid, not diagnostic authority.** Do not use for real vehicle diagnosis or repair.
- **Fictional data only.** All codes (P0901–P0908 style), vehicles (Ferret, Badger, Kestrel…), symptoms, causes, and tests are invented practice examples. Any resemblance to real DTCs is coincidental pattern-style only.
- **No real VINs/plates** anywhere in the deck.
- No persistence, no backend, no updates. Prototype UI only.
