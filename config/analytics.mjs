import { analyticsId } from './site.mjs';
/** @param {string} value */
export function analyticsBootstrap(value) {
  const id = analyticsId(value);
  if (!id) throw new Error('GA4の測定IDが必要です。');
  return `(function(){
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    gtag('js', new Date());
    const cleanLocation = location.origin + location.pathname;
    let cleanReferrer = '';
    try { const ref = new URL(document.referrer); cleanReferrer = ref.origin + ref.pathname; } catch {}
    gtag('config', ${JSON.stringify(id)}, {send_page_view:false, page_location:cleanLocation, page_referrer:cleanReferrer, allow_google_signals:false});
    gtag('event', 'page_view', {page_location:cleanLocation, page_referrer:cleanReferrer});
  })();`;
}
