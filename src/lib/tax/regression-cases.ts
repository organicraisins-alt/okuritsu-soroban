import { sole } from './sole';
import { employee } from './employee';
import { bestCorp } from './corp';
import { P, type TaxParams } from './params';
export interface RegressionCase {
  label: string;
  kind: 'sole' | 'employee' | 'corp' | 'difference';
  sales: number;
  expenses: number;
  expected: number[];
}
// Expected values are frozen independently checked fixtures, never generated from the implementation.
export const currentCases: RegressionCase[] = [
  {
    label: '売上800万円・経費150万円の個人手取り',
    kind: 'sole',
    sales: 8000000,
    expenses: 1500000,
    expected: [4559160],
  },
  {
    label: '売上1200万円・経費200万円の個人手取り',
    kind: 'sole',
    sales: 12000000,
    expenses: 2000000,
    expected: [6570960],
  },
  {
    label: '利益500万円の個人手取り',
    kind: 'sole',
    sales: 5000000,
    expenses: 0,
    expected: [3706160],
  },
  {
    label: '会社員年収600万円の手取り',
    kind: 'employee',
    sales: 6000000,
    expenses: 0,
    expected: [4662000],
  },
  {
    label: '利益1000万円の最適役員報酬／法人最終手取り',
    kind: 'corp',
    sales: 10000000,
    expenses: 0,
    expected: [1440000, 6690950],
  },
  {
    label: '利益650万円の法人化差額',
    kind: 'difference',
    sales: 6500000,
    expenses: 0,
    expected: [55755],
  },
];
const oldExpected = [
  [4567060],
  [6595160],
  [3713160],
  [4658200],
  [1320000, 6690388],
  [47522],
];
export const legacyCases = currentCases.map((c, i) => ({
  ...c,
  expected: oldExpected[i]!,
}));
export function evaluateCase(c: RegressionCase, p: TaxParams = P): number[] {
  const o = { blue: 650000, age40: false, jigyo: true, extra: 0 },
    co = { age40: false, fee: 300000 };
  if (c.kind === 'employee') return [employee(c.sales, p)];
  if (c.kind === 'sole') return [sole(c.sales, c.expenses, o, p).total];
  const r = bestCorp(c.sales, c.expenses, co, p);
  return c.kind === 'corp'
    ? [r.R, r.total]
    : [r.total - sole(c.sales, c.expenses, o, p).total];
}
