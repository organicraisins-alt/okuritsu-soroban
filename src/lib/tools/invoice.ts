import {
  analyzeInvoice,
  invoiceYearSeries,
  percent,
  type InvoiceInput,
} from '../tax/invoice';
import { P } from '../tax/params';
import { yen } from '../tax/format';
import { escapeHtml, renderPR } from './markup';
import type { ToolState } from './state';
import { invoiceInputFromState } from './invoice-state';
import { disclosure } from '../ui/markup';
import { invoiceYearChart } from './invoice-chart';
const source =
  'https://www.nta.go.jp/taxes/shiraberu/zeimokubetsu/shohi/keigenzeiritsu/invoice-review/index.htm';
const simpleSource =
  'https://www.nta.go.jp/taxes/shiraberu/taxanswer/shohi/6505.htm';
const thresholdText = (n: number | null, zeroTax: boolean) =>
  n === null
    ? zeroTax
      ? '登録時の納税額が0円のため、値下げがなければ同額です。'
      : 'この条件では分岐点がありません。'
    : n > 1
      ? `分岐点は${percent(n)}。100%以内では登録しない方が多く残る試算です。`
      : `約${percent(n)}が分岐点。それを超えると登録した方が多く残る試算です。`;
function yearTable(input: InvoiceInput) {
  const series = invoiceYearSeries(input);
  return `<section class="block invoice-years" aria-labelledby="invoice-years-title"><span class="section-label">制度が変わると、差はどう動く？</span><h2 id="invoice-years-title">2026〜2031年の比較</h2><p class="hint">各年で同じ売上・経費・適用条件を仮定。経過措置は年分ごとの自動値を使います。手動上書きは選択中の年分だけに適用します。</p>${invoiceYearChart(series)}<table class="invoice-year-table"><caption class="sr-only">各年の登録時の最安税額と非登録時の値下げ目安。金額が小さい側が有利です。</caption><thead><tr><th>年分</th><th>登録：最安税額</th><th>非登録：値下げ</th><th>差額・有利な側</th></tr></thead><tbody>${series
    .map((r, index) => {
      const turn =
        r.canCompare &&
        index > 0 &&
        series[index - 1]!.difference * r.difference < 0;
      return `<tr class="${turn ? 'year-turn' : ''}"><th scope="row">${r.taxYear}年${turn ? '<small>損得が切り替わる年</small>' : ''}<small>実効割合 ${percent(r.ratio)}</small></th><td data-label="登録の納税額">${yen(r.best.amt)}<small>${r.best.k}</small></td><td data-label="非登録の値下げ">${r.canCompare ? yen(r.cut) : '比較対象外'}</td><td data-label="差額・有利な側">${!r.canCompare ? '判定なし' : r.difference === 0 ? '同額' : `${r.difference > 0 ? '登録' : '非登録'}が ${yen(Math.abs(r.difference))}有利`}</td></tr>`;
    })
    .join('')}</tbody></table></section>`;
}
export function renderInvoice(s: ToolState) {
  const input = invoiceInputFromState(s),
    r = analyzeInvoice(input);
  const title = !r.canCompare
    ? '登録しない場合の比較は対象外'
    : r.difference > 0
      ? '登録した方が'
      : r.difference < 0
        ? '登録しない方が'
        : 'この条件では同額です';
  const resultPhrase = !r.canCompare
    ? r.comparisonReason
    : r.difference === 0
      ? '登録・非登録の差額は0円です。'
      : `${title}、年${yen(Math.abs(r.difference))}多く残る試算です。`;
  const formula = (key: string, amount: number) =>
    key === '本則課税'
      ? `max（0, ${yen(r.out)} − ${yen(r.purchaseTax)}）＝ ${yen(amount)}`
      : `${yen(r.out)} × ${key === '2割特例' ? percent(P.invoice.twoTenths) : key === '3割特例' ? percent(P.invoice.threeTenths) : percent(1 - s.deem)} ＝ ${yen(amount)}`;
  const winner = (registered: boolean) =>
    r.canCompare && r.difference !== 0 && r.difference > 0 === registered;
  const minTax = r.best.amt;
  return `<div class="invoice-results"><section class="headline invoice-verdict" aria-labelledby="invoice-verdict-title"><span class="section-label">登録する・しないを、同じ売上で比較</span><h2 id="invoice-verdict-title">${title}</h2>${r.canCompare ? `<p class="invoice-difference">${r.difference === 0 ? '' : '年 ＋'}<strong>${yen(Math.abs(r.difference))}</strong>${r.difference === 0 ? '' : '多く残る試算'}</p>` : `<p class="input-error">${r.comparisonReason}</p>`}<p class="hint">${!r.canCompare ? '基準期間の売上・登録理由を詳細設定で確認してください。' : minTax === 0 ? '値下げがない場合は同額です。' : `値下げがない場合：登録しない方が年 ＋${yen(minTax)}`}</p><p class="assumptions">個人事業主向けの概算です。消費税と値下げだけの比較で、経費・所得税・住民税などを差し引いた手取りではありません。</p><button class="inline-source reveal-assumptions" type="button" data-reveal="invoice-assumptions" aria-controls="invoice-assumptions">計算の前提を確認 ↓</button><span class="sr-only" data-live-summary>${resultPhrase} 登録時の最安税額は${r.best.k}、${yen(minTax)}です。</span></section>
 <div class="compare invoice-comparison"><section class="col ${winner(true) ? 'win' : ''}"><h3>登録する ${winner(true) ? `<span class="pill">年 ＋${yen(Math.abs(r.difference))}有利</span>` : ''}</h3><span class="hint">納める消費税（${r.best.k}）</span><div class="total">${yen(minTax)}</div><p class="invoice-flow">税込売上から納税を引いた額 <b>${yen(r.regKeep)}</b></p><span class="assumptions">納税：−${yen(minTax)}</span></section><section class="col ${winner(false) ? 'win' : ''}"><h3>登録しない ${winner(false) ? `<span class="pill">年 ＋${yen(Math.abs(r.difference))}有利</span>` : ''}</h3><span class="hint">値下げを求められた場合の目安</span><div class="total">${r.canCompare ? yen(r.cut) : '比較対象外'}</div>${r.canCompare ? `<p class="invoice-flow">税込売上から値下げを引いた額 <b>${yen(r.noKeep)}</b></p><span class="assumptions">値下げ：−${yen(r.cut)}</span>` : ''}<p class="assumptions">控除できない消費税相当額${percent(1 - r.ratio)}分 × 事業者向け${percent(input.b2b)} × 値下げ要求${percent(r.discount)}。要求率100%は全額を負担する上限目安です。</p></section></div>
 <section class="block invoice-thresholds"><h2>どの条件で損得が変わる？</h2>${r.canCompare ? `<dl><div><dt>事業者向け売上の分岐点</dt><dd>${thresholdText(r.b2bThreshold, minTax === 0)}</dd></div><div><dt>値下げ要求の分岐点</dt><dd>${thresholdText(r.discountThreshold, minTax === 0)}</dd></div></dl><p class="hint">それぞれ他の条件を固定した場合。比率表示の丸めと金額の端数処理により、表示した割合ちょうどでは差が出る場合があります。</p>` : `<p>${r.comparisonReason}</p>`}</section>
 <section class="invoice-methods" aria-labelledby="invoice-methods-title"><div class="section-intro"><span class="section-label">納める消費税を、方法ごとに</span><h2 id="invoice-methods-title">適用できる方法を比較</h2></div><div class="methods">${r.methods.map((m, index) => `<section class="method ${m === r.best ? 'best' : ''} ${m.ok ? '' : 'off'}"><h3>${m.k}<span class="tag ${m === r.best ? 'ok' : 'warn'}">${m === r.best ? '試算上の最安' : m.ok ? m.tag : '対象外'}</span></h3>${m.ok ? `<div class="amt">${yen(m.amt)}</div><p class="method-formula">${formula(m.k, m.amt)}</p>` : `<p class="method-ineligible">${m.reason}</p>`}${disclosure('invoice-method-' + index, '適用条件を確認', `<p>${escapeHtml(m.note)}</p>${m.reason ? `<p>${escapeHtml(m.reason)}</p>` : ''}<a href="${source}" target="_blank" rel="noopener noreferrer">国税庁の適用条件 ↗</a>`)}${m.k === '簡易課税' ? `<p class="method-action">届出が必要です。原則、適用する課税期間の初日の前日まで。2割・3割特例からの翌期移行は、その翌期の申告期限までに提出できる特例があります。</p><a class="inline-source" href="${simpleSource}" target="_blank" rel="noopener noreferrer">届出期限を国税庁で確認 ↗</a>` : ''}</section>`).join('')}</div></section>
 ${yearTable(input)}
 ${disclosure('invoice-assumptions', 'インボイス計算の前提・出典', `<ul><li>個人事業主専用です。3割特例は2027・2028年分のみ。法人は対象外です。</li><li>売上と課税経費は標準税率10%。軽減税率は未対応です。</li><li>本則課税は課税仕入れの全額を控除できる前提。個別対応・一括比例配分や還付は再現しません。</li><li>簡易課税は単一業種。届出とその他の適用制限を別途確認してください。</li><li>経過措置の自動値は毎月の売上が均等の場合の月数按分です。法定の年間一律割合ではありません。</li><li>値下げ額は実際に必ず求められる金額ではなく、控除できない消費税相当額を最大で全額負担した場合の目安です。</li><li>登録しない比較は免税となることが前提。非登録でも基準期間・特定期間等の条件により納税が必要です。</li><li>金額は1円単位に四捨五入した概算で、申告時の端数処理・特例の全要件を再現していません。</li></ul><nav class="guide-nav"><a href="${source}" target="_blank" rel="noopener noreferrer">国税庁・令和8年度インボイス改正</a><a href="${simpleSource}" target="_blank" rel="noopener noreferrer">国税庁・簡易課税</a><a href="/logic/">計算ロジック</a><a href="/about/">運営者情報</a></nav>`)}
 ${renderPR(['invoice', 'soft']) ? disclosure('related-services', 'PR｜請求・会計サービス', renderPR(['invoice', 'soft'])) : ''}</div>`;
}
