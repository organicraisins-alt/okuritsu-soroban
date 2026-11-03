/** Reiwa 8 annual-rate estimate. Monetary amounts are yen.
 * Checked 2026-10-26; see docs/params-check.md for official evidence and effective dates.
 * Insurance uses FY2026 rates for 12 months, not calendar-year actual remittances.
 */
export const TAX_PARAMS_BY_YEAR = {
  2026: {
    year: 2026,
    version: '2026',
    corporationNeutralThreshold: 300_000, // Product comparison tolerance, not a statutory threshold.
    // Confirmed: NTA Reiwa 8 basic deduction (first 3 bands).
    // https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1199.htm
    basicIT: [
      [4_890_000, 1_040_000],
      [6_550_000, 670_000],
      [23_500_000, 620_000],
      // TODO(要確認): high-income taper retained from prototype, not newly verified.
      [24_000_000, 480_000],
      [24_500_000, 320_000],
      [25_000_000, 160_000],
      [Infinity, 0],
    ],
    // Confirmed FY2026 monthly amount; prototype uses it for all 12 months,
    // not calendar-year actual payments (Jan-Mar FY2025 would differ).
    // https://www.nenkin.go.jp/service/kokunen/hokenryo/hokenryogaku.files/R8_hokenryou.pdf
    pensionMonthly: 17_920,
    // FY2026 Tokyo wards: single adult, no low-income reductions.
    // https://www.city.shinjuku.lg.jp/hoken/hoken01_001028.html (checked 2026-10-26)
    kk: {
      deduction: 430_000,
      medical: { rate: 0.0751, flat: 47_600, cap: 670_000 },
      support: { rate: 0.028, flat: 17_600, cap: 260_000 },
      care: { rate: 0.0243, flat: 17_800, cap: 170_000 },
      child: { rate: 0.0027, flat: 1_873, cap: 30_000 },
    },
    // FY2026 Tokyo health/care from March, child support from April. Combined employer/employee rates.
    // https://www.kyoukaikenpo.or.jp/~/media/Files/shared/hokenryouritu/r8/ippan/R8_13tokyo.pdf
    health: 0.0985,
    care: 0.0162,
    kodomo: 0.0023,
    // TODO(要確認): inherited pension/child contribution and remuneration limits.
    kousei: 0.183,
    kyoshutsu: 0.0036,
    healthMin: 58_000,
    healthMax: 1_390_000,
    // FY2026 voluntary coverage cap, checked 2026-10-27: https://www.kyoukaikenpo.or.jp/news/r07_dec/1259.html
    voluntaryStandardMax: 320_000,
    pensionMin: 88_000,
    pensionMax: 650_000,
    // FY2026 general business employee share, 2026-04-01 through 2027-03-31.
    // https://www.mhlw.go.jp/content/001692566.pdf (checked 2026-10-26)
    employment: 0.005,
    // Income tax 2026/2027, enacted amounts effective 2026-12-01; not resident-tax-year tables.
    // https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1410.htm (notes 2/3, checked 2026-10-26)
    salary: {
      minimum: 740_000,
      roundingUnit: 4_000,
      roundingBelow: 6_600_000,
      // Below each exclusive bound: taxable salary = gross*multiplier+offset.
      specialIncomeBands: [
        [741_000, 0, 0],
        [2_191_000, 1, -740_000],
        [2_193_000, 0, 1_451_000],
        [2_196_000, 0, 1_453_000],
        [2_200_000, 0, 1_456_000],
      ],
      bands: [
        [2_200_000, 0, 740_000],
        [3_600_000, 0.3, 80_000],
        [6_600_000, 0.2, 440_000],
        [8_500_000, 0.1, 1_100_000],
        [Infinity, 0, 1_950_000],
      ],
    },
    // TODO(要確認): other prototype tax parameters, not newly verified for Reiwa 8.
    // Rate reference: https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm
    incomeBands: [
      [1_950_000, 0.05, 0],
      [3_300_000, 0.1, 97_500],
      [6_950_000, 0.2, 427_500],
      [9_000_000, 0.23, 636_000],
      [18_000_000, 0.33, 1_536_000],
      [40_000_000, 0.4, 2_796_000],
      [Infinity, 0.45, 4_796_000],
    ],
    reconstruction: 1.021,
    basicRT: [
      [24_000_000, 430_000],
      [24_500_000, 290_000],
      [25_000_000, 150_000],
      [Infinity, 0],
    ],
    resident: { threshold: 450_000, rate: 0.1, adjustment: 2_500, flat: 5_000 },
    jigyo: { deduction: 2_900_000, rate: 0.05 },
    corp: {
      flat: 70_000,
      limit: 8_000_000,
      rate: 0.15,
      upperRate: 0.232,
      jigyoLimit: 4_000_000,
      jigyoLow: 0.035,
      jigyoMid: 0.053,
      jigyoHigh: 0.07,
      local: 0.103,
      resident: 0.07,
      specialJigyo: 0.37,
      dividendCredit: 0.128,
      salaryStep: 120_000,
    },
    equivalent: { max: 60_000_000, iterations: 40 },
    // NTA Reiwa 8 reform: 3-tenths is for sole traders in 2027/2028; base-period and registration conditions apply.
    // https://www.nta.go.jp/taxes/shiraberu/zeimokubetsu/shohi/keigenzeiritsu/invoice-review/index.htm
    invoice: {
      taxRate: 0.1,
      twoTenths: 0.2,
      threeTenths: 0.3,
      specialLimit: 10_000_000,
      simpleLimit: 50_000_000,
      transitionRatios: [0.8, 0.7, 0.5, 0.3, 0],
      transitionPeriods: [
        { start: 202310, ratio: 0.8, label: '2023年10月〜2026年9月' },
        { start: 202610, ratio: 0.7, label: '2026年10月〜2028年9月' },
        { start: 202810, ratio: 0.5, label: '2028年10月〜2030年9月' },
        { start: 203010, ratio: 0.3, label: '2030年10月〜2031年9月' },
        { start: 203110, ratio: 0, label: '2031年10月〜' },
      ],
      defaultRatio: 0.7,
      specialYears: [2027, 2028],
    },
    // Contribution assumptions for the phase-3 examples, not combined available-cash benefits.
    // https://www.smrj.go.jp/kyosai/skyosai/  https://www.ideco-koushiki.jp/ (limits are scenario assumptions)
    deductions: { blue: 650_000, smallBusiness: 840_000, ideco: 816_000 },
    // TODO(要確認): prototype calendar is a same-income steady-state estimate,
    // not a first-year forecast or an exact assessment of advance-payment eligibility.
    calendar: {
      advanceThreshold: 150_000,
      nhiMonths: [6, 7, 8, 9, 10, 11, 12, 1, 2, 3],
      residentMonths: [6, 8, 10, 1],
      advanceMonths: [7, 11],
      businessMonths: [8, 11],
      settlementMonth: 3,
    },
  },
} as const;
export const P = TAX_PARAMS_BY_YEAR[2026];
export const TAX_BADGE = '令和8年分の税制・令和8年度の保険料率で計算';

// A parameterized calculation API keeps the frozen prototype profile testable.
type Widen<T> = T extends number
  ? number
  : T extends string
    ? string
    : T extends boolean
      ? boolean
      : { [K in keyof T]: Widen<T[K]> };
export interface LegacyKokuho {
  rate: number;
  flat: number;
  cap: number;
  careRate: number;
  careFlat: number;
  careCap: number;
  deduction: number;
}
type BaseTaxParams = Widen<typeof P>;
export type TaxParams = Omit<BaseTaxParams, 'kk' | 'invoice'> & {
  kk: BaseTaxParams['kk'] | LegacyKokuho;
  invoice: Omit<BaseTaxParams['invoice'], 'transitionRatios'> & {
    transitionRatios: readonly number[];
  };
};
