import { P } from '../tax/params';
import { transitionForYear, type BaseSalesBand } from '../tax/invoice';
export type ToolKind = 'tedori' | 'houjinka' | 'invoice';
export interface ToolState {
  sales: number;
  exp: number;
  blue: number;
  extra: number;
  age40: boolean;
  jigyo: boolean;
  fee: number;
  mode: string;
  salary: number;
  buy: number;
  b2b: number;
  deem: number;
  ratio: number;
  ratioMode: string;
  baseBand: BaseSalesBand;
  discount: number;
  taxYear: number;
  baseEligible: boolean;
  registeredFromExempt: boolean;
  specialExcluded: boolean;
}
const base: ToolState = {
  sales: 800,
  exp: 150,
  blue: 650000,
  extra: 0,
  age40: false,
  jigyo: true,
  fee: 30,
  mode: 'auto',
  salary: 600,
  buy: 80,
  b2b: 90,
  deem: 0.5,
  ratio: P.invoice.defaultRatio,
  ratioMode: 'manual',
  baseBand: 'under1000',
  discount: 100,
  taxYear: 2026,
  baseEligible: true,
  registeredFromExempt: true,
  specialExcluded: false,
};
export const defaults: Record<ToolKind, ToolState> = {
  tedori: { ...base },
  houjinka: { ...base, sales: 1200, exp: 200 },
  invoice: {
    ...base,
    sales: 700,
    ratioMode: 'auto',
    ratio: transitionForYear(2026).ratio,
  },
};
export const stateKeys: Record<ToolKind, (keyof ToolState)[]> = {
  tedori: ['sales', 'exp', 'blue', 'extra', 'age40', 'jigyo'],
  houjinka: ['sales', 'exp', 'blue', 'age40', 'jigyo', 'fee', 'mode', 'salary'],
  invoice: [
    'sales',
    'buy',
    'b2b',
    'deem',
    'ratio',
    'taxYear',
    'ratioMode',
    'baseBand',
    'discount',
    'baseEligible',
    'registeredFromExempt',
    'specialExcluded',
  ],
};
/** Input is in ten-thousand yen. Bound work to avoid an unbounded corporate search. */
export function parseMoney(raw: string): number | undefined {
  const text = raw.normalize('NFKC').trim().replace(/,/g, '');
  if (!/^\d+(?:\.\d{1,4})?$/.test(text)) return undefined;
  const n = Number(text);
  return Number.isFinite(n) && n >= 0 && n <= 100000 ? n : undefined;
}
export function parseState(kind: ToolKind, query: URLSearchParams) {
  const state = { ...defaults[kind] },
    errors: Record<string, string> = {};
  for (const key of stateKeys[kind]) {
    const raw = query.get(key);
    if (raw === null) continue;
    let value: string | number | boolean | undefined;
    if (
      [
        'age40',
        'jigyo',
        'baseEligible',
        'registeredFromExempt',
        'specialExcluded',
      ].includes(key)
    )
      value = raw === '1' ? true : raw === '0' ? false : undefined;
    else if (key === 'ratioMode')
      value = ['auto', 'manual'].includes(raw) ? raw : undefined;
    else if (key === 'baseBand')
      value = ['under1000', 'under5000', 'over5000', 'unknown'].includes(raw)
        ? raw
        : undefined;
    else if (key === 'mode')
      value = ['auto', 'manual'].includes(raw) ? raw : undefined;
    else if (key === 'blue')
      value = ['0', '100000', '650000'].includes(raw) ? Number(raw) : undefined;
    else {
      const n = parseMoney(raw);
      value = n;
      if (n !== undefined) {
        if (
          (key === 'b2b' || key === 'discount') &&
          (n > 100 || !Number.isInteger(n))
        )
          value = undefined;
        if (key === 'deem' && ![0.4, 0.5, 0.6, 0.7, 0.8, 0.9].includes(n))
          value = undefined;
        if (key === 'ratio' && n > 1) value = undefined;
        if (
          key === 'taxYear' &&
          ![2026, 2027, 2028, 2029, 2030, 2031].includes(n)
        )
          value = undefined;
      }
    }
    if (value === undefined)
      errors[key] =
        key === 'ratio'
          ? '0〜100%で入力してください（小数は2桁まで）。'
          : key === 'b2b' || key === 'discount'
            ? '0〜100の整数で指定してください。'
            : [
                  'blue',
                  'age40',
                  'jigyo',
                  'mode',
                  'deem',
                  'ratio',
                  'taxYear',
                  'baseEligible',
                  'registeredFromExempt',
                  'specialExcluded',
                  'baseBand',
                  'ratioMode',
                ].includes(key)
              ? '表示されている選択肢から選んでください。'
              : '0〜100,000の数値を入力してください（小数は4桁まで）。';
    else Object.assign(state, { [key]: value });
  }
  if (kind === 'invoice') {
    if (!query.has('ratioMode'))
      state.ratioMode = query.has('ratio') ? 'manual' : 'auto';
    if (!query.has('baseBand') && query.has('baseEligible'))
      state.baseBand = state.baseEligible ? 'under1000' : 'unknown';
    state.baseEligible = state.baseBand === 'under1000';
    if (state.ratioMode === 'auto')
      state.ratio = transitionForYear(state.taxYear).ratio;
  }
  return { state, errors };
}
export function serializeState(kind: ToolKind, state: ToolState): string {
  const query = new URLSearchParams();
  for (const key of stateKeys[kind])
    query.set(
      key,
      typeof state[key] === 'boolean'
        ? state[key]
          ? '1'
          : '0'
        : String(state[key]),
    );
  return query.toString();
}
