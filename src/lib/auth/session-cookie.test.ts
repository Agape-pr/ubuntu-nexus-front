import { describe, expect, test } from 'vitest';
import { SESSION_COOKIE, clearSessionMarker, hasSessionMarker, setSessionMarker, syncSessionMarker } from './session-cookie';

const jar = () => {
  const writes: string[] = [];
  return { writes, doc: { set cookie(v: string) { writes.push(v); } } as unknown as { cookie: string } };
};

describe('session marker cookie', () => {
  test('is a credential-free flag that lasts one day', () => {
    const { writes, doc } = jar();
    setSessionMarker(doc, false);
    expect(writes).toHaveLength(1);
    expect(writes[0]).toBe(`${SESSION_COOKIE}=1; path=/; max-age=86400; SameSite=Lax`);
    expect(writes[0]).not.toMatch(/token|eyJ/i);
  });

  test('is Secure on https only', () => {
    const https = jar(); setSessionMarker(https.doc, true);
    const http = jar(); setSessionMarker(http.doc, false);
    expect(https.writes[0].endsWith('; Secure')).toBe(true);
    expect(http.writes[0]).not.toContain('Secure');
  });

  test('sync removes legacy credential cookies and sets the marker when signed in', () => {
    const { writes, doc } = jar();
    syncSessionMarker(true, doc, true);
    expect(writes.some((w) => w.startsWith('access_token=;') && w.includes('1970'))).toBe(true);
    expect(writes.some((w) => w.startsWith('refresh_token=;') && w.includes('1970'))).toBe(true);
    expect(writes.some((w) => w.startsWith(`${SESSION_COOKIE}=1;`))).toBe(true);
  });

  test('sync clears everything when signed out', () => {
    const { writes, doc } = jar();
    syncSessionMarker(false, doc, false);
    expect(writes.some((w) => w.startsWith(`${SESSION_COOKIE}=;`) && w.includes('1970'))).toBe(true);
    expect(writes.some((w) => w.startsWith(`${SESSION_COOKIE}=1`))).toBe(false);
  });

  test('clear expires the marker and the legacy cookies', () => {
    const { writes, doc } = jar();
    clearSessionMarker(doc, false);
    expect(writes).toHaveLength(3);
    expect(writes.every((w) => w.includes('1970'))).toBe(true);
  });

  test('hasSessionMarker finds the marker among other cookies', () => {
    expect(hasSessionMarker(`a=1; ${SESSION_COOKIE}=1; b=2`)).toBe(true);
    expect(hasSessionMarker(`${SESSION_COOKIE}=1`)).toBe(true);
    expect(hasSessionMarker('a=1; b=2')).toBe(false);
    expect(hasSessionMarker(`x${SESSION_COOKIE}=1`)).toBe(false);
    expect(hasSessionMarker('')).toBe(false);
  });
});
