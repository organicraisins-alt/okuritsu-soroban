import { expect, it } from 'vitest';
import {
  basicIT,
  basicRT,
  incomeTaxRaw,
  salaryDed,
  personalTax,
  kokuho,
  sole,
} from './helpers/legacy';
import { corpTax, corp, bestCorp } from './helpers/legacy';
import { employee, employeeEquivalent } from './helpers/legacy';
import { yen, man } from '../src/lib/tax/format';
import { prototype as ref } from './helpers/prototype';

it.each([
  [4_890_000, 1_040_000, 670_000],
  [6_550_000, 670_000, 620_000],
  [23_500_000, 620_000, 480_000],
])('基礎控除の境界 %i', (boundary, at, after) => {
  expect(basicIT(boundary - 1)).toBe(at);
  expect(basicIT(boundary)).toBe(at);
  expect(basicIT(boundary + 1)).toBe(after);
});
it('控除・累進税率・給与控除の全境界で元コードと一致する', () => {
  const boundaries = [
    0, 450_000, 740_000, 1_900_000, 1_950_000, 3_300_000, 3_600_000, 4_890_000,
    6_550_000, 6_600_000, 6_950_000, 8_500_000, 9_000_000, 18_000_000,
    23_500_000, 24_000_000, 24_500_000, 25_000_000, 40_000_000,
  ];
  for (const boundary of boundaries)
    for (const delta of [-1, 0, 1]) {
      const n = Math.max(0, boundary + delta);
      expect(basicIT(n)).toBe(ref.basicIT(n));
      expect(basicRT(n)).toBe(ref.basicRT(n));
      expect(incomeTaxRaw(n)).toBe(ref.incomeTaxRaw(n));
      expect(salaryDed(n)).toBe(ref.salaryDed(n));
      expect(personalTax(n, 321_123, 100_000)).toEqual(
        ref.personalTax(n, 321_123, 100_000),
      );
    }
});
it('国保上限・介護分と個人の赤字・青色控除上限・追加控除を維持', () => {
  for (const age40 of [false, true])
    for (const profit of [
      -100_000, 0, 100_000, 650_000, 2_900_000, 4_000_000, 10_000_000,
      30_000_000,
    ]) {
      expect(kokuho(Math.max(0, profit), age40)).toBe(
        ref.kokuho(Math.max(0, profit), age40),
      );
      for (const blue of [0, 100_000, 650_000])
        for (const jigyo of [false, true]) {
          const o = { blue, age40, jigyo, extra: 816_000 };
          expect(sole(profit + 200_000, 200_000, o)).toEqual(
            ref.sole(profit + 200_000, 200_000, o),
          );
        }
    }
});
it('法人税・報酬ゼロ・報酬刻み・赤字・配当課税を維持', () => {
  for (const p of [
    -1, 0, 1, 3_999_999, 4_000_000, 4_000_001, 7_999_999, 8_000_000, 8_000_001,
  ])
    expect(corpTax(p)).toBe(ref.corpTax(p));
  for (const age40 of [false, true])
    for (const s of [0, 300_000, 419_999, 420_000, 6_500_000, 10_000_000]) {
      const o = { age40, fee: 300_000 };
      expect(bestCorp(s, 0, o)).toEqual(ref.bestCorp(s, 0, o));
      for (const r of [0, 120_000, 1_320_000, 6_000_000])
        expect(corp(s, 0, r, o)).toEqual(ref.corp(s, 0, r, o));
    }
});
it('会社員の社保上下限と二分探索の丸めを維持', () => {
  for (const g of [
    0,
    58000 * 12,
    88000 * 12,
    1_900_000,
    6_000_000,
    650000 * 12,
    1390000 * 12,
    30_000_000,
  ])
    expect(employee(g)).toBe(ref.employee(g));
  for (const take of [0, 1_000_000, 4_567_060, 10_000_000])
    expect(employeeEquivalent(take)).toBe(ref.employeeEquivalent(take));
});
it('表示の丸めを維持', () => {
  for (const n of [-1050, -1, 0, 1, 999, 1050, 4_567_060]) {
    expect(yen(n)).toBe(ref.yen(n));
    expect(man(n)).toBe(ref.man(n));
  }
});
it('非有限値は計算を開始せず明示的に拒否する', () => {
  for (const n of [NaN, Infinity, -Infinity]) {
    expect(() =>
      sole(n, 0, { blue: 650000, age40: false, jigyo: true }),
    ).toThrow(RangeError);
    expect(() => bestCorp(n, 0, { age40: false, fee: 300000 })).toThrow(
      RangeError,
    );
    expect(() => employee(n)).toThrow(RangeError);
  }
});
