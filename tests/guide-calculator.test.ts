import { expect, it } from 'vitest';
import { guideExample } from '../src/lib/tax/guide';
it('ガイドの月別納付概算と税保険料の年額が一致する', () => {
  const x = guideExample(5000000, 0);
  expect(x.result.total).toBe(3706160);
  expect(x.calendar.total).toBeCloseTo(5000000 - x.result.total, 6);
});
it('ガイドの負の金額や非有限入力を拒否する', () => {
  expect(() => guideExample(-1, 0)).toThrow();
  expect(() => guideExample(NaN, 0)).toThrow();
});
