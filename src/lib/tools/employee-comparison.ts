import { employeeComparison } from '../tax/content';
import { yen, man } from '../tax/format';
import { rows } from './markup';
export function renderEmployeeComparison(gross: number, ratio: number) {
  const m = employeeComparison(gross, ratio),
    e = m.employee,
    s = m.sole;
  return `<section class="headline"><h2>同じ手取りを目指すフリーランスの年間売上</h2><div class="big">${yen(m.sales)}</div><div class="subs"><span>経費率 <b>${(ratio * 100).toLocaleString('ja-JP')}%</b></span><span>売上から引く経費 <b>${yen(m.expenses)}</b></span><span>必要な利益 <b>${yen(m.profit)}</b></span></div><p>会社員年収${man(gross)}の手取り${yen(e.total)}に対して、フリーランス側は${yen(s.total)}となる売上を試算しました。</p><p class="assumptions">売上は1,000円単位で切り上げた目安です。所得控除の境目も考慮しますが、厳密な最小売上や同じ保障を保証するものではありません。</p><a class="primary-link" href="/tools/tedori/?sales=${m.sales / 10000}&exp=${Math.round(m.expenses) / 10000}">この売上・経費を手取りツールへ引き継ぐ →</a></section><div class="compare"><section class="col"><h2>会社員</h2>${rows(
    [
      ['額面年収', gross],
      ['健康保険・子ども支援金', -e.health],
      ['厚生年金', -e.pension],
      ['雇用保険', -e.employment],
      ['所得税', -e.it],
      ['住民税', -e.rt],
      ['年間の手取り', e.total],
    ],
  )}</section><section class="col"><h2>フリーランス</h2>${rows([
    ['売上', m.sales],
    ['経費', -m.expenses],
    ['利益', m.profit],
    ['所得税', -s.it],
    ['住民税', -s.rt],
    ['国民健康保険', -s.kk],
    ['国民年金', -s.pn],
    ['個人事業税', -s.jg],
    ['年間の手取り', s.total],
  ])}</section></div><p class="assumptions">会社員の社会保険は合計後に円単位で丸めています。40歳未満・賞与なし・扶養なしを想定し、標準報酬の等級や税額の調整は簡略化しています。フリーランスは青色65万円控除、個人事業税ありで計算しています。消費税は含みません。</p>`;
}
