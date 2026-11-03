/**
 * All money values are yen. Prototype-compatible estimate, NOT a verified tax filing engine.
 * 2026-10-26: only the first three income-tax basic deduction bands and pension
 * are confirmed for Reiwa 8. Every other number is retained from prototype/index.html.
 * Updating rates alone belongs here; a change in legislation's calculation method
 * also requires implementation and regression-test changes.
 */
export const TAX_PARAMS_BY_YEAR = {
  2026: {
    year: 2026,
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
    // TODO(要確認): NHI rates/caps; keep prototype values, not FY2026-certified.
    kk: {
      rate: 0.0771 + 0.0269,
      flat: 49_100 + 16_500,
      cap: 660_000 + 260_000,
      careRate: 0.0225,
      careFlat: 16_500,
      careCap: 170_000,
      deduction: 430_000,
    },
    // TODO(要確認): Tokyo Kyokai Kenpo, nursing care, child support (combined employer/employee).
    health: 0.0991,
    care: 0.0159,
    kodomo: 0.0023,
    // TODO(要確認): inherited pension/child contribution and remuneration limits.
    kousei: 0.183,
    kyoshutsu: 0.0036,
    healthMin: 58_000,
    healthMax: 1_390_000,
    pensionMin: 88_000,
    pensionMax: 650_000,
    // TODO(要確認): FY2026 employee unemployment-insurance rate.
    employment: 0.0055,
    // TODO(要確認): salary minimum and special addition's applicable income range.
    // Prototype imposes a 740,000 minimum; it does not model a separate 50,000 addition.
    // Reference for later verification: https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1410.htm
    salary: {
      minimum: 740_000,
      bands: [
        [1_900_000, 0, 650_000],
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
    // TODO(要確認): 30% special regime (2027/2028), transitional input credit
    // percentages and effective dates. No automatic year switch; retain prototype assumptions.
    invoice: {
      taxRate: 0.1,
      twoTenths: 0.2,
      threeTenths: 0.3,
      specialLimit: 10_000_000,
      simpleLimit: 50_000_000,
      transitionRatios: [0.8, 0.5, 0],
    },
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
export const TAX_BADGE =
  '令和8年分の所得税改正に対応（一部は令和7年度の料率で概算）';
