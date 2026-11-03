import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import type { SoleOptions, SoleResult } from '../../src/lib/tax/sole';
import type { CorpOptions, CorpResult } from '../../src/lib/tax/corp';

// Trusted, user-provided reference only; never execute remote or user form input.
const html = readFileSync(
  new URL('../../prototype/index.html', import.meta.url),
  'utf8',
);
const script = html.split('<script>')[1]!.split('</script>')[0]!;
const core = script.slice(0, script.indexOf('// ===== 広告枠'));
export const prototype = runInNewContext(
  `${core}\n({basicIT,basicRT,incomeTaxRaw,salaryDed,personalTax,kokuho,sole,corpTax,corp,bestCorp,employee,employeeEquivalent,yen,man})`,
) as {
  basicIT: (n: number) => number;
  basicRT: (n: number) => number;
  incomeTaxRaw: (n: number) => number;
  salaryDed: (n: number) => number;
  personalTax: (
    inc: number,
    social: number,
    extra: number,
  ) => { it: number; rt: number };
  kokuho: (inc: number, age: boolean) => number;
  sole: (s: number, e: number, o: SoleOptions) => SoleResult;
  corpTax: (n: number) => number;
  corp: (s: number, e: number, r: number, o: CorpOptions) => CorpResult;
  bestCorp: (s: number, e: number, o: CorpOptions) => CorpResult;
  employee: (n: number) => number;
  employeeEquivalent: (n: number) => number;
  yen: (n: number) => string;
  man: (n: number) => string;
};

export function prototypeCalendar(
  r: SoleResult,
): { amt: number; items: string[] }[] {
  const body = script.slice(
    script.indexOf('  const pre = r.it >= 150000;'),
    script.indexOf('  const peak = M.reduce'),
  );
  return runInNewContext(`${core}\n(function(r){${body};return M;})`, {})(r);
}

export function prototypeInvoice(input: {
  sales: number;
  buy: number;
  b2b: number;
  deem: number;
  ratio: number;
}) {
  const values: Record<string, number> = {
    'iv-sales': input.sales / 10000,
    'iv-buy': input.buy / 10000,
    'iv-b2b': input.b2b * 100,
    'iv-kind': input.deem,
    'iv-ratio': input.ratio,
  };
  const elements: Record<
    string,
    { value: number; innerHTML?: string; textContent?: number }
  > = {};
  const document = {
    getElementById: (id: string) =>
      elements[id] ?? (elements[id] = { value: values[id] ?? 0 }),
  };
  const render = script
    .slice(
      script.indexOf('function renderInvoice()'),
      script.indexOf('// ===== ガイド'),
    )
    .replace(
      'renderPR(document.getElementById("iv-pr"), ["invoice", "soft", "tax"]);',
      'return {out,methods:m,best,cut,regKeep,noKeep,regWin};',
    );
  return runInNewContext(`${core}\n${render}\nrenderInvoice()`, { document });
}
