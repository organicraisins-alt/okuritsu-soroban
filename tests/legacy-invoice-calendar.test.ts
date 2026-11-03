import { expect, it } from 'vitest';
import { invoice } from './helpers/legacy';
import { paymentCalendar } from '../src/lib/tax/calendar';
import { sole } from './helpers/legacy';
import { prototypeCalendar } from './helpers/prototype';
const input = {
  sales: 7_000_000,
  buy: 800_000,
  b2b: 0.9,
  deem: 0.5,
  ratio: 0.5,
};
it('プロトタイプのインボイス例は2割特例14万円、未登録値下げ31.5万円', () => {
  const r = invoice(input);
  expect(r.out).toBe(700_000);
  expect(r.best.k).toBe('2割特例');
  expect(r.best.amt).toBe(140_000);
  expect(r.methods.map((m) => m.amt)).toEqual([
    140_000, 210_000, 350_000, 620_000,
  ]);
  expect(r.cut).toBe(315_000);
  expect(r.regKeep).toBeCloseTo(7_560_000, 6);
  expect(r.noKeep).toBeCloseTo(7_385_000, 6);
  expect(r.regWin).toBe(true);
});
it('3割特例を現在の最安比較に含めず売上の上限を維持', () => {
  expect(invoice({ ...input, sales: 10_000_000 }).methods[0]!.ok).toBe(true);
  expect(invoice({ ...input, sales: 10_000_001 }).methods[0]!.ok).toBe(false);
  expect(invoice({ ...input, sales: 50_000_000 }).methods[2]!.ok).toBe(true);
  expect(invoice({ ...input, sales: 50_000_001 }).best.k).toBe('本則課税');
  expect(invoice({ ...input, buy: 100_000_000 }).best.amt).toBe(0);
  expect(invoice({ ...input, b2b: 0 }).cut).toBe(0);
  expect(invoice({ ...input, ratio: 1 }).cut).toBe(0);
});
it('カレンダーの月別内訳はプロトタイプと同じで年額に一致', () => {
  for (const itax of [0, 149_999, 150_000, 300_000]) {
    const r = {
      ...sole(8_000_000, 1_500_000, {
        blue: 650000,
        age40: false,
        jigyo: true,
      }),
      it: itax,
    };
    const cal = paymentCalendar(r);
    const ref = prototypeCalendar(r);
    expect(
      cal.months.map((m) => ({
        amt: m.amt,
        items: m.items.map((x) => x.label + ' ' + x.display),
      })),
    ).toEqual(ref);
    expect(cal.total).toBeCloseTo(r.it + r.rt + r.kk + r.pn + r.jg, 6);
    expect(cal.months[3]!.items.map((i) => i.label)).toEqual(['国民年金']);
    expect(cal.months[6]!.items.some((i) => i.label === '予定納税')).toBe(
      itax >= 150_000,
    );
    expect(cal.months[cal.peakMonth - 1]!.amt).toBe(
      Math.max(...cal.months.map((m) => m.amt)),
    );
  }
});

it('インボイス全方式の数値・文言・選択が元コードと完全一致する', async () => {
  const { prototypeInvoice } = await import('./helpers/prototype');
  for (const sales of [
    0, 7_000_000, 10_000_000, 10_000_001, 50_000_000, 50_000_001,
  ]) {
    for (const ratio of [0, 0.5, 0.8]) {
      const data = { ...input, sales, ratio };
      expect(invoice(data)).toEqual(prototypeInvoice(data));
    }
  }
});
