import { sole } from '../tax/sole';
import { corp, bestCorp } from '../tax/corp';
import { corporationSeries, corporationVerdict } from '../tax/advice';
import { yen, man } from '../tax/format';
import { offerKeys } from '../../data/offers';
import { rows, assumptions, renderPR } from './markup';
import type { ToolState } from './state';
import { disclosure } from '../ui/markup';
function chart(s: ToolState) {
  const E = s.exp * 10000,
    so = { blue: s.blue, age40: s.age40, jigyo: s.jigyo },
    co = { age40: s.age40, fee: s.fee * 10000 },
    fixed = s.mode === 'manual' ? s.salary * 10000 : null;
  const pts = corporationSeries(E, so, co, fixed),
    W = 640,
    H = 260,
    L = 56,
    T = 30,
    B = 38,
    R = 16;
  const values = pts.map((p) => p.difference),
    max = Math.ceil(Math.max(...values, 500000) / 500000) * 500000,
    min = Math.floor(Math.min(...values, -500000) / 500000) * 500000;
  const X = (p: number) => L + ((p - 2000000) / 23000000) * (W - L - R),
    Y = (v: number) => T + ((max - v) / (max - min)) * (H - T - B);
  let grid = '';
  const step = max - min > 4000000 ? 1000000 : 500000;
  for (let v = Math.ceil(min / step) * step; v <= max; v += step)
    grid += `<line class="${v === 0 ? 'zero' : 'grid'}" x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${L - 6}" y="${Y(v) + 4}" text-anchor="end">${v > 0 ? '+' : ''}${v / 10000}万</text>`;
  for (let p = 5000000; p <= 25000000; p += 5000000)
    grid += `<text x="${X(p)}" y="${H - 12}" text-anchor="middle">${p / 10000}万</text>`;
  const cross = pts.findIndex(
    (p, i) => i > 0 && pts[i - 1]!.difference <= 0 && p.difference > 0,
  );
  if (cross > 0) {
    const a = pts[cross - 1]!,
      b = pts[cross]!,
      p =
        a.profit +
        ((b.profit - a.profit) * -a.difference) / (b.difference - a.difference);
    grid += `<line class="cross" x1="${X(p)}" x2="${X(p)}" y1="${T}" y2="${H - B}"/><text class="cross-lbl" x="${Math.min(X(p) + 6, W - 200)}" y="16">利益 約${Math.round(p / 100000) * 10}万円から法人が得</text>`;
  }
  const points = pts
    .map((p) => `${X(p.profit).toFixed(1)},${Y(p.difference).toFixed(1)}`)
    .join(' ');
  const profit = (s.sales - s.exp) * 10000;
  if (profit >= 2000000 && profit <= 25000000) {
    const c =
        fixed === null
          ? bestCorp(s.sales * 10000, E, co)
          : corp(s.sales * 10000, E, fixed, co),
      v = c.total - sole(s.sales * 10000, E, so).total;
    grid += `<circle class="dot" cx="${X(profit)}" cy="${Y(v)}" r="6"/><text x="${X(profit)}" y="${Math.max(16, Y(v) - 12)}" text-anchor="middle">あなた</text>`;
  }
  return `<section class="chart-box"><h2>利益がいくらから法人化が得になるか</h2><p>上の範囲では法人が有利、下の範囲では個人が有利です。</p><svg class="chart" viewBox="0 0 640 260" role="img" aria-label="利益ごとの法人化の損得。数値一覧は直後の表にあります。">${grid}<polyline class="line" points="${points}"/></svg><details id="corp-values"><summary>グラフの数値を見る</summary><div class="table-scroll"><table class="data plain"><caption>利益ごとの法人化の差額</caption><thead><tr><th scope="col">利益</th><th scope="col">法人化で増える額</th></tr></thead><tbody>${pts.map((p) => `<tr><th scope="row">${man(p.profit)}</th><td>${yen(p.difference)}</td></tr>`).join('')}</tbody></table></div></details></section>`;
}
export function renderHoujinka(s: ToolState) {
  const S = s.sales * 10000,
    E = s.exp * 10000,
    co = { age40: s.age40, fee: s.fee * 10000 },
    a = sole(S, E, { blue: s.blue, age40: s.age40, jigyo: s.jigyo }),
    b =
      s.mode === 'manual'
        ? corp(S, E, s.salary * 10000, co)
        : bestCorp(S, E, co),
    diff = b.total - a.total,
    win = diff > 0;
  const verdict = corporationVerdict(diff);
  return `<div class="verdict ${win ? 'yes' : 'no'}"><strong>${verdict.title}</strong><span>${verdict.note}</span><span class="verdict-context">役員報酬を年${man(b.R)}（月${man(b.R / 12)}）にした場合です。会社の残金をすべて配当で受け取った後の概算です。設立費用は別途かかります。</span></div>${assumptions}<div class="compare"><section class="col ${verdict.kind === 'sole' ? 'win' : ''}"><h2>個人事業主のまま</h2><div class="total">${yen(a.total)}</div>${disclosure(
    'sole-breakdown',
    '個人事業主の内訳',
    rows([
      ['利益（売上−経費）', a.profit],
      ['所得税', -a.it],
      ['住民税', -a.rt],
      ['国民健康保険', -a.kk],
      ['国民年金', -a.pn],
      ['個人事業税', -a.jg],
      ['手取り', a.total],
    ]),
  )}</section><section class="col ${verdict.kind === 'corp' ? 'win' : ''}"><h2>法人化した場合</h2><div class="total">${yen(b.total)}</div>${disclosure(
    'corp-breakdown',
    '法人の内訳',
    rows([
      ['役員報酬', b.R],
      ['社会保険料（本人負担）', -b.emp],
      ['所得税・住民税', -b.it - b.rt],
      ['個人の手取り', b.keep],
      ['会社の利益', b.profit],
      ['法人税など', -b.ct],
      ['会社に残るお金', b.retained],
      ['配当で受け取るときの税', -b.div],
      ['最終的に個人に残るお金', b.total],
    ]),
  )}</section></div>${disclosure('corp-chart', '利益別の損益分岐をグラフで見る', chart(s))}${disclosure('related-services', 'PR｜関連サービス（準備中）', renderPR(offerKeys('houjinka', s.blue, a.profit, win)))}`;
}
