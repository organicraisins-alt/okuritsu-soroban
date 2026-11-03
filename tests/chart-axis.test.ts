import { it, expect } from 'vitest';
import { niceAxis } from '../src/lib/okuritsu/axis';
it('1.1億円の範囲は2,000万円刻みで上まで覆う', () => {
  expect(niceAxis(110000000)).toEqual({
    step: 20000000,
    max: 120000000,
    ticks: [0, 20000000, 40000000, 60000000, 80000000, 100000000, 120000000],
  });
});
it('大きい範囲でも等間隔の切りのよい目盛りを作る', () => {
  const r = niceAxis(164458000);
  expect(r.step).toBe(50000000);
  expect(r.max).toBeGreaterThanOrEqual(164458000);
  expect(r.ticks.at(-1)).toBe(r.max);
  expect(() => niceAxis(Infinity)).toThrow();
});
