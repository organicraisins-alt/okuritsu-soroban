import { P } from './params';
import { assertFinite, man } from './format';
export interface CalendarTaxes {
  pn: number;
  kk: number;
  rt: number;
  it: number;
  jg: number;
}
export interface PaymentItem {
  amount: number;
  label: string;
  display: string;
}
export interface PaymentMonth {
  month: number;
  amt: number;
  items: PaymentItem[];
}
/** Same-income steady-state estimate from prototype, not a first-year bill forecast.
 * Monthly fractions remain unrounded; round only for display, like the prototype. */
export function paymentCalendar(r: CalendarTaxes) {
  assertFinite(r.pn, r.kk, r.rt, r.it, r.jg);
  const c = P.calendar,
    pre = r.it >= c.advanceThreshold;
  const months: PaymentMonth[] = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    amt: 0,
    items: [],
  }));
  const add = (month: number, amount: number, label: string) => {
    if (amount > 0) {
      const m = months[month - 1]!;
      m.amt += amount;
      m.items.push({ amount, label, display: man(amount) });
    }
  };
  for (let m = 1; m <= 12; m++) add(m, r.pn / 12, '国民年金');
  c.nhiMonths.forEach((m) => add(m, r.kk / c.nhiMonths.length, '国保'));
  c.residentMonths.forEach((m) =>
    add(m, r.rt / c.residentMonths.length, '住民税'),
  );
  add(
    c.settlementMonth,
    pre ? r.it / 3 : r.it,
    pre ? '所得税（確定申告分）' : '所得税（確定申告）',
  );
  if (pre) c.advanceMonths.forEach((m) => add(m, r.it / 3, '予定納税'));
  c.businessMonths.forEach((m) =>
    add(m, r.jg / c.businessMonths.length, '個人事業税'),
  );
  const peak = months.reduce((a, b, i) => (b.amt > months[a]!.amt ? i : a), 0);
  return {
    months,
    peakMonth: peak + 1,
    total: months.reduce((n, m) => n + m.amt, 0),
    hasAdvance: pre,
  };
}
