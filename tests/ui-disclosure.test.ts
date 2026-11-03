import { expect, it } from 'vitest';
import { helpMarkup, disclosure } from '../src/lib/ui/markup';
import { describeConditions } from '../src/lib/ui/conditions';
import { defaults } from '../src/lib/tools/state';

it('補足は名前付きのボタンから開き、本文をHTMLとして解釈しない', () => {
  const html = helpMarkup(
    'expense-help',
    '経費',
    '<img src=x onerror=alert(1)>',
  );
  expect(html).toContain('type="button"');
  expect(html).toContain('aria-label="経費の説明"');
  expect(html).toContain('aria-controls="expense-help"');
  expect(html).toContain('aria-expanded="false"');
  expect(html).toContain('id="expense-help" hidden');
  expect(html).not.toContain('<img');
  expect(html).toContain('&lt;img');
});

it('折りたたみを開かずに、復元した控除・年齢・事業税の条件がわかる', () => {
  const text = describeConditions('tedori', {
    ...defaults.tedori,
    blue: 0,
    age40: true,
    jigyo: false,
    extra: 84,
  });
  expect(text).toContain('白色');
  expect(text).toContain('介護分あり');
  expect(text).toContain('事業税なし');
  expect(text).toContain('84万円');
  expect(text).not.toContain('青色65万円');
});

it('特例の対象外条件も隠れた入力のままにせず要約へ表示する', () => {
  const text = describeConditions('invoice', {
    ...defaults.invoice,
    baseEligible: false,
    baseBand: 'unknown',
    ratioMode: 'manual',
    specialExcluded: true,
    ratio: 0.5,
    deem: 0.9,
  });
  expect(text).toContain('1,000万円超');
  expect(text).toContain('除外条件あり');
  expect(text).toContain('50%');
  expect(text).toContain('みなし仕入率90%');
});

it('折りたたみは閉じた状態でもアンカーと説明データを保持する', () => {
  const html = disclosure('calendar', '支払いの予定', '<p>6月の支払い</p>');
  expect(html).toContain('id="calendar"');
  expect(html).toContain('<summary>');
  expect(html).not.toMatch(/<details[^>]*\sopen/);
  expect(html).toContain('<p>6月の支払い</p>');
});

it('非表示の仮広告から空の折りたたみを作らない', () => {
  expect(disclosure('ads', 'PR｜関連サービス', '')).toBe('');
});
