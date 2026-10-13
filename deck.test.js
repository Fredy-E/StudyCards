// Fault Code Study Cards — TDD tests (node:test, no deps)
// RED phase: these tests MUST fail until app.js implements the logic.
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const { validateCard, validateDeck, shuffleDeck, scoreSession, filterBySystem, FICTIONAL_DECK } = require('./app.js');

describe('deck validation rejects malformed cards', () => {
  test('valid fictional card passes', () => {
    const card = FICTIONAL_DECK[0];
    assert.equal(validateCard(card), true);
  });

  test('deck validates clean', () => {
    const res = validateDeck(FICTIONAL_DECK);
    assert.equal(res.valid, true);
    assert.equal(res.errors.length, 0);
  });

  test('rejects missing code', () => {
    assert.equal(validateCard({ vehicle: 'x', system: 'Engine', symptom: 's', likelyCause: 'c', nextTest: 't' }), false);
  });

  test('rejects missing system', () => {
    const card = { ...FICTIONAL_DECK[0], system: '' };
    assert.equal(validateCard(card), false);
  });

  test('rejects missing symptom/likelyCause/nextTest', () => {
    assert.equal(validateCard({ ...FICTIONAL_DECK[0], symptom: '' }), false);
    assert.equal(validateCard({ ...FICTIONAL_DECK[0], likelyCause: '' }), false);
    assert.equal(validateCard({ ...FICTIONAL_DECK[0], nextTest: '' }), false);
  });

  test('validateDeck reports errors for malformed deck', () => {
    const bad = [...FICTIONAL_DECK, { code: '', system: 'Engine' }];
    const res = validateDeck(bad);
    assert.equal(res.valid, false);
    assert.ok(res.errors.length >= 1);
  });
});

describe('shuffle preserves set', () => {
  test('same members, same length, new array', () => {
    const before = [...FICTIONAL_DECK];
    const after = shuffleDeck(FICTIONAL_DECK);
    assert.equal(after.length, before.length);
    // same set of codes
    assert.deepEqual(
      after.map((c) => c.code).sort(),
      before.map((c) => c.code).sort()
    );
    assert.notEqual(after, FICTIONAL_DECK); // new reference
  });

  test('does not mutate input', () => {
    const codesBefore = FICTIONAL_DECK.map((c) => c.code).join(',');
    shuffleDeck(FICTIONAL_DECK);
    assert.equal(FICTIONAL_DECK.map((c) => c.code).join(','), codesBefore);
  });

  test('deterministic with injected rand', () => {
    const a = shuffleDeck(FICTIONAL_DECK, () => 0.5);
    const b = shuffleDeck(FICTIONAL_DECK, () => 0.5);
    assert.deepEqual(a.map((c) => c.code), b.map((c) => c.code));
  });
});

describe('scoring counts', () => {
  test('empty session scores zero', () => {
    assert.deepEqual(scoreSession({}), { known: 0, unknown: 0, total: 0, percent: 0 });
  });

  test('counts known/unknown', () => {
    const r = scoreSession({ 'P0901': 'known', 'P0902': 'unknown', 'P0903': 'known' });
    assert.equal(r.known, 2);
    assert.equal(r.unknown, 1);
    assert.equal(r.total, 3);
    assert.equal(r.percent, 67); // Math.round(2/3*100)
  });

  test('100% when all known', () => {
    const r = scoreSession({ A: 'known', B: 'known' });
    assert.equal(r.percent, 100);
  });
});

describe('filter by system', () => {
  test('returns only matching system', () => {
    const out = filterBySystem(FICTIONAL_DECK, 'Engine');
    assert.ok(out.length > 0);
    assert.ok(out.every((c) => c.system === 'Engine'));
  });

  test('"All" returns full deck', () => {
    assert.equal(filterBySystem(FICTIONAL_DECK, 'All').length, FICTIONAL_DECK.length);
  });
});
