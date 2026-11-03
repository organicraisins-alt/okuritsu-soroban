import { expect, it } from 'vitest';
import {
  salesProfitRows,
  taxAndInsuranceTotal,
} from '../src/lib/tax/page-summary';
import { sole } from '../src/lib/tax/sole';
import { standardOptions } from '../src/lib/tax/content';
import { profitPageLinks } from '../src/lib/content/income-links';
import { incomeAmounts } from '../src/data/amounts';
it('税・保険料合計が5つの内訳と利益−手取りに一致する', () => {
  for (const profit of [3000000, 8000000, 20000000]) {
    const r = sole(profit, 0, standardOptions);
    expect(taxAndInsuranceTotal(r)).toBe(r.it + r.rt + r.kk + r.pn + r.jg);
    expect(taxAndInsuranceTotal(r)).toBe(r.profit - r.total);
  }
});
it('売上1000〜2000万円を3経費率で正確な利益へ換算する', () => {
  const rows = salesProfitRows();
  expect(rows).toHaveLength(11);
  expect(rows[0]!.sales).toBe(10000000);
  expect(rows.at(-1)!.sales).toBe(20000000);
  expect(rows[0]!.scenarios.map((s) => s.profit)).toEqual([
    8000000, 7000000, 5000000,
  ]);
  expect(rows[5]!.scenarios.map((s) => s.profit)).toEqual([
    12000000, 10500000, 7500000,
  ]);
  for (const row of rows)
    for (const s of row.scenarios)
      expect(s.profit + s.expenses).toBe(row.sales);
});
it('利益880万円や1050万円を存在しないURLへ丸めず、前後の既存額を案内する', () => {
  expect(profitPageLinks(8800000).map((x) => x.amount)).toEqual([850, 900]);
  expect(profitPageLinks(10500000).map((x) => x.amount)).toEqual([1000, 1100]);
  expect(profitPageLinks(8000000).map((x) => x.amount)).toEqual([800]);
  for (const row of salesProfitRows())
    for (const s of row.scenarios)
      for (const link of profitPageLinks(s.profit)) {
        expect(incomeAmounts).toContain(link.amount);
        expect(link.href).toBe(`/nenshu/${link.amount}/`);
      }
});
