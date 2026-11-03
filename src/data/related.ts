import { incomeAmounts, employeeAmounts } from './amounts';
export interface Related {
  href: string;
  label: string;
}
const income = (amount: number): Related => ({
  href: `/nenshu/${amount}/`,
  label: `フリーランス利益${amount}万円の手取りと内訳`,
});
const employee = (amount: number): Related => ({
  href: `/hikaku/kaishain-${amount}/`,
  label: `会社員年収${amount}万円と同じ手取りに必要な売上`,
});
const oku = { href: '/okuritsu/', label: '積立と利回りの条件から億率を計算' };
const tedori = {
  href: '/tools/tedori/',
  label: '売上・経費から自分の手取りと税金を計算',
};
const calendar = {
  href: '/guide/shiharai-calendar/',
  label: '税金・保険料の支払い月と資金繰りを確認',
};
const firstYear = {
  href: '/guide/dokuritsu-1nenme/',
  label: '独立1年目の住民税・国保と届出を確認',
};
const nhi = {
  href: '/guide/kokuho-takai/',
  label: '国保が高い理由と任意継続との比較',
};
const hub = {
  href: '/dokuritsu/',
  label: '会社員から独立する前のお金と手続きを準備',
};
const houjinka = {
  href: '/tools/houjinka/',
  label: '法人化と個人事業主の手取りを同条件で比較',
};
const expense = {
  href: '/guide/keihi/',
  label: '必要経費と所得控除の違いを確認',
};
const tax = {
  href: '/guide/kojin-jigyouzei/',
  label: '個人事業税の対象業種・控除・納期を確認',
};
const filing = {
  href: '/guide/kakutei-shinkoku/',
  label: '令和8年分の確定申告の準備と流れを確認',
};
const job = {
  href: '/shokugyo/engineer/',
  label: 'Webエンジニアの売上別の手取りと事業税',
};
const logic = {
  href: '/logic/',
  label: '使用料率・計算手順・検算データを確認',
};
const byPath: Record<string, Related[]> = {
  '/': [tedori, houjinka, hub],
  '/nenshu/': [tedori, employee(600), oku],
  '/tools/tedori/': [calendar, houjinka, expense],
  '/tools/houjinka/': [income(800), tax, oku],
  '/tools/invoice/': [tedori, expense, filing],
  '/guide/juminzei-itsu/': [calendar, firstYear, tedori],
  '/guide/shiharai-calendar/': [
    {
      href: '/guide/yotei-nouzei/',
      label: '所得税の予定納税と減額申請の確認事項',
    },
    nhi,
    tedori,
  ],
  '/guide/yotei-nouzei/': [calendar, filing, tedori],
  '/guide/dokuritsu-1nenme/': [employee(600), calendar, nhi],
  '/guide/kokuho-takai/': [firstYear, calendar, tedori],
  '/guide/kakutei-shinkoku/': [expense, calendar, tedori],
  '/guide/zeisei-kaisei-2026/': [logic, tedori, houjinka],
  '/guide/kojin-jigyouzei/': [expense, calendar, tedori],
  '/guide/keihi/': [tax, filing, tedori],
  '/dokuritsu/': [employee(600), firstYear, calendar],
  '/okuritsu/': [tedori, expense, houjinka],
};
/** Existing amount pages only; salary gross and business profit are distinct. */
export function relatedPages(path: string): Related[] {
  const amountMatch = path.match(/^\/nenshu\/(\d+)\/$/);
  const employeeMatch = path.match(/^\/hikaku\/kaishain-(\d+)\/$/);
  if (amountMatch && incomeAmounts.includes(Number(amountMatch[1]))) {
    const amount = Number(amountMatch[1]);
    const index = incomeAmounts.indexOf(amount);
    const closest = employeeAmounts.reduce((a, b) =>
      Math.abs(b - amount) < Math.abs(a - amount) ? b : a,
    );
    return [
      ...(index > 0 ? [income(incomeAmounts[index - 1]!)] : []),
      ...(index < incomeAmounts.length - 1
        ? [income(incomeAmounts[index + 1]!)]
        : []),
      employee(closest),
      oku,
    ];
  }
  if (employeeMatch && employeeAmounts.includes(Number(employeeMatch[1]))) {
    const amount = Number(employeeMatch[1]);
    const index = employeeAmounts.indexOf(amount);
    return [
      ...(index > 0 ? [employee(employeeAmounts[index - 1]!)] : []),
      ...(index < employeeAmounts.length - 1
        ? [employee(employeeAmounts[index + 1]!)]
        : []),
      income(amount),
      oku,
    ];
  }
  const primary =
    byPath[path] ??
    (path.startsWith('/shokugyo/')
      ? [expense, tax, tedori]
      : [oku, hub, logic]);
  return [...primary, income(800), job, firstYear, oku, hub, logic]
    .filter(
      (v, i, all) =>
        v.href !== path && all.findIndex((x) => x.href === v.href) === i,
    )
    .slice(0, 3);
}
