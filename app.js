// Experimental concept prototype — idea exploration only.
// Fault Code Study Cards — offline prototype logic + UI (no deps, no storage, no network).
// Fictional study deck: invented codes/vehicles for triage practice only. NOT diagnostic authority.
'use strict';

const FICTIONAL_DECK = [
  { code: 'P0901', vehicle: 'Fictional 2019 Ferret Hatchback 1.0L', system: 'Engine', symptom: 'Rough idle + hesitation off the line', likelyCause: 'Fictionalstudy: dirty airflow path (practice example)', nextTest: 'Visual intake check + compare idle vs 2500 rpm behavior (study drill)' },
  { code: 'P0902', vehicle: 'Fictional 2017 Badger Wagon 1.6L', system: 'Emissions', symptom: 'Strong fuel smell after hot soak', likelyCause: 'Fictionalstudy: evap hose split (practice example)', nextTest: 'Smoke-trace drill on paper diagram; list 3 hose points' },
  { code: 'P0903', vehicle: 'Fictional 2020 Kestrel Sedan 2.0L', system: 'Transmission', symptom: 'Late harsh 2-3 shift when cold', likelyCause: 'Fictionalstudy: low fluid / sticky solenoid (practice example)', nextTest: 'Check fictional fluid chart; name the solenoid test order' },
  { code: 'P0904', vehicle: 'Fictional 2018 Otter Pickup 2.4L', system: 'Brakes', symptom: 'ABS light + long pedal after bumps', likelyCause: 'Fictionalstudy: wheel-speed signal dropout (practice example)', nextTest: 'Wiggle-test drill: list connector points to inspect' },
  { code: 'P0905', vehicle: 'Fictional 2016 Wren Coupe 1.4L', system: 'Electrical', symptom: 'Slow crank, dim lights on cold mornings', likelyCause: 'Fictionalstudy: weak battery / corroded ground (practice example)', nextTest: 'Voltage-drop drill: state meter points in order' },
  { code: 'P0906', vehicle: 'Fictional 2021 Mole Van 2.2L', system: 'Engine', symptom: 'Stall at idle with A/C on', likelyCause: 'Fictionalstudy: idle-air Learn offset (practice example)', nextTest: 'Idle-relearn drill: recite steps from memory' },
  { code: 'P0907', vehicle: 'Fictional 2019 Lark SUV 1.8L', system: 'Emissions', symptom: 'Surging at cruise + faint sulfur smell', likelyCause: 'Fictionalstudy: oxygen feedback fault (practice example)', nextTest: 'Graph-drill: sketch expected sensor wave vs flat' },
  { code: 'P0908', vehicle: 'Fictional 2022 Newt Roadster 1.2L', system: 'Electrical', symptom: 'Random no-start, dash flicker over bumps', likelyCause: 'Fictionalstudy: loose harness ground (practice example)', nextTest: 'Tap-test drill: list ground points on diagram' },
];

const REQUIRED_FIELDS = ['code', 'vehicle', 'system', 'symptom', 'likelyCause', 'nextTest'];

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function validateCard(card) {
  if (!card || typeof card !== 'object') return false;
  for (const f of REQUIRED_FIELDS) {
    if (!isNonEmptyString(card[f])) return false;
  }
  return true;
}

function validateDeck(deck) {
  const errors = [];
  if (!Array.isArray(deck) || deck.length === 0) {
    return { valid: false, errors: ['deck must be a non-empty array'] };
  }
  deck.forEach((c, i) => {
    if (!validateCard(c)) errors.push(`card ${i}: missing/invalid field`);
  });
  return { valid: errors.length === 0, errors };
}

