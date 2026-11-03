import type { invoiceYearSeries } from '../tax/invoice';
import { niceAxis, axisLabel } from '../okuritsu/axis';
import { yen } from '../tax/format';
type Series = ReturnType<typeof invoiceYearSeries>;
export function invoiceYearChart(series: Series) {
  const maxValue = Math.max(
    ...series.flatMap((r) => [r.best.amt, r.canCompare ? r.cut : 0]),
  );
  if (maxValue === 0)
    return '<p class="hint">表示対象の金額は0円です。各年の適用条件は下の表で確認できます。</p>';
  const axis = niceAxis(maxValue * 1.1),
    left = 70,
    right = 620,
    top = 20,
    bottom = 225;
  const y = (v: number) => bottom - ((bottom - top) * v) / axis.max;
  const x = (index: number) =>
    left + ((index + 0.5) * (right - left)) / series.length;
  return `<figure class="invoice-year-chart"><div class="invoice-chart-legend"><span><i class="registered"></i>登録：納める消費税</span><span><i class="unregistered"></i>非登録：値下げ目安</span></div><svg viewBox="0 0 640 290" role="img" aria-label="2026〜2031年の納税額と値下げ額の比較。小さい側ほど多く残る試算です。正確な数値は下の表で確認できます。"><title>登録時の消費税と非登録時の値下げ目安</title><desc>各年とも同じ売上と条件です。登録時の最安税額は2割特例・3割特例・簡易課税・本則課税のうち利用可能な方法で計算。非登録が免税とならない条件では値下げの棒は表示しません。</desc>${axis.ticks.map((t) => `<line x1="${left}" x2="${right}" y1="${y(t)}" y2="${y(t)}" stroke="var(--rule)"/><text x="${left - 8}" y="${y(t) + 4}" text-anchor="end">${axisLabel(t)}</text>`).join('')}${series.map((r, index) => `<g><rect x="${x(index) - 20}" y="${y(r.best.amt)}" width="18" height="${bottom - y(r.best.amt)}" fill="var(--ai)"><title>${r.taxYear}年の納税額 ${yen(r.best.amt)}</title></rect>${r.canCompare ? `<rect x="${x(index) + 2}" y="${y(r.cut)}" width="18" height="${bottom - y(r.cut)}" fill="var(--accent)"><title>${r.taxYear}年の値下げ目安 ${yen(r.cut)}</title></rect>` : ''}<text x="${x(index)}" y="249" text-anchor="middle">${r.taxYear}</text>${r.canCompare && index > 0 && r.difference * series[index - 1]!.difference < 0 ? `<text class="turn-label" x="${x(index)}" y="270" text-anchor="middle">損得切替</text>` : ''}</g>`).join('')}</svg><figcaption>金額が小さい側ほど多く残る比較です。損得が切り替わる年を表でも強調しています。</figcaption></figure>`;
}
