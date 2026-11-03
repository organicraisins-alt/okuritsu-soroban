import { sole } from '../tax/sole';
import { bestCorp } from '../tax/corp';
import { P } from '../tax/params';
import { normalReturns } from './random';
export const TRIALS = 10000,
  GOAL = 100000000,
  MODEL_VERSION = 1;
export interface OkuritsuInput {
  sales: number;
  expenses: number;
  blue: number;
  age: number;
  targetAge: number;
  assets: number;
  living: number;
  ideco: number;
  kyosai: number;
  mean: number;
  volatility: number;
  seed: number;
  version: number;
}
export const defaults: OkuritsuInput = {
  sales: 8000000,
  expenses: 1500000,
  blue: 650000,
  age: 30,
  targetAge: 60,
  assets: 0,
  living: 3000000,
  ideco: 0,
  kyosai: 0,
  mean: 0.04,
  volatility: 0.15,
  seed: 20261027,
  version: MODEL_VERSION,
};
export const presets = [
  { label: '控えめ 平均2%・幅8%', mean: 0.02, volatility: 0.08 },
  { label: '標準 平均4%・幅15%', mean: 0.04, volatility: 0.15 },
  { label: '積極 平均6%・幅20%', mean: 0.06, volatility: 0.2 },
];
export function contributionLimits(age: number) {
  return {
    ideco: age >= 20 && age < 60 ? P.deductions.ideco : 0,
    kyosai: P.deductions.smallBusiness,
  };
}
export function validateInput(i: OkuritsuInput) {
  const errors: string[] = [];
  for (const [key, value] of Object.entries(i))
    if (!Number.isFinite(value))
      errors.push(`${key}は数値で入力してください。`);
  for (const k of ['sales', 'expenses', 'assets', 'living'] as const)
    if (i[k] < 0 || i[k] > 1e9)
      errors.push(`${k}は0〜100,000万円で入力してください。`);
  if (![0, 100000, 650000].includes(i.blue))
    errors.push('申告方法を選び直してください。');
  if (!Number.isInteger(i.age) || i.age < 18 || i.age > 79)
    errors.push('年齢は18〜79歳の整数で入力してください。');
  if (
    !Number.isInteger(i.targetAge) ||
    i.targetAge < i.age ||
    i.targetAge > 100
  )
    errors.push('目標年齢は現在の年齢以上、100歳以下で入力してください。');
  if (i.mean < -0.5 || i.mean > 0.5 || i.volatility < 0 || i.volatility > 1)
    errors.push(
      '平均利回りは−50〜50%、値動きの幅は0〜100%で入力してください。',
    );
  const limits = contributionLimits(i.age);
  if (
    i.ideco < 0 ||
    i.ideco > limits.ideco ||
    i.kyosai < 0 ||
    i.kyosai > limits.kyosai
  )
    errors.push(
      '掛金がこのモデルの適用上限を超えています。iDeCoは20〜59歳の第1号を想定します。',
    );
  if (!Number.isInteger(i.seed) || i.seed < 0 || i.seed > 4294967295)
    errors.push('シードが不正です。');
  if (i.version !== MODEL_VERSION)
    errors.push('この共有URLは未対応のモデル版です。');
  return errors;
}
export function parseInput(query: URLSearchParams) {
  const input = { ...defaults },
    errors: string[] = [];
  for (const key of Object.keys(defaults) as (keyof OkuritsuInput)[]) {
    if (!query.has(key)) continue;
    const raw = query.get(key)!.normalize('NFKC').trim().replace(/,/g, '');
    if (!/^-?\d+(?:\.\d+)?$/.test(raw)) {
      errors.push(`${key}の値を確認してください。`);
      continue;
    }
    input[key] = Number(raw);
  }
  return { input, errors: [...errors, ...validateInput(input)] };
}
export function serializeInput(i: OkuritsuInput) {
  return new URLSearchParams(Object.entries(i).map(([k, v]) => [k, String(v)]));
}
export function cashFlow(i: OkuritsuInput, corporate = false) {
  const errors = validateInput(i);
  if (errors.length) throw new RangeError(errors.join(' '));
  const contributions = corporate ? 0 : i.ideco + i.kyosai;
  const takeHome = corporate
    ? bestCorp(i.sales, i.expenses, {
        age40: i.age >= 40 && i.age < 65,
        fee: 300000,
      }).total
    : sole(i.sales, i.expenses, {
        blue: i.blue,
        age40: i.age >= 40 && i.age < 65,
        jigyo: true,
        extra: contributions,
      }).total;
  return {
    takeHome,
    annualContribution: takeHome - i.living,
    freeContribution: takeHome - i.living - contributions,
    contributions,
    corporate,
  };
}
export function stepAssets(assets: number, rate: number, contribution: number) {
  return Math.max(0, assets * (1 + Math.max(-1, rate)) + contribution);
}
export interface Point {
  age: number;
  p10: number;
  p50: number;
  p90: number;
}
export interface Simulation {
  probability: number;
  shortfallProbability: number;
  medianAge: number | null;
  points: Point[];
  flow: ReturnType<typeof cashFlow>;
}
function run(
  i: OkuritsuInput,
  returns: Float64Array,
  corporate: boolean,
  quantiles: boolean,
): Simulation {
  const flow = cashFlow(i, corporate),
    years = i.targetAge - i.age;
  const columns = quantiles
    ? Array.from({ length: years + 1 }, () => new Float64Array(TRIALS))
    : [];
  let hits = 0,
    shortfalls = 0;
  for (let trial = 0; trial < TRIALS; trial++) {
    let assets = i.assets,
      hit = assets >= GOAL,
      short = false;
    if (quantiles) columns[0]![trial] = assets;
    for (let y = 0; y < years; y++) {
      const rate = returns[trial * years + y]!;
      if (assets * (1 + Math.max(-1, rate)) + flow.annualContribution < 0)
        short = true;
      assets = stepAssets(assets, rate, flow.annualContribution);
      if (assets >= GOAL) hit = true;
      if (quantiles) columns[y + 1]![trial] = assets;
    }
    if (hit) hits++;
    if (short) shortfalls++;
  }
  const points = columns.map((values, y) => {
    values.sort();
    const q = (p: number) => {
      const n = (TRIALS - 1) * p,
        a = Math.floor(n);
      return (
        values[a]! +
        (values[Math.min(a + 1, TRIALS - 1)]! - values[a]!) * (n - a)
      );
    };
    return { age: i.age + y, p10: q(0.1), p50: q(0.5), p90: q(0.9) };
  });
  return {
    probability: (hits / TRIALS) * 100,
    shortfallProbability: (shortfalls / TRIALS) * 100,
    medianAge: points.find((p) => p.p50 >= GOAL)?.age ?? null,
    points,
    flow,
  };
}
export function simulate(
  i: OkuritsuInput,
  options: { returns?: Float64Array; corporate?: boolean } = {},
) {
  const errors = validateInput(i);
  if (errors.length) throw new RangeError(errors.join(' '));
  const count = TRIALS * (i.targetAge - i.age),
    returns =
      options.returns ?? normalReturns(i.seed, count, i.mean, i.volatility);
  if (returns.length !== count || returns.some((x) => !Number.isFinite(x)))
    throw new RangeError('乱数列が不正です。');
  return run(i, returns, options.corporate ?? false, true);
}
export function compareScenarios(i: OkuritsuInput) {
  const errors = validateInput(i);
  if (errors.length) throw new RangeError(errors.join(' '));
  const returns = normalReturns(
      i.seed,
      TRIALS * (i.targetAge - i.age),
      i.mean,
      i.volatility,
    ),
    base = run(i, returns, false, true),
    limits = contributionLimits(i.age);
  const scenarios = [
    {
      label: '青色申告65万円にする',
      input: { ...i, blue: 650000 },
      href: '/guide/dokuritsu-1nenme/#blue',
      corporate: false,
    },
    {
      label: '小規模企業共済を月7万円にする',
      input: { ...i, kyosai: limits.kyosai },
      href: '/logic/#contributions',
      corporate: false,
    },
    {
      label: 'iDeCoをこのモデルの上限まで積み立てる',
      input: { ...i, ideco: limits.ideco },
      href: '/logic/#contributions',
      corporate: false,
    },
    {
      label: '法人化する（掛金控除なし）',
      input: i,
      href: '/tools/houjinka/',
      corporate: true,
    },
    {
      label: '生活費を年24万円減らす',
      input: { ...i, living: Math.max(0, i.living - 240000) },
      href: '/guide/keihi/',
      corporate: false,
    },
  ];
  return {
    base,
    changes: scenarios.map((s) => {
      const r = run(s.input, returns, s.corporate, false);
      return {
        label: s.label,
        href: s.href,
        probability: r.probability,
        delta: r.probability - base.probability,
        freeContribution: r.flow.freeContribution,
      };
    }),
  };
}

/** The four-field hero must never silently inherit hidden detailed assumptions. */
export function parseSimpleInput(query: URLSearchParams) {
  const simple = new URLSearchParams();
  for (const key of [
    'sales',
    'expenses',
    'age',
    'targetAge',
    'seed',
    'version',
  ])
    if (query.has(key)) simple.set(key, query.get(key)!);
  return parseInput(simple);
}
