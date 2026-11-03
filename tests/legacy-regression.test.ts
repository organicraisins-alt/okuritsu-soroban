import { describe, it, expect } from 'vitest';
import { legacyCases, evaluateCase } from '../src/lib/tax/regression-cases';
import { legacyParams } from '../src/lib/tax/legacy-profile';
describe('指定の回帰6ケース（円・プロトタイプ互換）', () => {
  it.each(legacyCases)('$label', (c) =>
    expect(evaluateCase(c, legacyParams)).toEqual(c.expected),
  );
});
