import { describe, expect, it } from 'vitest';
import { readSharedParams, sharedUrl } from '../src/lib/tools/shared-url';
describe('共有条件はHTTPリクエストに含めない', () => {
  it('金額をfragmentに保存しqueryを削除する', () => {
    const url = sharedUrl(
      'https://example.com/tools/tedori/?sales=1',
      'sales=800&exp=100',
    );
    expect(url.search).toBe('');
    expect(url.hash).toBe('#sales=800&exp=100');
    expect(readSharedParams(url).get('sales')).toBe('800');
  });
  it('従来のqueryを読み込み、fragmentを優先する', () => {
    expect(
      readSharedParams(new URL('https://example.com/?sales=500')).get('sales'),
    ).toBe('500');
    expect(
      readSharedParams(new URL('https://example.com/?sales=500#sales=800')).get(
        'sales',
      ),
    ).toBe('800');
    expect(readSharedParams(new URL('https://example.com/#main')).size).toBe(0);
  });
});
