import test from 'node:test';
import assert from 'node:assert/strict';
import { safeRedirectPath } from './redirect.ts';

test('accepts plain on-site paths, with query and hash', () => {
  assert.equal(safeRedirectPath('/dashboard'), '/dashboard');
  assert.equal(safeRedirectPath('/shop/amara?tab=new#top'), '/shop/amara?tab=new#top');
  assert.equal(safeRedirectPath('/'), '/');
});

test('rejects anything that could leave the site', () => {
  for (const bad of [
    'https://evil.site', 'http://evil.site', '//evil.site', '/\\evil.site', '/\\/evil.site',
    'javascript:alert(1)', 'evil.site', '/\t/evil.site', '/\n/evil.site', '\\\\evil.site',
    ' //evil.site', '/%0d%0a', '',
  ]) {
    assert.equal(safeRedirectPath(bad), bad === '/%0d%0a' ? '/%0d%0a' : null, JSON.stringify(bad));
  }
  assert.equal(safeRedirectPath(null), null);
  assert.equal(safeRedirectPath(undefined), null);
});
