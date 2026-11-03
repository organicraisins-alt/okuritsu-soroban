import { P, type TaxParams } from './params';
import { assertFinite } from './format';
export type BaseSalesBand = 'under1000' | 'under5000' | 'over5000' | 'unknown';
export interface InvoiceInput {
  sales: number;
  buy: number;
  b2b: number;
  deem: number;
  ratio?: number;
  taxYear?: number;
  baseEligible?: boolean;
  baseBand?: BaseSalesBand;
  registeredFromExempt?: boolean;
  specialExcluded?: boolean;
  discount?: number;
}
export interface InvoiceMethod {
  k: string;
  amt: number;
  ok: boolean;
  note: string;
  tag: string;
  reason?: string;
}
export const invoiceYears = [2026, 2027, 2028, 2029, 2030, 2031] as const;
export const percent = (n: number) =>
  (n * 100).toLocaleString('ja-JP', { maximumFractionDigits: 2 }) + '%';
/** Equal monthly sales, not a statutory annual rate. Effective transaction dates live in params.ts. */
export function transitionForYear(year: number, params: TaxParams = P) {
  if (!Number.isInteger(year) || year < 2026 || year > 2031)
    throw new RangeError('2026〜2031年分を指定してください。');
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = year * 100 + i + 1;
    return [...params.invoice.transitionPeriods]
      .reverse()
      .find((p) => p.start <= date)!.ratio;
  });
  const segments: { from: number; to: number; ratio: number }[] = [];
  months.forEach((ratio, i) => {
    const last = segments.at(-1);
    if (last?.ratio === ratio) last.to = i + 1;
    else segments.push({ from: i + 1, to: i + 1, ratio });
  });
  const ratio =
    Math.round((months.reduce((a, b) => a + b, 0) / 12) * 1e6) / 1e6;
  const periods = segments
    .map(
      (s) =>
        `${s.from === s.to ? s.from : s.from + '〜' + s.to}月${percent(s.ratio)}`,
    )
    .join('・');
  return {
    ratio,
    segments,
    label: `${year}年分の実効値 ${percent(ratio)}（${periods}）`,
  };
}
export function resolvedBaseBand(i: InvoiceInput): BaseSalesBand {
  return i.baseBand ?? (i.baseEligible ? 'under1000' : 'unknown');
}
/** Tax and price-reduction illustration for individual sole traders. */
export function invoice(i: InvoiceInput, params: TaxParams = P) {
  const {
    sales: S,
    buy,
    b2b,
    deem,
    taxYear = 2026,
    registeredFromExempt = false,
    specialExcluded = false,
  } = i;
  const p = params.invoice,
    old = params.version === 'prototype';
  const ratio =
      i.ratio ??
      (old ? p.defaultRatio : transitionForYear(taxYear, params).ratio),
    discount = old ? 1 : (i.discount ?? 1);
  assertFinite(S, buy, b2b, deem, ratio, taxYear, discount);
  if (
    S < 0 ||
    buy < 0 ||
    b2b < 0 ||
    b2b > 1 ||
    ratio < 0 ||
    ratio > 1 ||
    discount < 0 ||
    discount > 1 ||
    deem < 0 ||
    deem > 1
  )
    throw new RangeError('金額は0以上、割合は0〜100%で指定してください。');
  const out = S * p.taxRate,
    band = resolvedBaseBand(i);
  const eligible =
    band === 'under1000' && registeredFromExempt && !specialExcluded;
  const methods: InvoiceMethod[] = [
    {
      k: '2割特例',
      amt: out * p.twoTenths,
      ok: old ? S <= p.specialLimit : taxYear === 2026 && eligible,
      note: '売上の消費税の2割を納めます。個人事業主は2026年分の申告まで使えます。',
      tag: '2026年分まで',
    },
    {
      k: '3割特例',
      amt: out * p.threeTenths,
      ok: old
        ? S <= p.specialLimit
        : p.specialYears.includes(taxYear) && eligible,
      note: old
        ? '2027・2028年分に個人事業主向けに予定されている特例です。最新の情報を確認してください。'
        : '令和9・10年分の個人事業者が対象です。基準期間の売上と登録経緯・除外条件から判定しています。',
      tag: old ? '2027年〜予定' : '2027・2028年分',
    },
    {
      k: '簡易課税',
      amt: out * (1 - deem),
      ok: old
        ? S <= p.simpleLimit
        : band === 'under1000' || band === 'under5000',
      note: `業種ごとの「みなし仕入率」（${Math.round(deem * 100)}%）で計算します。事前に税務署への届出が必要です。`,
      tag: '届出が必要',
    },
    {
      k: '本則課税',
      amt: Math.max(0, out - buy * p.taxRate),
      ok: true,
      note: '実際に払った消費税を差し引きます。経費の多い業種に向いています。',
      tag: '原則の方法',
    },
  ];
  if (!old)
    for (const m of methods) {
      m.amt = Math.round(m.amt);
      m.reason = m.ok
        ? ''
        : (m.k === '2割特例' && taxYear !== 2026) ||
            (m.k === '3割特例' && !p.specialYears.includes(taxYear))
          ? 'この年分は対象外'
          : band === 'unknown'
            ? '対象外（基準期間の売上が未確認）'
            : m.k === '簡易課税'
              ? '対象外（基準期間の課税売上が5,000万円超）'
              : band !== 'under1000'
                ? '対象外（基準期間の課税売上が1,000万円超）'
                : !registeredFromExempt
                  ? '対象外（免税からのインボイス登録以外）'
                  : '対象外（資産取得などの除外条件あり）';
    }
  const available = methods.filter((x) => x.ok && (!old || x.k !== '3割特例'));
  const best = available.reduce((a, b) => (b.amt < a.amt ? b : a));
  const rawCut = old
      ? S * b2b * p.taxRate * (1 - ratio)
      : out * b2b * (1 - ratio) * discount,
    cut = old ? rawCut : Math.round(rawCut);
  const gross = old ? S * (1 + p.taxRate) : Math.round(S * (1 + p.taxRate));
  const regKeep = gross - best.amt,
    noKeep = gross - cut;
  // The frozen profile must retain the exact prototype return shape and precision.
  return {
    out,
    methods,
    best,
    cut,
    regKeep,
    noKeep,
    regWin: regKeep >= noKeep,
  };
}
export function analyzeInvoice(i: InvoiceInput) {
  const r = invoice(i),
    taxYear = i.taxYear ?? 2026,
    ratio = i.ratio ?? transitionForYear(taxYear).ratio,
    discount = i.discount ?? 1;
  const band = resolvedBaseBand(i),
    canCompare =
      band === 'under1000' &&
      Boolean(i.registeredFromExempt) &&
      !i.specialExcluded;
  const maxReduction = r.out * (1 - ratio);
  const threshold = (denominator: number) =>
    denominator > 0 ? r.best.amt / denominator : null;
  return {
    ...r,
    taxYear,
    ratio,
    discount,
    canCompare,
    difference: r.regKeep - r.noKeep,
    noDiscountDifference: -r.best.amt,
    b2bThreshold: threshold(maxReduction * discount),
    discountThreshold: threshold(maxReduction * i.b2b),
    purchaseTax: i.buy * P.invoice.taxRate,
    gross: Math.round(i.sales * (1 + P.invoice.taxRate)),
    comparisonReason: canCompare
      ? ''
      : band === 'unknown'
        ? '基準期間の課税売上を確認すると、登録の比較ができます。'
        : band !== 'under1000'
          ? '基準期間の課税売上が1,000万円を超えるため、非登録でも原則として納税が必要です。免税を前提とした登録比較は行いません。'
          : '登録理由・資産取得等の条件により非登録でも課税となる可能性があります。免税を前提とした比較は行いません。',
  };
}
export function invoiceYearSeries(i: InvoiceInput) {
  return invoiceYears.map((taxYear) =>
    analyzeInvoice({ ...i, taxYear, ratio: undefined }),
  );
}
