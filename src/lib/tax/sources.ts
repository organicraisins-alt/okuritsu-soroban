import { P } from './params';
export const calculationUpdated = '2026-10-27';
const refs = {
  basic: 'https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1199.htm',
  income: 'https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm',
  salary: 'https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1410.htm',
  nhi: 'https://www.city.shinjuku.lg.jp/hoken/hoken01_001028.html',
  pension:
    'https://www.nenkin.go.jp/service/kokunen/hokenryo/hokenryogaku.files/R8_hokenryou.pdf',
  health:
    'https://www.kyoukaikenpo.or.jp/~/media/Files/shared/hokenryouritu/r8/ippan/R8_13tokyo.pdf',
  employment: 'https://www.mhlw.go.jp/content/001692566.pdf',
  invoice:
    'https://www.nta.go.jp/taxes/shiraberu/zeimokubetsu/shohi/keigenzeiritsu/invoice-review/index.htm',
  ideco:
    'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/nenkin/kyoshutsu/ideco.html',
  kyosai: 'https://www.smrj.go.jp/kyosai/skyosai/',
  business: 'https://www.tax.metro.tokyo.lg.jp/kazei/kojin_ji.html',
};
const labels: Record<string, string> = {
  basicIT: '所得税基礎控除',
  basicRT: '住民税基礎控除',
  incomeBands: '所得税速算表',
  pensionMonthly: '国民年金月額',
  kk: '国保',
  deduction: '控除',
  medical: '医療',
  support: '後期支援',
  care: '介護',
  child: '子ども支援',
  rate: '所得割・税率',
  flat: '均等割・定額',
  cap: '上限',
  health: '協会けんぽ健康保険率',
  kodomo: '協会けんぽ子ども支援金率',
  employment: '雇用保険本人負担率',
  salary: '給与所得控除',
  minimum: '最低額',
  roundingUnit: '丸め単位',
  roundingBelow: '丸め対象上限',
  specialIncomeBands: '特例給与所得表',
  bands: '控除表',
  reconstruction: '復興特別所得税込倍率',
  resident: '住民税',
  threshold: '閾値',
  adjustment: '調整額',
  jigyo: '個人事業税',
  corp: '法人概算',
  limit: '所得区分',
  upperRate: '上位税率',
  jigyoLimit: '事業税区分',
  jigyoLow: '事業税下位率',
  jigyoMid: '事業税中位率',
  jigyoHigh: '事業税上位率',
  local: '地方法人税率',
  specialJigyo: '特別事業税率',
  dividendCredit: '配当控除近似率',
  salaryStep: '報酬探索刻み',
  kousei: '厚生年金率',
  kyoshutsu: '子ども拠出金率',
  healthMin: '健康保険報酬下限',
  voluntaryStandardMax: '任意継続の標準報酬上限',
  healthMax: '健康保険報酬上限',
  pensionMin: '厚生年金報酬下限',
  pensionMax: '厚生年金報酬上限',
  deductions: '控除・掛金',
  blue: '青色申告控除',
  smallBusiness: '共済年額の仮定',
  ideco: 'iDeCo年額の仮定',
  invoice: '消費税',
  taxRate: '消費税率',
  twoTenths: '2割特例の納付割合',
  threeTenths: '3割特例の納付割合',
  specialLimit: '特例の基準売上',
  simpleLimit: '簡易課税の基準売上',
  transitionRatios: '経過措置割合',
  transitionPeriods: '経過措置期間',
  defaultRatio: '既定割合',
  specialYears: '3割特例対象年',
  corporationNeutralThreshold: '法人化比較の中立幅',
  calendar: '納付カレンダーの仮定',
  equivalent: '会社員換算の探索設定',
};
function evidence(key: string) {
  let source = '/logic/#limitations',
    period = '令和8年分の概算・TODO(要確認)',
    status = 'TODO(要確認)：プロトタイプ由来';
  if (key.startsWith('incomeBands') || key === 'reconstruction')
    source = refs.income;
  if (key.startsWith('basicRT') || key.startsWith('resident'))
    source = 'https://www.city.shinjuku.lg.jp/hoken/file04_03_00001.html';
  if (key === 'voluntaryStandardMax') {
    source = 'https://www.kyoukaikenpo.or.jp/news/r07_dec/1259.html';
    period = '令和8年度';
    status = '公式確認（協会けんぽ任意継続）';
  }
  if (key.startsWith('basicIT')) {
    source = refs.basic;
    period = '令和8年分';
    if (Number(key.split('.')[1]) < 3) status = '公式確認（2026-10-26）';
  }
  if (key.startsWith('kk')) {
    source = refs.nhi;
    period = '令和8年度を通年適用';
    status = '公式確認（成人1人・軽減なし）';
  }
  if (key === 'pensionMonthly') {
    source = refs.pension;
    period = '令和8年度の月額×12';
    status = '公式確認';
  }
  if (['health', 'care', 'kodomo'].includes(key)) {
    source = refs.health;
    period =
      key === 'kodomo'
        ? '2026年4月〜の率を通年適用'
        : '2026年3月〜の率を通年適用';
    status = '公式確認（労使合計）';
  }
  if (key === 'employment') {
    source = refs.employment;
    period = '2026年4月〜2027年3月';
    status = '公式確認（一般事業・本人）';
  }
  if (key.startsWith('salary')) {
    source = refs.salary;
    period = '令和8・9年分';
    status = '公式確認（所得税用）';
  }
  if (key.startsWith('invoice')) {
    source = refs.invoice;
    period =
      key.includes('threeTenths') || key.includes('specialYears')
        ? '2027・2028年（適用条件あり）'
        : '個別の経過措置期間を参照';
    status = '公式確認・条件はツール参照';
  }
  if (key.startsWith('deductions')) {
    source = key.includes('smallBusiness')
      ? refs.kyosai
      : key.includes('ideco')
        ? refs.ideco
        : 'https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2070.htm';
    period = key.includes('ideco')
      ? '2026年11月までの第1号上限の仮定'
      : '通年のシナリオ仮定';
    status = '適用資格・合算枠に注意';
  }
  if (key.startsWith('jigyo')) source = refs.business;
  if (
    key.startsWith('calendar') ||
    key.startsWith('equivalent') ||
    key === 'corporationNeutralThreshold'
  ) {
    source = '/logic/';
    period = '本サイトのモデル設定';
    status = key.startsWith('calendar')
      ? '納付モデル用の設定・判定を簡略化'
      : '法定値ではありません';
  }
  return { source, period, status };
}
export function parameterRows() {
  const rows: {
    key: string;
    label: string;
    raw: number | string;
    value: string;
    source: string;
    period: string;
    status: string;
  }[] = [];
  function walk(value: unknown, path: string[]) {
    if (typeof value === 'object' && value !== null) {
      Object.entries(value).forEach(([k, v]) => walk(v, [...path, k]));
      return;
    }
    if (typeof value !== 'number' && typeof value !== 'string') return;
    if (['year', 'version'].includes(path[0]!)) return;
    const key = path.join('.'),
      rate =
        /rate|Rate|Ratio|Ratios|Tenths|dividendCredit|jigyoLow|jigyoMid|jigyoHigh/.test(
          key,
        ) ||
        [
          'health',
          'care',
          'kodomo',
          'employment',
          'kousei',
          'kyoshutsu',
          'corp.local',
          'corp.resident',
          'corp.specialJigyo',
        ].includes(key) ||
        (['incomeBands', 'salary.bands'].some((p) => key.startsWith(p)) &&
          path.at(-1) === '1');
    const rendered =
      typeof value === 'string'
        ? value
        : !Number.isFinite(value)
          ? '上限なし'
          : rate
            ? `${Number((value * 100).toFixed(4))}%`
            : value.toLocaleString('ja-JP');
    rows.push({
      key,
      label: path
        .map((k) => labels[k] ?? (/^\d+$/.test(k) ? `[${Number(k) + 1}]` : k))
        .join(' / '),
      raw: value,
      value: rendered,
      ...evidence(key),
    });
  }
  walk(P, []);
  return rows;
}
