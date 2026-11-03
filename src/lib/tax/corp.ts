import { P, type TaxParams } from './params';
import { assertFinite } from './format';
import { personalTax, salaryDed } from './sole';
export interface CorpOptions {
  age40: boolean;
  fee: number;
}
export interface CorpResult {
  R: number;
  emp: number;
  er: number;
  it: number;
  rt: number;
  profit: number;
  ct: number;
  keep: number;
  retained: number;
  div: number;
  total: number;
}
export function corpTax(profit: number, params: TaxParams = P): number {
  assertFinite(profit);
  const c = params.corp;
  if (profit <= 0) return c.flat;
  const h =
    Math.min(profit, c.limit) * c.rate +
    Math.max(0, profit - c.limit) * c.upperRate;
  const jg =
    Math.min(profit, c.jigyoLimit) * c.jigyoLow +
    Math.min(Math.max(0, profit - c.jigyoLimit), c.jigyoLimit) * c.jigyoMid +
    Math.max(0, profit - c.limit) * c.jigyoHigh;
  return Math.round(
    h + h * c.local + h * c.resident + jg + jg * c.specialJigyo + c.flat,
  );
}
export function corp(
  S: number,
  E: number,
  R: number,
  o: CorpOptions,
  params: TaxParams = P,
): CorpResult {
  assertFinite(S, E, R, o.fee);
  let emp = 0,
    er = 0;
  if (R > 0) {
    const m = R / 12;
    const mh = Math.min(Math.max(m, params.healthMin), params.healthMax),
      mp = Math.min(Math.max(m, params.pensionMin), params.pensionMax);
    const hr = params.health + (o.age40 ? params.care : 0) + params.kodomo;
    emp = Math.round(((mh * hr) / 2 + (mp * params.kousei) / 2) * 12);
    er = emp + Math.round(mp * params.kyoshutsu * 12);
  }
  const salInc = Math.max(0, R - salaryDed(R, params));
  const { it, rt } = personalTax(salInc, emp, 0, params);
  const profit = S - E - R - er - o.fee;
  const ct = corpTax(profit, params),
    keep = R - emp - it - rt,
    retained = profit - ct;
  // Prototype: distribute all retained company profit and subtract estimated dividend tax.
  let div = 0;
  if (retained > 0) {
    const b = personalTax(salInc + retained, emp, 0, params);
    div = Math.max(
      0,
      Math.round(b.it + b.rt - it - rt - retained * params.corp.dividendCredit),
    );
  }
  return {
    R,
    emp,
    er,
    it,
    rt,
    profit,
    ct,
    keep,
    retained,
    div,
    total: keep + retained - div,
  };
}
export function bestCorp(
  S: number,
  E: number,
  o: CorpOptions,
  params: TaxParams = P,
): CorpResult {
  assertFinite(S, E, o.fee);
  const max = Math.max(0, S - E - o.fee);
  let best = corp(S, E, 0, o, params);
  for (let R = params.corp.salaryStep; R <= max; R += params.corp.salaryStep) {
    const c = corp(S, E, R, o, params);
    if (c.total > best.total) best = c; // Strict comparison retains the earlier/lower salary on a tie.
  }
  return best;
}
