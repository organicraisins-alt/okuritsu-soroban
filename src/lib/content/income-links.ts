import { incomeAmounts } from '../../data/amounts';
/** Exact existing profit page, or explicitly labelled surrounding pages. */
export function profitPageLinks(profit: number) {
  const exact = incomeAmounts.find((amount) => amount * 10000 === profit);
  const lower = incomeAmounts
    .filter((amount) => amount * 10000 < profit)
    .at(-1);
  const upper = incomeAmounts.find((amount) => amount * 10000 > profit);
  const amounts = exact === undefined ? [lower, upper] : [exact];
  return amounts
    .filter((amount): amount is number => amount !== undefined)
    .map((amount) => ({
      amount,
      href: `/nenshu/${amount}/`,
      exact: exact !== undefined,
    }));
}
