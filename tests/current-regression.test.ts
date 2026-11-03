import { describe, it, expect } from 'vitest';
import { currentCases, evaluateCase } from '../src/lib/tax/regression-cases';
describe('令和8年度の新6ケース（公開表と共通データ）', () => {
  it.each(currentCases)('$label', (c) =>
    expect(evaluateCase(c)).toEqual(c.expected),
  );
});
