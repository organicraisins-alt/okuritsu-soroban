import { niceAxis, axisLabel } from './axis';
import {
  GOAL,
  type Point,
  type OkuritsuInput,
  type Simulation,
  compareScenarios,
  simulate,
  serializeInput,
} from './model';
import { shareMarkup } from '../tools/share';
import { yen, man } from '../tax/format';
import { escapeHtml } from '../tools/markup';
import { disclosure, helpMarkup } from '../ui/markup';
export const investmentNotice =
  'シミュレーションであり、将来の運用成果を保証するものではありません。投資の判断はご自身で行ってください';
export const modelAssumptions =
  '手取り・生活費・税制と入力時の年齢条件を毎年固定し、物価上昇・昇給・将来の制度変更は反映しません。東京23区・単身・扶養なし・事業税あり。掛金は所得控除に反映し、資産への二重加算はしません。全資産に同じ仮定の利回りを適用し、共済の実際の給付、引出制限、受取課税、運用益への税・手数料は再現しません。';
export function chart(points: Point[]) {
  const w = 720,
    h = 320,
    left = 90,
    right = 690,
    top = 26,
    bottom = 260,
    axis = niceAxis(Math.max(GOAL, ...points.map((p) => p.p90)) * 1.1),
    max = axis.max;
  const x = (i: number) =>
      left + ((right - left) * i) / Math.max(1, points.length - 1),
    y = (v: number) => bottom - ((bottom - top) * v) / max;
  const line = (key: 'p10' | 'p50' | 'p90') =>
    points
      .map((p, i) => `${x(i).toFixed(2)},${y(p[key]).toFixed(2)}`)
      .join(' ');
  const band =
    line('p90') +
    ' ' +
    points
      .map((p, i) => `${x(i).toFixed(2)},${y(p.p10).toFixed(2)}`)
      .reverse()
      .join(' ');
  return `<figure class="asset-chart"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="年齢別の資産推移。帯は10〜90パーセンタイル、中央線は50パーセンタイル"><title>資産推移のシミュレーション</title><desc>1万回の各年の資産を並べた分位点です。中央値線は単一の試行ではありません。下の表でも確認できます。</desc>${axis.ticks.map((tick) => `<line x1="${left}" x2="${right}" y1="${y(tick)}" y2="${y(tick)}" stroke="var(--rule)"/><text data-axis-y="${tick}" x="${left - 8}" y="${y(tick) + 5}" text-anchor="end">${escapeHtml(axisLabel(tick))}</text>`).join('')}<polygon points="${band}" fill="var(--ai)" opacity=".15"/><polyline points="${line('p50')}" fill="none" stroke="var(--ai)" stroke-width="3"/><line x1="${left}" x2="${right}" y1="${y(GOAL)}" y2="${y(GOAL)}" stroke="var(--warn)" stroke-dasharray="6 4"/><text x="${right}" y="${y(GOAL) - 7}" text-anchor="end">目標1億円</text>${points
    .filter((_, i) => i === 0 || i === points.length - 1 || i % 10 === 0)
    .map(
      (p) =>
        `<text x="${x(points.indexOf(p))}" y="290" text-anchor="middle">${p.age}歳</text>`,
    )
    .join(
      '',
    )}</svg><figcaption>帯：10〜90パーセンタイル／線：中央値。幅は利用者が選ぶ仮定です。</figcaption></figure><details id="asset-values"><summary>年ごとの資産を表で見る</summary><div class="table-scroll" tabindex="0" role="region" aria-label="年齢別の資産分位点"><table class="data"><thead><tr><th>年齢</th><th>10%</th><th>50%</th><th>90%</th></tr></thead><tbody>${points.map((p) => `<tr><th>${p.age}歳</th><td>${yen(p.p10)}</td><td>${yen(p.p50)}</td><td>${yen(p.p90)}</td></tr>`).join('')}</tbody></table></div></details>`;
}
export function resultHeadline(i: OkuritsuInput, r: Simulation) {
  return `<div class="headline result-primary"><div class="field-label"><h2>あなたの億率</h2>${helpMarkup('probability-help', '億率', '選んだ仮定で1万回シミュレーションし、目標年齢までに一度でも金融資産が1億円に届いた試行の割合です。実際の将来確率を保証するものではありません。')}</div><div class="big" data-probability="${r.probability.toFixed(1)}">${r.probability.toFixed(1)}<small>%</small></div><p class="result-caption">${i.targetAge}歳までに1億円へ到達した割合（1万回の試算）</p><p>${r.medianAge !== null ? `中央値の線が1億円に届く年齢：<b>${r.medianAge}歳</b>` : `${i.targetAge}歳時点の中央値：<b>${yen(r.points.at(-1)!.p50)}</b>`}</p><p class="assumptions">${investmentNotice} <a href="/logic/">計算ロジック・前提</a>／<a href="/about/">運営者情報</a></p></div>`;
}
export function renderOkuritsu(i: OkuritsuInput, simple = false) {
  const compared = simple ? null : compareScenarios(i),
    r = compared?.base ?? simulate(i);
  return (
    resultHeadline(i, r) +
    (!simple
      ? shareMarkup(
          `フリーランス利益${man(i.sales - i.expenses)}、私の億率は${r.probability.toFixed(1)}%でした #億率`,
          '/okuritsu/',
          serializeInput(i),
        )
      : '') +
    (simple
      ? `<a class="primary-link" data-detail href="/okuritsu/?${serializeInput(i)}">詳しく計算する →</a><p class="assumptions">簡易版：金融資産0円・生活費年300万円・青色65万円・掛金なし・平均4%/幅15%。詳細版で変更できます。</p>`
      : `${chart(r.points)}<dl class="rows"><div><dt>年間の手取り（掛金支出前）</dt><dd>${yen(r.flow.takeHome)}</dd></div><div><dt>毎年の総積立額（掛金を含む）</dt><dd>${yen(r.flow.annualContribution)}</dd></div><div><dt>掛金を払った後の自由積立</dt><dd>${yen(r.flow.freeContribution)}</dd></div></dl>${r.flow.freeContribution < 0 ? '<p class="input-error">生活費と掛金を手取りだけで賄えません。不足を既存資産で補う計算です。掛金を続けられるか別途確認してください。</p>' : ''}${r.shortfallProbability > 0 ? `<p class="input-error">生活費等による資産不足が発生した試行：${r.shortfallProbability.toFixed(1)}%。不足分を借入で補う計算はしていません。</p>` : ''}<section class="block"><h2>条件を1つ変えた場合の億率</h2><p>各比較に同じ乱数列を使います。条件によっては億率が変わらない、下がる場合もあります。</p><ul class="scenario-list">${compared!.changes.map((c) => `<li><a href="${c.href}">${c.label}</a><b>${r.probability.toFixed(1)}% → ${c.probability.toFixed(1)}%（${c.delta >= 0 ? '+' : ''}${c.delta.toFixed(1)}pt）</b>${c.freeContribution < 0 ? '<small>生活費・掛金の資金が不足します</small>' : ''}</li>`).join('')}</ul><p class="assumptions">法人化は維持費年30万円・全残金を配当した最終手取りで計算。掛金控除は適用しないため、その影響も差分に含みます。会社に残す資金や保障の違いを含めた判断は法人化ツールで確認してください。</p></section>${disclosure('model-assumptions', 'モデルの詳しい前提', `<p>${modelAssumptions} 正規分布の年次利回りは−100%を下限、資産額は0円を下限とします。<a href="/logic/">計算方法と制約</a>／<a href="/about/">運営者情報</a></p>`)}`)
  );
}
