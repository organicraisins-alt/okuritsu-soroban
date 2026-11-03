export function eventPayload(event: string, page: string) {
  if (
    !['okuritsu_calculate', 'share_click'].includes(event) ||
    !['home', 'okuritsu', 'tedori', 'income', 'other'].includes(page)
  )
    return undefined;
  // The event location is deliberately the root, not an input URL or an income amount route.
  return [
    'event',
    event,
    { page_type: page, page_location: '/', page_referrer: '' },
  ] as const;
}
export function trackEvent(event: string, page: string) {
  if (!import.meta.env.PUBLIC_GA_ID) return;
  const payload = eventPayload(event, page);
  if (!payload) return;
  const browser = window as Window & { dataLayer?: unknown[] };
  browser.dataLayer ??= [];
  browser.dataLayer.push([
    payload[0],
    payload[1],
    { ...payload[2], page_location: location.origin + '/' },
  ]);
}
