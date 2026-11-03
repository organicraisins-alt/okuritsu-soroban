import { P } from './params';
import { man } from './format';
import { sole, basicIT, type SoleOptions } from './sole';
import { corp, bestCorp, type CorpOptions } from './corp';
import { floorTo } from './format';
/** Prototype advice thresholds, retained while params.ts is frozen. TODO(要確認): contribution limits. */
export function taxTips(S: number, E: number, o: SoleOptions) {
  const r = sole(S, E, o),
    tips: { gain: number; title: string; body: string }[] = [];
  if (o.blue < 650000 && r.profit > 0) {
    const gain = sole(S, E, { ...o, blue: 650000 }).total - r.total;
    if (gain > 0)
      tips.push({
        gain,
        title: '青色申告65万円控除にする',
        body: '会計ソフトで複式簿記の帳簿をつけ、e-Taxで申告すると使えます。',
      });
  }
  const extra = o.extra || 0;
  if (r.profit > 3000000) {
    const add = 840000 - Math.min(extra, 840000);
    if (add > 0) {
      const gain = sole(S, E, { ...o, extra: extra + add }).total - r.total;
      if (gain > 0)
        tips.push({
          gain,
          title: `小規模企業共済に月${Math.round(add / 120000)}万円積み立てる`,
          body: '掛金は全額が所得から引かれ、廃業時や退職時に受け取れます。数字は税金と保険料が減る分です。',
        });
    }
  }
  if (extra < 816000 && r.profit > 2000000) {
    const add = 816000 - Math.min(extra, 816000),
      gain = sole(S, E, { ...o, extra: extra + add }).total - r.total;
    if (gain > 0)
      tips.push({
        gain,
        title: 'iDeCoで月6.8万円（上限）積み立てる',
        body: '掛金は60歳まで引き出せませんが、全額が所得から引かれます。上限は試算上の仮定です。',
      });
  }
  return tips;
}
export function calculationSteps(S: number, E: number, o: SoleOptions) {
  const r = sole(S, E, o),
    blue = Math.min(o.blue, Math.max(0, r.profit)),
    social = r.kk + r.pn;
  const base = floorTo(
    Math.max(0, r.inc - social - (o.extra || 0) - basicIT(r.inc)),
    1000,
  );
  // Marginal bracket label from the existing tax calculation, including upper bands.
  const rate =
    base <= 1950000
      ? 5
      : base <= 3300000
        ? 10
        : base <= 6950000
          ? 20
          : base <= 9000000
            ? 23
            : base <= 18000000
              ? 33
              : base <= 40000000
                ? 40
                : 45;
  return [
    { label: '売上', amount: S, note: '取引先から受け取ったお金の合計' },
    {
      label: '経費を引く',
      amount: E === 0 ? 0 : -E,
      note: '仕事のために使ったお金',
    },
    {
      label: '青色申告特別控除を引く',
      amount: -blue,
      note: '帳簿をつけて申告すると使える控除',
    },
    {
      label: '= 所得',
      amount: r.inc,
      note: '国保の保険料はこの金額から計算します',
    },
    {
      label: '国保・年金を引く（社会保険料控除）',
      amount: -social,
      note: '払った保険料は全額差し引けます',
    },
    {
      label: '基礎控除などを引く',
      amount: -(basicIT(r.inc) + (o.extra || 0)),
      note: '令和8年分の所得税の基礎控除を使用しています',
    },
    {
      label: '= 課税所得',
      amount: base,
      note: `所得税はこの金額に税率（${rate}%帯）をかけます`,
    },
    {
      label: '税金と保険料を払った残り = 手取り',
      amount: r.total,
      note: '所得税・住民税・国保・年金・事業税をすべて払った後',
    },
  ];
}
export function corporationSeries(
  E: number,
  so: SoleOptions,
  co: CorpOptions,
  fixedR: number | null,
) {
  const points: { profit: number; difference: number }[] = [];
  for (let p = 2000000; p <= 25000000; p += 500000) {
    const s = sole(p + E, E, so),
      c =
        fixedR === null
          ? bestCorp(p + E, E, co)
          : corp(p + E, E, Math.min(fixedR, p), co);
    points.push({ profit: p, difference: c.total - s.total });
  }
  return points;
}

export function corporationVerdict(difference: number) {
  if (Math.abs(difference) < P.corporationNeutralThreshold)
    return {
      kind: 'neutral',
      title: `ほぼ同じです（差は年${man(Math.abs(difference))}）`,
      note: '手続きの手間や税理士費用、将来の年金、資金の使い方も考えて判断してください。',
    };
  if (difference >= P.corporationNeutralThreshold)
    return {
      kind: 'corp',
      title: `法人化すると年${man(difference)}多く残ります`,
      note: '税額の差に加え、設立費用と毎年の手続きを確認してください。',
    };
  return {
    kind: 'sole',
    title: `個人事業主のままのほうが年${man(-difference)}多く残ります`,
    note: '税金以外の契約・信用・年金面の必要性もあわせて判断してください。',
  };
}
