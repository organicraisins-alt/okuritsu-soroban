import { P } from './params';
import { legacyParams } from './legacy-profile';
import { sole } from './sole';
import { standardOptions } from './content';
/** Model-to-model comparison; the legacy fixture is not verified FY2025 legislation. */
export function reformComparison() {
  return [300, 500, 800, 1200, 1500, 2000].map((amount) => {
    const profit = amount * 10000,
      old = sole(profit, 0, standardOptions, legacyParams),
      current = sole(profit, 0, standardOptions, P);
    return {
      profit,
      old: old.total,
      current: current.total,
      difference: current.total - old.total,
    };
  });
}
// FY2026 Kyokai voluntary coverage cap (checked 2026-10-27):
// https://www.kyoukaikenpo.or.jp/news/r07_dec/1259.html
const voluntaryStandardCap = P.voluntaryStandardMax;
export function voluntaryComparison(
  profit: number,
  standardMonthly: number,
  age40: boolean,
) {
  if (
    !Number.isFinite(profit) ||
    !Number.isFinite(standardMonthly) ||
    profit < 0 ||
    standardMonthly <= 0 ||
    standardMonthly > 1e7
  )
    throw new RangeError('利益と退職時の標準報酬月額を確認してください。');
  const nhi = sole(profit, 0, { ...standardOptions, age40 }).kk;
  const voluntary = Math.round(
    Math.min(standardMonthly, voluntaryStandardCap) *
      (P.health + P.kodomo + (age40 ? P.care : 0)) *
      12,
  );
  return { nhi, voluntary, difference: nhi - voluntary };
}
