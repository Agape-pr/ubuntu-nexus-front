import test from 'node:test';
import assert from 'node:assert/strict';
import { isExpiredOrExpiring, tokenExpiresAt } from './token-expiry.ts';

const jwt = (payload: object) =>
  `h.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.s`;

test('reads exp from a JWT', () => {
  assert.equal(tokenExpiresAt(jwt({ exp: 1_700_000_000 })), 1_700_000_000_000);
});

test('unreadable or missing tokens count as expired', () => {
  for (const bad of [null, undefined, '', 'nonsense', 'a.b.c', jwt({ no: 'exp' })]) {
    assert.equal(isExpiredOrExpiring(bad as string), true, String(bad));
  }
});

test('fresh tokens are fine; ones about to expire are not', () => {
  const now = 1_000_000_000_000;
  assert.equal(isExpiredOrExpiring(jwt({ exp: now / 1000 + 600 }), 30_000, now), false);
  assert.equal(isExpiredOrExpiring(jwt({ exp: now / 1000 + 10 }), 30_000, now), true);
  assert.equal(isExpiredOrExpiring(jwt({ exp: now / 1000 - 5 }), 30_000, now), true);
});
