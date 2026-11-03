import { expect, it } from 'vitest';
import {
  resolveSiteUrl,
  pageUrl,
  breadcrumbJsonLd,
  analyticsId,
  robotsText,
  serializeJsonLd,
} from '../config/site.mjs';
it('公開URL未定では架空の正規URLを生成しない', () => {
  expect(resolveSiteUrl(undefined)).toBeUndefined();
  expect(resolveSiteUrl(' ')).toBeUndefined();
  expect(pageUrl(undefined, '/tools/?sales=800')).toBeUndefined();
  expect(
    breadcrumbJsonLd(undefined, [{ name: 'ホーム', path: '/' }]),
  ).toBeUndefined();
  expect(robotsText(undefined)).toBe('User-agent: *\nDisallow: /\n');
});
it('URL設定時はoriginを使いクエリ・hashを除去する', () => {
  const site = resolveSiteUrl('https://soroban.example/?source=test#home');
  expect(site).toBe('https://soroban.example/');
  expect(pageUrl(site, '/tools/tedori/?sales=800#result')).toBe(
    'https://soroban.example/tools/tedori/',
  );
  expect(robotsText(site)).toContain(
    'Sitemap: https://soroban.example/sitemap-index.xml',
  );
  expect(breadcrumbJsonLd(site, [{ name: 'ホーム', path: '/' }])).toMatchObject(
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { position: 1, name: 'ホーム', item: 'https://soroban.example/' },
      ],
    },
  );
});
it.each([
  'not a url',
  'javascript:alert(1)',
  'ftp://example.com',
  'https://user:pass@example.com',
  'https://example.com/sub/',
])('不正なサイト設定を拒否 %s', (value) =>
  expect(() => resolveSiteUrl(value)).toThrow(),
);
it('GA4未設定は読み込まず不正なIDを拒否する', () => {
  expect(analyticsId(undefined)).toBeUndefined();
  expect(analyticsId('')).toBeUndefined();
  expect(analyticsId('G-ABC123')).toBe('G-ABC123');
  expect(() => analyticsId('bad')).toThrow();
});
it('構造化データがscriptを閉じない', () =>
  expect(serializeJsonLd({ name: '</script>' })).not.toContain('</script>'));
