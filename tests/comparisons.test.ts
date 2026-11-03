import { it, expect } from 'vitest';
import {
  reformComparison,
  voluntaryComparison,
} from '../src/lib/tax/comparisons';
it('新旧比較で既知の利益500万円の差を保持する', () => {
  expect(reformComparison().find((r) => r.profit === 5000000)).toMatchObject({
    old: 3713160,
    current: 3706160,
    difference: -7000,
  });
});
it('任意継続は標準報酬上限と介護率を適用する', () => {
  expect(voluntaryComparison(5000000, 500000, false).voluntary).toBe(387072);
  expect(voluntaryComparison(5000000, 320000, true).voluntary).toBe(449280);
  expect(() => voluntaryComparison(0, 0, false)).toThrow();
});
