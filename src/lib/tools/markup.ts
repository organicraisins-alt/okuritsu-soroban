import { OFFERS, type OfferKey } from '../../data/offers';
import { yen } from '../tax/format';
export const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );
export const rows = (values: [string, number][]) =>
  `<dl class="rows">${values.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${yen(value === 0 ? 0 : value)}</dd></div>`).join('')}</dl>`;
export const assumptions = `<div class="assumptions-stack"><p class="assumptions">東京23区・単身の概算です。<a href="/logic/">計算の前提</a>／<a href="/about/">運営者情報</a></p><details class="subtle-details" id="calculation-assumptions"><summary>前提と制約を確認</summary><p class="assumptions">正確な税額を保証しません。令和8年分の税制・令和8年度の保険料率を使用。国保の軽減・減免、標準報酬の等級などを簡略化し、扶養なし、入力した年齢・申告方法・事業税の条件で計算しています。</p></details></div>`;
export function renderPR(
  keys: OfferKey[],
  show = import.meta.env.PUBLIC_SHOW_PLACEHOLDER_ADS === 'true',
) {
  if (!show) return '';
  return `<section class="pr" aria-label="広告"><div class="pr-head"><span class="tag">PR</span>この結果に合わせたサービス（仮の広告枠）</div><div class="offers">${keys
    .map((key) => {
      const o = OFFERS[key];
      return `<div class="offer"><div><div class="why">${o.why}</div><strong>${o.title}</strong><p>${o.body}</p></div><a class="btn" href="${o.url}" rel="sponsored noopener" aria-disabled="true" data-placeholder>${o.cta}【PR・準備中】</a></div>`;
    })
    .join('')}</div></section>`;
}
