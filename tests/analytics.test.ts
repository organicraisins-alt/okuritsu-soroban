import { expect, it } from 'vitest';
import { runInNewContext } from 'node:vm';
import { analyticsBootstrap } from '../config/analytics.mjs';
it('GA4に入力クエリとハッシュを送信しない', () => {
  const window: { dataLayer?: IArguments[] } = {};
  runInNewContext(analyticsBootstrap('G-ABC123'), {
    window,
    location: {
      origin: 'https://soroban.example',
      pathname: '/tools/tedori/',
      search: '?sales=800&exp=150',
      hash: '#result',
    },
    document: { referrer: 'https://soroban.example/?sales=900#private' },
    URL,
  });
  const calls = window.dataLayer!.map((args) => Array.from(args));
  expect(calls[1]).toEqual([
    'config',
    'G-ABC123',
    {
      send_page_view: false,
      page_location: 'https://soroban.example/tools/tedori/',
      page_referrer: 'https://soroban.example/',
      allow_google_signals: false,
    },
  ]);
  expect(calls[2]![0]).toBe('event');
  expect(JSON.stringify(calls)).not.toMatch(/sales|exp=|private|result/);
});
it('参照元がない場合にも実行できる', () => {
  const window: { dataLayer?: IArguments[] } = {};
  expect(() =>
    runInNewContext(analyticsBootstrap('G-ABC123'), {
      window,
      location: { origin: 'https://soroban.example', pathname: '/' },
      document: { referrer: '' },
      URL,
    }),
  ).not.toThrow();
});
