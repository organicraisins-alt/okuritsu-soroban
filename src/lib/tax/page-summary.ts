/** Display-only summaries. Existing tax rules and rounding remain unchanged. */
import { sole, type SoleResult } from './sole';
import { standardOptions } from './content';
export function taxAndInsuranceTotal(result: SoleResult): number {
  return result.it + result.rt + result.kk + result.pn + result.jg;
}
export function salesProfitRows() {
  return Array.from({ length: 11 }, (_, i) => {
    const sales = (1000 + i * 100) * 10000;
    return {
      sales,
      scenarios: [20, 30, 50].map((percent) => {
        const expenses = (sales * percent) / 100;
        const result = sole(sales, expenses, standardOptions);
        return { percent, expenses, profit: result.profit };
      }),
    };
  });
}
