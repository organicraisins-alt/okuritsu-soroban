import { P, type TaxParams } from './params';
import { assertFinite } from './format';
import { personalTax, salaryDed } from './sole';
export function employeeBreakdown(G: number, p: TaxParams = P) {
  assertFinite(G);
  const m = G / 12;
  const mh = Math.min(Math.max(m, p.healthMin), p.healthMax),
    mp = Math.min(Math.max(m, p.pensionMin), p.pensionMax);
  const ins = Math.round(
    ((mh * (p.health + p.kodomo)) / 2 + (mp * p.kousei) / 2) * 12 +
      G * p.employment,
  );
  const { it, rt } = personalTax(Math.max(0, G - salaryDed(G, p)), ins, 0, p);
  return {
    gross: G,
    health: ((mh * (p.health + p.kodomo)) / 2) * 12,
    pension: ((mp * p.kousei) / 2) * 12,
    employment: G * p.employment,
    social: ins,
    it,
    rt,
    total: G - ins - it - rt,
  };
}
export function employee(G: number, p: TaxParams = P): number {
  return employeeBreakdown(G, p).total;
}
export function employeeEquivalent(take: number, p: TaxParams = P): number {
  assertFinite(take);
  let lo = 0,
    hi = p.equivalent.max as number;
  for (let i = 0; i < p.equivalent.iterations; i++) {
    const mid = (lo + hi) / 2;
    if (employee(mid, p) < take) lo = mid;
    else hi = mid;
  }
  return hi;
}
