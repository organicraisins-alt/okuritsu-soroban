import { expect, it } from 'vitest';
import { shareUrl, xIntent } from '../src/lib/tools/share';
it('共有URLはqueryを保持しcanonical用pathと分ける', () => {
  const url = shareUrl(
    'https://okuritsu-soroban.com/tools/tedori/#main',
    new URLSearchParams('sales=800&exp=150'),
  );
  expect(new URL(url).searchParams.get('sales')).toBe('800');
  expect(new URL(url).hash).toBe('');
});
it('投稿画面のURLに本文と共有先を正しく符号化する', () => {
  const u = new URL(
    xIntent(
      '私の億率は31%でした #億率',
      'https://example.com/?sales=800&exp=150',
    ),
  );
  expect(u.origin).toBe('https://twitter.com');
  expect(u.searchParams.get('text')).toContain('#億率');
  expect(u.searchParams.get('url')).toBe(
    'https://example.com/?sales=800&exp=150',
  );
});
