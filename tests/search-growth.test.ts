import { expect, it } from 'vitest';
import { siteTitle } from '../config/site.mjs';
import { relatedPages } from '../src/data/related';
import { incomeAmounts, employeeAmounts } from '../src/data/amounts';

it('title末尾は短いブランド名を一度だけ付け、旧末尾も正規化する', () => {
  expect(siteTitle('手取りはいくら？')).toBe('手取りはいくら？｜億率');
  expect(siteTitle('手取りはいくら？｜億率')).toBe('手取りはいくら？｜億率');
  expect(siteTitle('手取りはいくら？｜億率（おくりつ）')).toBe(
    '手取りはいくら？｜億率',
  );
});
it('利益800万円から前後の利益・同額会社員比較・億率へ進める', () => {
  expect(relatedPages('/nenshu/800/').map((x) => x.href)).toEqual([
    '/nenshu/750/',
    '/nenshu/850/',
    '/hikaku/kaishain-800/',
    '/okuritsu/',
  ]);
});
it('会社員800万円から前後の年収・同額の利益・億率へ進める', () => {
  expect(relatedPages('/hikaku/kaishain-800/').map((x) => x.href)).toEqual([
    '/hikaku/kaishain-700/',
    '/hikaku/kaishain-900/',
    '/nenshu/800/',
    '/okuritsu/',
  ]);
});
it('全34ページの関連リンクに存在しない金額・自己リンク・重複がない', () => {
  const paths = [
    ...incomeAmounts.map((a) => `/nenshu/${a}/`),
    ...employeeAmounts.map((a) => `/hikaku/kaishain-${a}/`),
  ];
  const allowed = new Set([...paths, '/okuritsu/']);
  for (const path of paths) {
    const links = relatedPages(path);
    expect(links.length).toBeGreaterThanOrEqual(3);
    expect(links.some((x) => x.href === '/okuritsu/')).toBe(true);
    expect(new Set(links.map((x) => x.href)).size).toBe(links.length);
    for (const link of links) {
      expect(link.href).not.toBe(path);
      expect(allowed.has(link.href)).toBe(true);
    }
  }
});
it('国保・住民税の記事は話題に関連したガイドへつなぐ', () => {
  expect(
    relatedPages('/guide/juminzei-itsu/').some(
      (x) => x.href === '/guide/shiharai-calendar/',
    ),
  ).toBe(true);
  expect(
    relatedPages('/guide/kokuho-takai/').some(
      (x) => x.href === '/guide/dokuritsu-1nenme/',
    ),
  ).toBe(true);
});
