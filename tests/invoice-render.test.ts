import { expect, it } from 'vitest';
import { renderTool } from '../src/lib/tools/render';
import { defaults, parseState } from '../src/lib/tools/state';
it('インボイスに無関係な注意と仮広告を表示しない', () => {
  const html = renderTool('invoice', defaults.invoice);
  for (const text of [
    '東京23区',
    '国保',
    '標準報酬',
    '扶養',
    '法人等向け',
    'data-placeholder',
  ])
    expect(html).not.toContain(text);
  expect(html).toContain('141,750円');
  expect(html).toContain('年 ＋');
});
it('対象外カードに適用可能なような納税額を表示しない', () => {
  for (const year of [2026, 2027, 2029]) {
    const state = parseState(
      'invoice',
      new URLSearchParams(`taxYear=${year}`),
    ).state;
    const html = renderTool('invoice', state);
    const cards = [
      ...html.matchAll(
        /<section class="method [^"]*off">([\s\S]*?)<\/section>/g,
      ),
    ];
    expect(cards.length).toBeGreaterThan(0);
    for (const c of cards) {
      expect(c[1]).toContain('対象外');
      expect(c[1]).not.toContain('class="amt"');
    }
  }
});
it('基準期間が課税の条件では非登録免税の差額を断定しない', () => {
  const html = renderTool('invoice', {
    ...defaults.invoice,
    baseBand: 'under5000',
    baseEligible: false,
  });
  expect(html).toContain('登録しない場合の比較は対象外');
  expect(html).toContain('非登録でも原則として納税が必要');
  expect(html).not.toContain('invoice-difference');
});
it('年次比較は同じデータのSVGと表を出し、前提の開閉でURLを書き換えない', () => {
  const html = renderTool('invoice', defaults.invoice);
  expect(html).toContain('<svg');
  expect(html).toContain('invoice-year-table');
  expect(html).toContain('data-reveal="invoice-assumptions"');
  expect(html).not.toContain('href="#invoice-assumptions"');
});
