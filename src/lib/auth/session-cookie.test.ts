import test from 'node:test';
import assert from 'node:assert/strict';
import { SESSION_COOKIE, clearSessionMarker, setSessionMarker, syncSessionMarker } from './session-cookie.ts';

const jar = () => {
  const writes: string[] = [];
  return { writes, doc: { set cookie(v: string) { writes.push(v); } } as unknown as { cookie: string } };
};

test('marker is a credential-free flag that lasts one day', () => {
  const { writes, doc } = jar();
  setSessionMarker(doc, false);
  assert.equal(writes.length, 1);
  assert.match(writes[0], new RegExp(`^${SESSION_COOKIE}=1; path=/; max-age=86400; SameSite=Lax$`));
  assert.ok(!/token|eyJ/i.test(writes[0]));
});

test('marker is Secure on https only', () => {
  const a = jar(); setSessionMarker(a.doc, true);
  const b = jar(); setSessionMarker(b.doc, false);
  assert.ok(a.writes[0].endsWith('; Secure'));
  assert.ok(!b.writes[0].includes('Secure'));
});

test('sync removes legacy credential cookies and sets the marker when signed in', () => {
  const { writes, doc } = jar();
  syncSessionMarker(true, doc, true);
  assert.ok(writes.some((w) => w.startsWith('access_token=;') && w.includes('1970')));
  assert.ok(writes.some((w) => w.startsWith('refresh_token=;') && w.includes('1970')));
  assert.ok(writes.some((w) => w.startsWith(`${SESSION_COOKIE}=1;`)));
});

test('sync clears everything when signed out', () => {
  const { writes, doc } = jar();
  syncSessionMarker(false, doc, false);
  assert.ok(writes.some((w) => w.startsWith(`${SESSION_COOKIE}=;`) && w.includes('1970')));
  assert.ok(!writes.some((w) => w.startsWith(`${SESSION_COOKIE}=1`)));
});

test('clear expires the marker and legacy cookies', () => {
  const { writes, doc } = jar();
  clearSessionMarker(doc, false);
  assert.equal(writes.length, 3);
  assert.ok(writes.every((w) => w.includes('1970')));
});

import { hasSessionMarker } from './session-cookie.ts';

test('hasSessionMarker finds the marker among other cookies', () => {
  assert.equal(hasSessionMarker(`a=1; ${SESSION_COOKIE}=1; b=2`), true);
  assert.equal(hasSessionMarker(`${SESSION_COOKIE}=1`), true);
  assert.equal(hasSessionMarker('a=1; b=2'), false);
  assert.equal(hasSessionMarker(`x${SESSION_COOKIE}=1`), false);
  assert.equal(hasSessionMarker(''), false);
});
