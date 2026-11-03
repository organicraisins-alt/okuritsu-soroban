import { describe, expect, it } from 'vitest';
import {
  defaults,
  cashFlow,
  simulate,
  stepAssets,
  compareScenarios,
  parseInput,
  parseSimpleInput,
  serializeInput,
} from '../src/lib/okuritsu/model';
import { sole } from '../src/lib/tax/sole';
describe('億率の再現可能な資産形成モデル', () => {
  it('年末積立・運用損失と資産額の下限を適用する', () => {
    expect(stepAssets(100, 0.1, 20)).toBeCloseTo(130);
    expect(stepAssets(100, -2, 20)).toBe(20);
    expect(stepAssets(100, 0, -200)).toBe(0);
  });
  it('幅0・利回り0の手計算と分位点が一致する', () => {
    const r = simulate({
      ...defaults,
      sales: 5000000,
      expenses: 0,
      mean: 0,
      volatility: 0,
    });
    expect(r.points.at(-1)!.p50).toBe(706160 * 30);
    expect(r.probability).toBe(0);
    expect(r.points.every((p) => p.p10 === p.p50 && p.p50 === p.p90)).toBe(
      true,
    );
  });
  it('同じseedで同じ結果、異なるseedで別の推移になる', () => {
    const a = simulate(defaults),
      b = simulate(defaults),
      c = simulate({ ...defaults, seed: 7 });
    expect(a).toEqual(b);
    expect(a.points).not.toEqual(c.points);
    expect(a.points.every((p) => p.p10 <= p.p50 && p.p50 <= p.p90)).toBe(true);
  });
  it('初期資産の到達は運用後の下落に関係なく100%', () => {
    const r = simulate({
      ...defaults,
      assets: 100000000,
      mean: -0.5,
      volatility: 0,
      targetAge: 31,
    });
    expect(r.probability).toBe(100);
    expect(r.medianAge).toBe(30);
    expect(r.points.at(-1)!.p50).toBeLessThan(100000000);
  });
  it('途中到達後の下落でも到達済みとして数える', () => {
    const r = simulate(
      { ...defaults, assets: 99000000, targetAge: 32 },
      {
        returns: new Float64Array(20000).map((_, i) =>
          i % 2 === 0 ? 0.1 : -0.8,
        ),
      },
    );
    expect(r.probability).toBe(100);
    expect(r.points.at(-1)!.p50).toBeLessThan(100000000);
  });
  it('掛金を手取りへ再加算しない', () => {
    const i = { ...defaults, ideco: 816000, kyosai: 840000 },
      r = cashFlow(i);
    const t = sole(i.sales, i.expenses, {
      blue: i.blue,
      age40: false,
      jigyo: true,
      extra: 1656000,
    }).total;
    expect(r.annualContribution).toBe(t - i.living);
    expect(r.freeContribution).toBe(t - i.living - 1656000);
  });
  it('枯渇しても負の資産を運用しない', () => {
    const r = simulate({ ...defaults, sales: 0, expenses: 0, assets: 0 });
    expect(r.points.every((p) => p.p50 === 0)).toBe(true);
    expect(r.shortfallProbability).toBe(100);
  });
  it('差分は同じ乱数で比較し、同じ青色条件は差0', () => {
    const r = compareScenarios(defaults);
    expect(r.changes).toHaveLength(5);
    expect(r.changes[0]!.delta).toBe(0);
    expect(r.changes.at(-1)!.probability).toBeGreaterThanOrEqual(
      r.base.probability,
    );
  });
  it('共有入力はseedも復元し、不正値・過去年齢を拒否する', () => {
    expect(parseInput(serializeInput(defaults)).input).toEqual(defaults);
    for (const query of [
      'age=40&targetAge=30',
      'sales=NaN',
      'volatility=-1',
      'seed=1.1',
      'age=120',
      'blue=5',
      'version=99',
    ])
      expect(
        parseInput(new URLSearchParams(query)).errors.length,
      ).toBeGreaterThan(0);
  });
});

it('トップ簡易版は非表示の詳細条件を引き継がない', () => {
  const r = parseSimpleInput(
    new URLSearchParams(
      'sales=5000000&expenses=0&assets=100000000&living=0&mean=.5&seed=7',
    ),
  );
  expect(r.errors).toEqual([]);
  expect(r.input.sales).toBe(5000000);
  expect(r.input.assets).toBe(0);
  expect(r.input.living).toBe(3000000);
  expect(r.input.mean).toBe(0.04);
  expect(r.input.seed).toBe(7);
});
