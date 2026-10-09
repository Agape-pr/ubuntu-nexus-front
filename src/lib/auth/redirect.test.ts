import { describe, expect, test } from 'vitest';
import { safeRedirectPath } from './redirect';

describe('safeRedirectPath', () => {
  test('accepts plain on-site paths, with query and hash', () => {
    expect(safeRedirectPath('/dashboard')).toBe('/dashboard');
    expect(safeRedirectPath('/shop/amara?tab=new#top')).toBe('/shop/amara?tab=new#top');
    expect(safeRedirectPath('/')).toBe('/');
    expect(safeRedirectPath('/%0d%0a')).toBe('/%0d%0a'); // percent-encoded text is just a path
  });

  test.each([
    'https://evil.site', 'http://evil.site', '//evil.site', '/\\evil.site', '/\\/evil.site',
    'javascript:alert(1)', 'evil.site', '/\t/evil.site', '/\n/evil.site', '\\\\evil.site',
    ' //evil.site', '',
  ])('rejects %j (could leave the site)', (bad) => {
    expect(safeRedirectPath(bad)).toBeNull();
  });

  test('rejects missing values', () => {
    expect(safeRedirectPath(null)).toBeNull();
    expect(safeRedirectPath(undefined)).toBeNull();
  });
});
