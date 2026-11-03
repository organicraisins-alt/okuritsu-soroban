import { expect, it } from 'vitest';
import { defaults } from '../src/lib/tools/state';
import { renderTool } from '../src/lib/tools/render';
import { offerKeys } from '../src/data/offers';
import { renderPR } from '../src/lib/tools/markup';
it('静的初期結果も共有入力結果も同じ計算ライブラリから生成する', () => {
  const html = renderTool('tedori', defaults.tedori);
  expect(html).toContain('4,559,160');
  expect(html).toContain('支払いカレンダー');
  expect(html).toContain('課税所得');
  expect(html).not.toContain('data-placeholder');
  expect(renderPR(['soft'], true)).toContain('sponsored noopener');
  expect(renderPR(['soft'], false)).toBe('');
  expect(
    renderTool('tedori', { ...defaults.tedori, sales: 1200, exp: 200 }),
  ).toContain('6,570,960');
});
it('広告は元の青色控除・利益・法人優位条件で切り替わる', () => {
  expect(offerKeys('tedori', 0, 20_000_000)).toEqual(['soft', 'card', 'ideco']);
  expect(offerKeys('tedori', 650_000, 9_000_001)).toEqual([
    'tax',
    'soft',
    'ideco',
  ]);
  expect(offerKeys('houjinka', 650_000, 0, true)).toEqual([
    'tax',
    'setup',
    'soft',
  ]);
  expect(offerKeys('invoice', 650_000, 0)).toEqual(['invoice', 'soft', 'tax']);
});
it('法人比較・グラフ・インボイスの全方式を生成する', () => {
  expect(renderTool('houjinka', defaults.houjinka)).toContain('<svg');
  expect(renderTool('houjinka', defaults.houjinka)).toContain('会社に残るお金');
  const invoice = renderTool('invoice', defaults.invoice);
  expect(invoice).toContain('140,000');
  expect(invoice).toContain('3割特例');
  expect(invoice).toContain('試算');
});
