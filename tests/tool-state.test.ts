import { expect, it } from 'vitest';
import {
  defaults,
  parseState,
  serializeState,
  parseMoney,
} from '../src/lib/tools/state';
it('URL入力を復元し円ではなく万円の状態で保持する', () => {
  const r = parseState(
    'tedori',
    new URLSearchParams(
      'sales=800&exp=150&blue=100000&age40=1&jigyo=0&extra=12',
    ),
  );
  expect(r.errors).toEqual({});
  expect(r.state).toMatchObject({
    sales: 800,
    exp: 150,
    blue: 100000,
    age40: true,
    jigyo: false,
    extra: 12,
  });
});
it('すべてのツールでURL往復が同じ状態になる', () => {
  for (const kind of ['tedori', 'houjinka', 'invoice'] as const) {
    const state = { ...defaults[kind], sales: 900 };
    expect(
      parseState(kind, new URLSearchParams(serializeState(kind, state))).state,
    ).toEqual(state);
  }
});
it('全角・桁区切りを扱い負値や非数・巨大値を拒否する', () => {
  expect(parseMoney('８００')).toBe(800);
  expect(parseMoney('1,200.5')).toBe(1200.5);
  for (const bad of [
    '-1',
    'NaN',
    'Infinity',
    '800abc',
    '1e6',
    '1.2.3',
    '100001',
    '',
  ])
    expect(parseMoney(bad)).toBeUndefined();
});
it('不正クエリは明示的なエラーとなり既定値に戻る', () => {
  const r = parseState(
    'tedori',
    new URLSearchParams('sales=%3Cscript%3E&blue=999&age40=foo'),
  );
  expect(Object.keys(r.errors)).toEqual(
    expect.arrayContaining(['sales', 'blue', 'age40']),
  );
  expect(r.state.sales).toBe(800);
});
