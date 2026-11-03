import { expect, it } from 'vitest';
import { eventPayload } from '../src/lib/analytics';
it('計算・シェアのイベントは固定分類だけを持つ', () => {
  expect(eventPayload('okuritsu_calculate', 'okuritsu')).toEqual([
    'event',
    'okuritsu_calculate',
    { page_type: 'okuritsu', page_location: '/', page_referrer: '' },
  ]);
  expect(eventPayload('share_click', 'income')).toEqual([
    'event',
    'share_click',
    { page_type: 'income', page_location: '/', page_referrer: '' },
  ]);
  expect(eventPayload('sales=800', 'income')).toBeUndefined();
  expect(eventPayload('share_click', '800')).toBeUndefined();
});

import { vi, afterEach } from 'vitest';
import { trackEvent } from '../src/lib/analytics';
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
it('GA未設定では送らず、有効時も実際のURLや金額を使わない', () => {
  const browser: { dataLayer?: unknown[] } = {};
  vi.stubGlobal('window', browser);
  vi.stubGlobal('location', {
    origin: 'https://okuritsu-soroban.com',
    pathname: '/nenshu/800/',
    search: '?sales=123456&assets=999999',
  });
  vi.stubEnv('PUBLIC_GA_ID', '');
  trackEvent('share_click', 'income');
  expect(browser.dataLayer).toBeUndefined();
  vi.stubEnv('PUBLIC_GA_ID', 'G-TEST');
  trackEvent('share_click', 'income');
  expect(browser.dataLayer).toEqual([
    [
      'event',
      'share_click',
      {
        page_type: 'income',
        page_location: 'https://okuritsu-soroban.com/',
        page_referrer: '',
      },
    ],
  ]);
  expect(JSON.stringify(browser.dataLayer)).not.toMatch(
    /800|sales|assets|123456|999999/,
  );
});
