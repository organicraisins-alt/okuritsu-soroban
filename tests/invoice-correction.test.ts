import { expect, it } from 'vitest';
import {
  invoice,
  analyzeInvoice,
  transitionForYear,
  invoiceYearSeries,
} from '../src/lib/tax/invoice';
import { defaults, parseState, serializeState } from '../src/lib/tools/state';
const input = {
  sales: 7_000_000,
  buy: 800_000,
  b2b: 0.9,
  deem: 0.5,
  taxYear: 2026,
  baseBand: 'under1000' as const,
  registeredFromExempt: true,
  specialExcluded: false,
  discount: 1,
};
it('2026年は77.5%で按分し、2割14万円・値下げ141750円・3割対象外', () => {
  const r = analyzeInvoice(input);
  expect(r.ratio).toBeCloseTo(0.775);
  expect(r.best.k).toBe('2割特例');
  expect(r.best.amt).toBe(140000);
  expect(r.cut).toBe(141750);
  expect(r.difference).toBe(1750);
  expect(r.methods[1]!.ok).toBe(false);
  expect(r.methods[1]!.reason).toContain('この年分は対象外');
  expect(r.b2bThreshold).toBeCloseTo(0.8888888889);
  expect(r.discountThreshold).toBeCloseTo(0.987654321);
});
it('2027年は3割21万円が最安で2割対象外', () => {
  const r = analyzeInvoice({ ...input, taxYear: 2027 });
  expect(r.ratio).toBe(0.7);
  expect(r.best.k).toBe('3割特例');
  expect(r.best.amt).toBe(210000);
  expect(r.methods[0]!.ok).toBe(false);
  expect(r.cut).toBe(189000);
});
it.each([
  [2026, 0.775],
  [2027, 0.7],
  [2028, 0.65],
  [2029, 0.5],
  [2030, 0.45],
  [2031, 0.225],
])('月数按分した%d年の実効値が%s', (year, ratio) => {
  expect(transitionForYear(year).ratio).toBeCloseTo(ratio);
});
it('簡易課税は当年売上ではなく基準期間で判定', () => {
  expect(
    invoice({ ...input, sales: 60_000_000, baseBand: 'under5000' }).methods[2]!
      .ok,
  ).toBe(true);
  expect(
    invoice({ ...input, sales: 1_000_000, baseBand: 'over5000' }).methods[2]!
      .ok,
  ).toBe(false);
  expect(invoice({ ...input, baseBand: 'unknown' }).methods[2]!.ok).toBe(false);
});
it('特例の対象外理由を区別し、非登録の免税比較も抑止する', () => {
  for (const patch of [
    { baseBand: 'under5000' as const },
    { specialExcluded: true },
    { registeredFromExempt: false },
  ]) {
    const r = analyzeInvoice({ ...input, ...patch });
    expect(r.methods[0]!.ok).toBe(false);
    expect(r.methods[0]!.reason).toBeTruthy();
    expect(r.canCompare).toBe(false);
  }
});
it('値下げ0・売上0・控除100%で分岐の無限値やNaNを出さない', () => {
  const noDiscount = analyzeInvoice({ ...input, discount: 0 });
  expect(noDiscount.cut).toBe(0);
  expect(noDiscount.b2bThreshold).toBeNull();
  expect(noDiscount.difference).toBe(-140000);
  const zero = analyzeInvoice({ ...input, sales: 0, buy: 0 });
  expect(zero.difference).toBe(0);
  expect(zero.b2bThreshold).toBeNull();
  expect(analyzeInvoice({ ...input, ratio: 1 }).b2bThreshold).toBeNull();
  expect(analyzeInvoice({ ...input, b2b: 0 }).discountThreshold).toBeNull();
});
it('年次比較は各年の自動割合を使い適用法を切り替える', () => {
  const rows = invoiceYearSeries({ ...input, ratio: 0.8 });
  expect(rows).toHaveLength(6);
  expect(rows.map((r) => r.taxYear)).toEqual([
    2026, 2027, 2028, 2029, 2030, 2031,
  ]);
  expect(rows.map((r) => r.best.k)).toEqual([
    '2割特例',
    '3割特例',
    '3割特例',
    '簡易課税',
    '簡易課税',
    '簡易課税',
  ]);
  expect(rows[0]!.ratio).toBeCloseTo(0.775);
});
it('新規URLは自動、旧URLの明示ratioは手動で復元', () => {
  const a = parseState('invoice', new URLSearchParams('taxYear=2028'));
  expect(a.errors).toEqual({});
  expect(a.state.ratioMode).toBe('auto');
  expect(a.state.ratio).toBeCloseTo(0.65);
  const b = parseState(
    'invoice',
    new URLSearchParams('ratio=0.7&taxYear=2026&baseEligible=0'),
  );
  expect(b.state.ratioMode).toBe('manual');
  expect(b.state.ratio).toBe(0.7);
  expect(b.state.baseBand).toBe('unknown');
  const s = {
    ...defaults.invoice,
    taxYear: 2028,
    ratio: 0.65,
    ratioMode: 'auto',
  };
  expect(
    parseState('invoice', new URLSearchParams(serializeState('invoice', s)))
      .state,
  ).toEqual(s);
});
it('自動実効値と全角入力、1%刻みの事業者向け割合を受け付ける', () => {
  const r = parseState(
    'invoice',
    new URLSearchParams(
      'sales=７００&buy=８０&b2b=89&ratioMode=auto&taxYear=2026',
    ),
  );
  expect(r.errors).toEqual({});
  expect(r.state.sales).toBe(700);
  expect(r.state.ratio).toBeCloseTo(0.775);
});
it('整数スライダーに復元できない小数の割合を拒否する', () => {
  expect(
    parseState('invoice', new URLSearchParams('b2b=89.5')).errors,
  ).toHaveProperty('b2b');
  expect(
    parseState('invoice', new URLSearchParams('discount=50.5')).errors,
  ).toHaveProperty('discount');
});
it('納税額0円で値下げがありうる場合、損益分岐は0%になる', () => {
  const r = analyzeInvoice({ ...input, buy: 7_000_000 });
  expect(r.best.amt).toBe(0);
  expect(r.b2bThreshold).toBe(0);
  expect(r.discountThreshold).toBe(0);
});
