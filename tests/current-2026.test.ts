import { expect, it } from 'vitest';
import { P } from '../src/lib/tax/params';
import { kokuho, kokuhoBreakdown, salaryDed } from '../src/lib/tax/sole';
import { invoice } from '../src/lib/tax/invoice';
import { corporationVerdict } from '../src/lib/tax/advice';
it('国保4区分を個別の上限で計算し、介護分は40歳条件で加える', () => {
  expect(kokuho(5_850_000, false)).toBe(640_500);
  const parts = kokuhoBreakdown(30_000_000, true);
  expect(parts.map((p) => p.amount)).toEqual([670000, 260000, 170000, 30000]);
  expect(kokuho(30_000_000, true)).toBe(1130000);
  expect(kokuho(30_000_000, false)).toBe(960000);
});
it('国税庁令和8年給与所得表の最低額と特則・境界を使う', () => {
  expect(salaryDed(2_200_000)).toBe(740_000);
  expect(salaryDed(740_999)).toBe(740_999);
  expect(salaryDed(2_192_999)).toBe(741_999);
  expect(salaryDed(2_193_000)).toBe(740_000);
  expect(salaryDed(2_200_001)).toBe(740_001);
  expect(salaryDed(6_000_000)).toBe(1_640_000);
});
it('比較の±30万円境界は中立域を厳密に区別する', () => {
  expect(P.corporationNeutralThreshold).toBe(300000);
  expect(corporationVerdict(300000).kind).toBe('corp');
  expect(corporationVerdict(299999).kind).toBe('neutral');
  expect(corporationVerdict(-299999).kind).toBe('neutral');
  expect(corporationVerdict(-300000).kind).toBe('sole');
});
it('3割特例は当年売上ではなく基準期間と登録理由・除外条件・対象年で判定する', () => {
  const input = {
    sales: 12_000_000,
    buy: 800_000,
    b2b: 0.9,
    deem: 0.5,
    ratio: 0.7,
    taxYear: 2027,
    baseEligible: true,
    registeredFromExempt: true,
    specialExcluded: false,
  };
  expect(invoice(input).methods[1]!.ok).toBe(true);
  expect(invoice({ ...input, baseEligible: false }).methods[1]!.ok).toBe(false);
  expect(invoice({ ...input, taxYear: 2026 }).methods[1]!.ok).toBe(false);
  expect(
    invoice({ ...input, registeredFromExempt: false }).methods[1]!.ok,
  ).toBe(false);
  expect(invoice({ ...input, specialExcluded: true }).methods[1]!.ok).toBe(
    false,
  );
  expect(invoice(input).best.k).toBe('3割特例');
});
