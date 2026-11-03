import { sole } from '../tax/sole';
import { employeeEquivalent } from '../tax/employee';
import { yen, man } from '../tax/format';
import { paymentCalendar } from '../tax/calendar';
import { calculationSteps, taxTips } from '../tax/advice';
import { offerKeys } from '../../data/offers';
import { assumptions, renderPR } from './markup';
import type { ToolState } from './state';
import { disclosure, helpMarkup } from '../ui/markup';
export function renderTedori(s: ToolState) {
  const S = s.sales * 10000,
    E = s.exp * 10000,
    o = {
      blue: s.blue,
      extra: s.extra * 10000,
      age40: s.age40,
      jigyo: s.jigyo,
    };
  const r = sole(S, E, o),
    burden = r.kk + r.pn + r.it + r.rt + r.jg;
  const segs: [string, number, string][] = [
    ['経費', E, '--seg-exp'],
    ['所得税', r.it, '--seg-it'],
    ['住民税', r.rt, '--seg-rt'],
    ['国民健康保険', r.kk, '--seg-kk'],
    ['国民年金', r.pn, '--seg-pn'],
    ['個人事業税', r.jg, '--seg-jg'],
    ['手取り', Math.max(0, r.total), '--take'],
  ];
  const total = segs.reduce((a, b) => a + b[1], 0) || 1,
    tips = taxTips(S, E, o),
    cal = paymentCalendar(r);
  const breakdown = `<dl class="legend">${segs.map((seg) => `<div style="--c:var(${seg[2]})"><dt><span>${seg[0]}</span></dt><dd>${yen(seg[1])}</dd></div>`).join('')}</dl><div class="subs"><span>売上に対する手取り率 <b>${S > 0 ? ((r.total / S) * 100).toFixed(1) + '%' : '—'}</b></span><span>同じ手取りになる会社員年収 <b>${r.total > 0 ? man(employeeEquivalent(r.total)) : '—'}</b></span></div>`;
  const tipBody = `<div class="tips">${tips.map((t) => `<div class="tip"><span class="gain">+${man(t.gain)}/年</span><strong>${t.title}</strong><p>${t.body}</p></div>`).join('')}</div><p class="assumptions">掛金は将来の資産なので、手取りから差し引いていません。上記は税負担が減る分で、自由に使える現金の増加ではありません。</p>`;
  const steps = `<p>税金は、売上から経費や控除を差し引いた後の金額で計算します。</p><div class="steps">${calculationSteps(
    S,
    E,
    o,
  )
    .map(
      (step) =>
        `<div class="step"><span>${step.label}<small>${step.note}</small></span><b>${step.amount < 0 ? '−' + yen(-step.amount) : yen(step.amount)}</b></div>`,
    )
    .join('')}</div>`;
  const calendar = `<p>同じ程度の所得が続く場合の月別の概算です。実際の納期・通知額と異なることがあります。</p><div class="cal">${cal.months.map((m) => `<div class="mon ${m.month === cal.peakMonth ? 'peak' : ''}"><div class="m">${m.month}月${m.month === cal.peakMonth ? '<span class="tag warn">いちばん多い月</span>' : ''}</div><div class="amt">${yen(m.amt)}</div><ul>${m.items.map((i) => `<li>${i.label} ${i.display}</li>`).join('')}</ul></div>`).join('')}</div><p class="assumptions">国保は6月〜翌3月、住民税は6・8・10・翌1月の分納を仮定。予定納税の判定・支払額は簡略化しています。独立1年目の実請求や消費税は含みません。</p>`;
  return `<div class="headline result-primary"><div class="field-label"><span class="kicker">年間の手取り</span>${helpMarkup('takehome-help', '手取り', '税金・国保・年金・個人事業税を支払った後、iDeCo・共済の掛金を支出する前の金額です。売上から経費も差し引いています。')}</div><div class="big" data-result-total>${Math.round(r.total).toLocaleString('ja-JP')}<small>円</small></div><div class="metric-grid"><div><span>月あたり</span><b>${yen(r.total / 12)}</b></div><div><span>税金・保険料</span><b>${yen(burden)}<small>／年</small></b></div></div>${s.extra > 0 ? `<p class="metric-note">表示は掛金支出前です。掛金年${man(s.extra * 10000)}は、ここから支払います。</p>` : ''}<div class="bar" aria-hidden="true">${segs.map((seg) => `<i style="width:${(seg[1] / total) * 100}%;background:var(${seg[2]})"></i>`).join('')}</div>${assumptions}</div>${disclosure('tax-breakdown', '税金・保険料の内訳', breakdown)}${tips.length ? disclosure('tax-tips', '手取りを増やす選択肢', tipBody) : ''}${disclosure('shikumi', '手取りが決まるしくみ', steps)}${disclosure('calendar', '支払いカレンダー', calendar)}${disclosure('related-services', 'PR｜関連サービス（準備中）', renderPR(offerKeys('tedori', s.blue, r.profit)))}`;
}
