import { describe, expect, test } from 'vitest';
import { isExpiredOrExpiring, tokenExpiresAt } from './token-expiry';

const jwt = (payload: object) => `h.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.s`;

describe('token expiry', () => {
  test('reads exp from a JWT', () => {
    expect(tokenExpiresAt(jwt({ exp: 1_700_000_000 }))).toBe(1_700_000_000_000);
  });

  test.each([null, undefined, '', 'nonsense', 'a.b.c', jwt({ no: 'exp' })])(
    'unreadable or missing token %j counts as expired',
    (bad) => {
      expect(isExpiredOrExpiring(bad as string)).toBe(true);
    },
  );

  test('fresh tokens are fine; ones about to expire are not', () => {
    const now = 1_000_000_000_000;
    expect(isExpiredOrExpiring(jwt({ exp: now / 1000 + 600 }), 30_000, now)).toBe(false);
    expect(isExpiredOrExpiring(jwt({ exp: now / 1000 + 10 }), 30_000, now)).toBe(true);
    expect(isExpiredOrExpiring(jwt({ exp: now / 1000 - 5 }), 30_000, now)).toBe(true);
  });
});
