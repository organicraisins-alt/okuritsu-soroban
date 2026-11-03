import { expect, it } from 'vitest';
import { SITE_NAME, siteTitle, siteIdentity } from '../config/site.mjs';
it('ブランド末尾を共通設定から一度だけ付ける', () => {
  expect(SITE_NAME).toBe('億率（おくりつ）');
  expect(siteTitle('手取り計算')).toBe('手取り計算｜億率');
  expect(siteTitle(siteTitle('手取り計算'))).toBe('手取り計算｜億率');
});
it('サイトと運営組織の同じ識別子を使う', () => {
  const x = siteIdentity('https://okuritsu-soroban.com/');
  expect(x[0].name).toBe(SITE_NAME);
  expect(x[0].publisher?.['@id']).toBe(x[1]['@id']);
});