// Fisher-Yates, non-mutating, injectable rand for deterministic tests.
function shuffleDeck(deck, rand = Math.random) {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function scoreSession(marks) {
  let known = 0;
  let unknown = 0;
  for (const v of Object.values(marks || {})) {
    if (v === 'known') known++;
    else if (v === 'unknown') unknown++;
  }
  const total = known + unknown;
  return { known, unknown, total, percent: total === 0 ? 0 : Math.round((known / total) * 100) };
}

function filterBySystem(deck, system) {
  if (!system || system === 'All') return [...deck];
  return deck.filter((c) => c.system === system);
}

// ---- Browser UI (guarded: no-op under Node) ----
function mountApp(root) {
  const els = {
    card: root.querySelector('#card'),
    frontCode: root.querySelector('#front-code'),
    frontVehicle: root.querySelector('#front-vehicle'),
    frontSystem: root.querySelector('#front-system'),
    frontSymptom: root.querySelector('#front-symptom'),
    backCause: root.querySelector('#back-cause'),
    backTest: root.querySelector('#back-test'),
    backCode: root.querySelector('#back-code'),
    counter: root.querySelector('#counter'),
    score: root.querySelector('#score'),
    filter: root.querySelector('#filter'),
    status: root.querySelector('#status'),
  };

  let order = [...FICTIONAL_DECK];
  let idx = 0;
  let flipped = false;
  let marks = {}; // code -> 'known' | 'unknown' (session only, never persisted)

  function currentList() { return order; }

  function render() {
    const list = currentList();
    if (list.length === 0) {
      els.frontCode.textContent = 'No cards';
      els.frontSymptom.textContent = 'Pick another system filter.';
      els.counter.textContent = '0 / 0';
      return;
    }
    if (idx < 0) idx = 0;
    if (idx >= list.length) idx = list.length - 1;
    const c = list[idx];
    els.frontCode.textContent = c.code + ' (FICTIONAL)';
    els.frontVehicle.textContent = c.vehicle;
    els.frontSystem.textContent = c.system;
    els.frontSymptom.textContent = 'Symptom: ' + c.symptom;
    els.backCode.textContent = c.code + ' (FICTIONAL)';
    els.backCause.textContent = 'Likely cause: ' + c.likelyCause;
    els.backTest.textContent = 'Next test: ' + c.nextTest;
    els.card.classList.toggle('flipped', flipped);
    els.card.setAttribute('aria-label', flipped ? `Back of ${c.code}. Press F to flip back.` : `Front of ${c.code}. Press F to flip.`);
    els.counter.textContent = `${idx + 1} / ${list.length}`;
    const s = scoreSession(marks);
    els.score.textContent = `Known ${s.known} · Unknown ${s.unknown} · ${s.total} marked · ${s.percent}%`;
    const m = marks[c.code];
    els.status.textContent = m ? `Marked: ${m}` : 'Unmarked';
  }

  function flip() { flipped = !flipped; render(); }
  function next() { flipped = false; if (idx < currentList().length - 1) idx++; render(); }
  function prev() { flipped = false; if (idx > 0) idx--; render(); }
  function shuffle() { order = shuffleDeck(filterBySystem(FICTIONAL_DECK, els.filter.value)); idx = 0; flipped = false; render(); }
  function applyFilter() { order = filterBySystem(FICTIONAL_DECK, els.filter.value); idx = 0; flipped = false; render(); }
  function mark(v) {
    const list = currentList();
    if (!list.length) return;
    marks[list[idx].code] = v;
    render();
  }
  function reset() { marks = {}; idx = 0; flipped = false; render(); }

  root.querySelector('#btn-flip').addEventListener('click', flip);
  root.querySelector('#btn-next').addEventListener('click', next);
  root.querySelector('#btn-prev').addEventListener('click', prev);
  root.querySelector('#btn-shuffle').addEventListener('click', shuffle);
  root.querySelector('#btn-known').addEventListener('click', () => mark('known'));
  root.querySelector('#btn-unknown').addEventListener('click', () => mark('unknown'));
  root.querySelector('#btn-reset').addEventListener('click', reset);
  els.filter.addEventListener('change', applyFilter);
  els.card.addEventListener('click', flip);
  els.card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
  });

  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input,select,textarea')) return;
    const k = e.key.toLowerCase();
    if (k === 'f') flip();
    else if (k === 'arrowright') next();
    else if (k === 'arrowleft') prev();
    else if (k === 's') shuffle();
    else if (k === 'k') mark('known');
    else if (k === 'u') mark('unknown');
  });

  // Populate filter options from deck systems
  const systems = ['All', ...new Set(FICTIONAL_DECK.map((c) => c.system))];
  els.filter.innerHTML = systems.map((s) => `<option value="${s}">${s}</option>`).join('');

  render();
  return { render, flip, next, prev, shuffle, mark, reset };
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => mountApp(document));
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FICTIONAL_DECK, validateCard, validateDeck, shuffleDeck, scoreSession, filterBySystem, mountApp };
}
