import { expect, it } from 'vitest';
import { guides } from '../src/data/guides';
import { seasonalGuides } from '../src/data/seasonal-guides';
it('全記事が公開日と更新日を個別に持ち、日付の順序が正しい', () => {
  for (const guide of [...guides, ...seasonalGuides]) {
    expect(guide.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(guide.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(guide.updatedAt >= guide.publishedAt).toBe(true);
  }
});
it('今回確認した3記事だけ出典確認日と短い結論を表示する', () => {
  const checked = [...guides, ...seasonalGuides].filter(
    (g) => g.sourceCheckedAt === '2026-10-28',
  );
  expect(checked.map((g) => g.slug).sort()).toEqual([
    'kakutei-shinkoku',
    'kokuho-takai',
    'shiharai-calendar',
  ]);
  for (const guide of checked) expect(guide.answer!.length).toBeGreaterThan(20);
});
