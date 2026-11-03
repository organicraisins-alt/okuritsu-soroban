import { expect, it } from 'vitest';
import { incomeAmounts, employeeAmounts } from '../src/data/amounts';
import { incomeSummary, employeeComparison } from '../src/lib/tax/content';
it('年収25・会社員9の重複しないページ範囲', () => {
  expect(incomeAmounts).toHaveLength(25);
  expect(new Set(incomeAmounts).size).toBe(25);
  expect(incomeAmounts).toContain(1000);
  expect(incomeAmounts.at(-1)).toBe(2000);
  expect(employeeAmounts).toEqual([
    400, 500, 600, 700, 800, 900, 1000, 1100, 1200,
  ]);
});
it('各ページの本文・内訳・条件比較・FAQは同じ計算結果に基づく', () => {
  for (const profit of [5000000, 8000000, 12000000]) {
    const m = incomeSummary(profit);
    expect(m.result.profit).toBe(profit);
    expect(m.faqs[0]!.answer).toContain(m.annualText);
    expect(m.scenarios).toHaveLength(5);
    expect(m.savings).toHaveLength(3);
    expect(m.calendar.months).toHaveLength(12);
    expect(m.steps).toHaveLength(8);
  }
});
it('会社員と同じ手取りの必要売上は経費率で変わり、税額の段差も越える', () => {
  for (const g of [4000000, 6000000, 12000000])
    for (const ratio of [0, 0.2, 0.5, 0.9]) {
      const m = employeeComparison(g, ratio);
      expect(m.sole.total).toBeGreaterThanOrEqual(m.employee.total);
      expect(m.sales - m.expenses).toBeCloseTo(m.profit, 4);
    }
  expect(employeeComparison(6000000, 0.5).sales).toBeGreaterThan(
    employeeComparison(6000000, 0.2).sales,
  );
  expect(() => employeeComparison(6000000, 1)).toThrow(RangeError);
});
