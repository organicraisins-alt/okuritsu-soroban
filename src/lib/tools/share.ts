import { escapeHtml } from './markup';
export function shareUrl(href: string, params: URLSearchParams) {
  const base =
    import.meta.env.PUBLIC_SITE_URL || 'https://okuritsu-soroban.com/';
  const url = new URL(href, base);
  url.search = params.toString();
  url.hash = '';
  return url.href;
}
export function xIntent(text: string, url: string) {
  return (
    'https://twitter.com/intent/tweet?' + new URLSearchParams({ text, url })
  );
}
export function shareMarkup(
  text: string,
  path: string,
  params: URLSearchParams,
) {
  return `<div class="share-block"><a class="btn" data-share-x href="${escapeHtml(xIntent(text, shareUrl(path, params)))}" target="_blank" rel="noopener noreferrer">Xでシェア</a><p class="assumptions">共有URLに入力条件を含みます。金額はX・共有相手・ページ取得時の配信サーバーに伝わります。</p></div>`;
}
