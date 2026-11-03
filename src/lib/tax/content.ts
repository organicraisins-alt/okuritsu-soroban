import { P } from './params';
import { sole, kokuhoBreakdown, type SoleOptions } from './sole';
import { bestCorp } from './corp';
import { employeeEquivalent, employeeBreakdown } from './employee';
import { paymentCalendar } from './calendar';
import { calculationSteps, corporationVerdict } from './advice';
import { man, yen, assertFinite } from './format';
export const standardOptions: SoleOptions = {
  blue: P.deductions.blue,
  age40: false,
  jigyo: true,
  extra: 0,
};
export function incomeSummary(profit: number) {
  assertFinite(profit);
  if (profit <= 0) throw new RangeError('利益は正の数値を指定してください。');
  const result = sole(profit, 0, standardOptions),
    company = bestCorp(profit, 0, { age40: false, fee: 300000 });
  const verdict = corporationVerdict(company.total - result.total);
  const steps = calculationSteps(profit, 0, standardOptions),
    taxable = steps[6]!.amount;
  const band = P.incomeBands.find(([limit]) => taxable <= limit)!;
  const near = P.incomeBands.filter(
    ([limit]) => Number.isFinite(limit) && Math.abs(taxable - limit) <= 500000,
  );
  const breakdown = kokuhoBreakdown(result.inc, false),
    caps = breakdown.filter((part) => part.capped);
  const annualText = yen(result.total),
    monthlyText = yen(result.total / 12),
    equivalent = employeeEquivalent(result.total);
  const scenarios = [
    { label: '白色申告', options: { ...standardOptions, blue: 0 } },
    {
      label: '青色申告10万円控除',
      options: { ...standardOptions, blue: 100000 },
    },
    { label: '青色申告65万円控除（基本条件）', options: standardOptions },
    {
      label: '40〜64歳（介護保険あり）',
      options: { ...standardOptions, age40: true },
    },
    {
      label: '個人事業税の対象外',
      options: { ...standardOptions, jigyo: false },
    },
  ].map((x) => ({ label: x.label, result: sole(profit, 0, x.options) }));
  const savings = [
    { label: '小規模企業共済', contribution: P.deductions.smallBusiness },
    { label: 'iDeCo', contribution: P.deductions.ideco },
    {
      label: '両方を利用',
      contribution: P.deductions.smallBusiness + P.deductions.ideco,
    },
  ].map((x) => {
    const improved = sole(profit, 0, {
      ...standardOptions,
      extra: x.contribution,
    });
    return {
      ...x,
      result: improved,
      saving: improved.total - result.total,
      cashAfterContribution: improved.total - x.contribution,
    };
  });
  const faqs = [
    {
      question: `利益${man(profit)}の手取りは年間・月額でいくらですか？`,
      answer: `基本条件では年間${annualText}、月あたり${monthlyText}です。青色申告65万円控除・東京23区・40歳未満・扶養なし・個人事業税ありの概算です。`,
    },
    {
      question: 'ここでいう年収は売上ですか、利益ですか？',
      answer: `このページの${man(profit)}は、売上から仕事の経費を差し引いた利益です。経費のある方は、売上と経費を手取りツールに入力してください。`,
    },
    {
      question: '同じ手取りになる会社員の年収はいくらですか？',
      answer: `この条件では額面年収約${man(equivalent)}が目安です。会社員の保障や有給休暇、将来の年金まで同じになる意味ではありません。`,
    },
    {
      question: `利益${man(profit)}で法人化したほうが得ですか？`,
      answer: `${verdict.title}。${verdict.note} 会社の残金を配当で個人が受け取った場合の概算で、個人事業主との単純な税率比較ではありません。`,
    },
  ];
  return {
    profit,
    result,
    company,
    verdict,
    annualText,
    monthlyText,
    equivalent,
    rate: (result.total / profit) * 100,
    steps,
    calendar: paymentCalendar(result),
    scenarios,
    savings,
    faqs,
    band,
    near,
    caps,
    breakdown,
  };
}
/** Find a profit in 1,000-yen increments, splitting at basic-deduction discontinuities.
 * This avoids a global binary search skipping an earlier valid band before a tax jump. */
function requiredProfit(target: number) {
  const unit = 1000,
    max = P.equivalent.max;
  const cuts = [
    0,
    ...P.basicIT
      .filter(([n]) => Number.isFinite(n))
      .map(([n]) => n + P.deductions.blue + unit),
    ...P.basicRT
      .filter(([n]) => Number.isFinite(n))
      .map(([n]) => n + P.deductions.blue + unit),
    P.resident.threshold + P.deductions.blue + unit,
    max + unit,
  ];
  const sorted = [
    ...new Set(cuts.filter((n) => n >= 0 && n <= max + unit)),
  ].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length - 1; i++) {
    let lo = Math.ceil(sorted[i]! / unit),
      hi = Math.floor((sorted[i + 1]! - unit) / unit);
    if (hi < lo || sole(hi * unit, 0, standardOptions).total < target) continue;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (sole(mid * unit, 0, standardOptions).total >= target) hi = mid;
      else lo = mid + 1;
    }
    return lo * unit;
  }
  throw new RangeError('必要利益が計算範囲を超えています。');
}
export function employeeComparison(gross: number, expenseRatio: number) {
  assertFinite(gross, expenseRatio);
  if (gross <= 0 || expenseRatio < 0 || expenseRatio >= 1)
    throw new RangeError('年収と経費率を確認してください。');
  const employee = employeeBreakdown(gross),
    needed = requiredProfit(employee.total);
  let sales = Math.ceil(needed / (1 - expenseRatio) / 1000) * 1000;
  let expenses = sales * expenseRatio,
    result = sole(sales, expenses, standardOptions);
  while (result.total < employee.total) {
    sales += 1000;
    expenses = sales * expenseRatio;
    result = sole(sales, expenses, standardOptions);
  }
  return {
    employee,
    expenseRatio,
    sales,
    expenses,
    profit: sales - expenses,
    sole: result,
  };
}
