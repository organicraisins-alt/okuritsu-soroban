import { sole } from './sole';
import { standardOptions } from './content';
import { paymentCalendar } from './calendar';
import { assertFinite, yen } from './format';
import { rows } from '../tools/markup';
export function guideExample(sales: number, expenses: number) {
  assertFinite(sales, expenses);
  if (sales < 0 || expenses < 0 || sales > 1e9 || expenses > 1e9)
    throw new RangeError('金額は0〜100,000万円で入力してください。');
  const result = sole(sales, expenses, standardOptions);
  return { result, calendar: paymentCalendar(result) };
}
export function renderGuideExample(
  slug: string,
  sales: number,
  expenses: number,
) {
  const { result: r, calendar: c } = guideExample(sales, expenses);
  if (slug === 'shiharai-calendar')
    return `<p>税・保険料の年間概算 ${yen(c.total)}。同じ所得が続く場合の配分です。</p><div class="cal">${c.months.map((m) => `<div class="mon"><b>${m.month}月</b><div>${yen(m.amt)}</div><ul>${m.items.map((i) => `<li>${i.label} ${i.display}</li>`).join('')}</ul></div>`).join('')}</div>`;
  if (slug === 'juminzei-itsu')
    return (
      rows([
        ['住民税（年額）', r.rt],
        ['1期あたりの単純4分割', r.rt / 4],
      ]) + '<p>納税通知書の端数配分・徴収方法を優先してください。</p>'
    );
  if (slug === 'yotei-nouzei')
    return `<p>所得税の概算 ${yen(r.it)}。${c.hasAdvance ? 'この簡略モデルでは予定納税相当額を7月・11月へ配分します。' : 'この簡略モデルでは予定納税相当額を配分しません。'}実際の予定納税基準額や税務署の通知を判定するものではありません。</p>`;
  if (slug === 'kojin-jigyouzei')
    return rows([
      ['利益', r.profit],
      ['個人事業税（対象業種5%の概算）', r.jg],
    ]);
  return (
    rows([
      ['利益', r.profit],
      ['年間の手取り', r.total],
      ['税金・保険料の年額', sales - expenses - r.total],
    ]) + '<p>前年の給与による住民税・国保や消費税はこの額と別に確認します。</p>'
  );
}
