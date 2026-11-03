import { P, type TaxParams } from './params';
import { assertFinite, floorTo } from './format';
export interface SoleOptions {
  blue: number;
  age40: boolean;
  jigyo: boolean;
  extra?: number;
}
export interface SoleResult {
  profit: number;
  inc: number;
  kk: number;
  pn: number;
  it: number;
  rt: number;
  jg: number;
  total: number;
}
export function basicIT(inc: number, p: TaxParams = P): number {
  assertFinite(inc);
  return p.basicIT.find(([limit]) => inc <= limit)![1];
}
export function basicRT(inc: number, p: TaxParams = P): number {
  assertFinite(inc);
  return p.basicRT.find(([limit]) => inc <= limit)![1];
}
export function incomeTaxRaw(t: number, p: TaxParams = P): number {
  assertFinite(t);
  const [, rate, deduction] = p.incomeBands.find(([limit]) => t <= limit)!;
  return Math.max(0, t * rate - deduction);
}
export function salaryDed(g: number, p: TaxParams = P): number {
  assertFinite(g);
  if (p.version !== 'prototype') {
    const special = p.salary.specialIncomeBands.find(([limit]) => g < limit);
    if (special) return g - Math.max(0, g * special[1] + special[2]);
    const rounded =
      g < p.salary.roundingBelow ? floorTo(g, p.salary.roundingUnit) : g;
    const [, rate, addition] = p.salary.bands.find(([limit]) => g <= limit)!;
    return Math.min(
      g,
      Math.max(rounded * rate + addition + (g - rounded), p.salary.minimum),
    );
  }
  const [, rate, addition] = p.salary.bands.find(([limit]) => g <= limit)!;
  return Math.min(g, Math.max(g * rate + addition, p.salary.minimum));
}
export function personalTax(
  inc: number,
  social: number,
  extra: number,
  p: TaxParams = P,
): { it: number; rt: number } {
  assertFinite(inc, social, extra);
  const itBase = floorTo(
    Math.max(0, inc - social - extra - basicIT(inc, p)),
    1000,
  );
  const it = floorTo(incomeTaxRaw(itBase, p) * p.reconstruction, 100);
  let rt = 0;
  if (inc > p.resident.threshold) {
    const rb = floorTo(
      Math.max(0, inc - social - extra - basicRT(inc, p)),
      1000,
    );
    rt =
      Math.max(
        0,
        floorTo(
          rb * p.resident.rate - (rb > 0 ? p.resident.adjustment : 0),
          100,
        ),
      ) + p.resident.flat;
  }
  return { it, rt };
}
export function kokuho(inc: number, age40: boolean, p: TaxParams = P): number {
  assertFinite(inc);
  if ('rate' in p.kk) {
    const base = Math.max(0, inc - p.kk.deduction);
    let v = Math.min(base * p.kk.rate + p.kk.flat, p.kk.cap);
    if (age40)
      v += Math.min(base * p.kk.careRate + p.kk.careFlat, p.kk.careCap);
    return floorTo(v, 100);
  }
  return floorTo(
    kokuhoBreakdown(inc, age40, p).reduce((sum, item) => sum + item.amount, 0),
    100,
  );
}
export function sole(
  S: number,
  E: number,
  o: SoleOptions,
  p: TaxParams = P,
): SoleResult {
  assertFinite(S, E, o.blue, o.extra ?? 0);
  const profit = S - E;
  const blue = Math.min(o.blue, Math.max(0, profit));
  const inc = Math.max(0, profit - blue);
  const kk = kokuho(inc, o.age40, p),
    pn = p.pensionMonthly * 12;
  const { it, rt } = personalTax(inc, kk + pn, o.extra || 0, p);
  const jg = o.jigyo
    ? floorTo(Math.max(0, profit - p.jigyo.deduction) * p.jigyo.rate, 100)
    : 0;
  return {
    profit,
    inc,
    kk,
    pn,
    it,
    rt,
    jg,
    total: profit - kk - pn - it - rt - jg,
  };
}

export function kokuhoBreakdown(inc: number, age40: boolean, p: TaxParams = P) {
  assertFinite(inc);
  if ('rate' in p.kk)
    throw new Error('区分別内訳は令和8年度プロファイルで利用できます。');
  const base = Math.max(0, inc - p.kk.deduction);
  return (['medical', 'support', 'care', 'child'] as const).map((key) => {
    const segment = p.kk as typeof P.kk;
    const item = segment[key],
      amount =
        key === 'care' && !age40
          ? 0
          : Math.min(base * item.rate + item.flat, item.cap);
    return { key, amount, cap: item.cap, capped: amount === item.cap };
  });
}
