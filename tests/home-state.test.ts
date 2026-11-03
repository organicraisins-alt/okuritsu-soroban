import { expect, it } from 'vitest';
import { readHomeState, homeStateUrl } from '../src/lib/ui/home-state';

it('トップの円と万円の入力が、再読み込み後も混ざらない', () => {
  let url = new URL('https://example.com/');
  url = homeStateUrl(
    url.href,
    'tedori',
    new URLSearchParams('sales=900&exp=150'),
  );
  url = homeStateUrl(
    url.href,
    'okuritsu',
    new URLSearchParams('sales=8000000&expenses=1500000&age=30'),
  );
  expect(readHomeState(url, 'tedori').get('sales')).toBe('900');
  expect(readHomeState(url, 'okuritsu').get('sales')).toBe('8000000');
  url = homeStateUrl(
    url.href,
    'tedori',
    new URLSearchParams('sales=1000&exp=200'),
  );
  expect(readHomeState(url, 'tedori').get('sales')).toBe('1000');
  expect(readHomeState(url, 'okuritsu').get('sales')).toBe('8000000');
});

it('従来のトップの億率共有URLを保ち、手取り側には読み込ませない', () => {
  const old = new URL('https://example.com/?sales=8000000&expenses=1500000');
  expect(readHomeState(old, 'tedori').size).toBe(0);
  expect(readHomeState(old, 'okuritsu').get('sales')).toBe('8000000');
  const migrated = homeStateUrl(
    old.href,
    'tedori',
    new URLSearchParams('sales=900&exp=150'),
  );
  expect(readHomeState(migrated, 'okuritsu').get('sales')).toBe('8000000');
  expect(readHomeState(migrated, 'tedori').get('sales')).toBe('900');
});
