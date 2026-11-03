import { expect, it } from 'vitest';
import { parameterRows } from '../src/lib/tax/sources';
import {
  currentCases,
  legacyCases,
  evaluateCase,
} from '../src/lib/tax/regression-cases';
import { P } from '../src/lib/tax/params';
import { legacyParams } from '../src/lib/tax/legacy-profile';
it('公表する料率はparamsの値と出典を参照する', () => {
  const rows = parameterRows();
  expect(rows.find((x) => x.key === 'health')?.raw).toBe(P.health);
  expect(rows.find((x) => x.key === 'kk.medical.cap')?.raw).toBe(
    P.kk.medical.cap,
  );
  expect(rows.every((x) => x.period && x.source)).toBe(true);
});
it('公開回帰ケースとテストが同じデータを使う', () => {
  expect(currentCases).toHaveLength(6);
  expect(legacyCases).toHaveLength(6);
  for (const c of currentCases) expect(evaluateCase(c, P)).toEqual(c.expected);
  for (const c of legacyCases)
    expect(evaluateCase(c, legacyParams)).toEqual(c.expected);
});
