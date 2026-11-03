import { incomeAmounts, employeeAmounts } from '../data/amounts';
import { jobs } from '../data/jobs';
import { incomeSummary, employeeComparison } from './tax/content';
import { jobExamples } from './tax/jobs';
import { defaults, simulate } from './okuritsu/model';
import { man } from './tax/format';
import { SITE_LOGO, SITE_COPY, SITE_READING } from '../../config/site.mjs';
export interface OgCard {
  slug: string;
  title: string;
  value: string;
  note: string;
}
let cached: OgCard[] | undefined;
export function ogCards(): OgCard[] {
  if (cached) return cached;
  cached = [
    {
      slug: 'default',
      title: SITE_COPY,
      value: '手取りから、資産形成へ',
      note: '税金・保険料・法人化と、長期の見通しを比較',
    },
    ...incomeAmounts.map((amount) => ({
      slug: `nenshu-${amount}`,
      title: `フリーランス利益${amount}万円`,
      value: `手取り ${man(incomeSummary(amount * 10000).result.total)}`,
      note: '東京23区・青色65万円・40歳未満／年間概算',
    })),
    ...employeeAmounts.map((amount) => ({
      slug: `kaishain-${amount}`,
      title: `会社員年収${amount}万円と同じ手取り`,
      value: `必要売上 ${man(employeeComparison(amount * 10000, 0.2).sales)}`,
      note: '経費率20%／単身・青色65万円の概算',
    })),
    ...jobs.map((job) => {
      const r = jobExamples(job)[0]!;
      return {
        slug: `shokugyo-${job.slug}`,
        title: job.name,
        value: `手取り ${man(r.result.total)}`,
        note: `売上${man(r.sales)}・経費率${job.expenseRatio * 100}%の仮定`,
      };
    }),
    {
      slug: 'okuritsu',
      title: 'フリーランスの資産1億円への試算',
      value: `億率 ${simulate(defaults).probability.toFixed(1)}%`,
      note: '既定例：売上800万・経費150万・30→60歳／成果を保証しません',
    },
  ];
  return cached;
}
export function ogTree(card: OgCard) {
  const node = (text: string, style: Record<string, string | number>) => ({
    type: 'div',
    props: { children: text, style },
  });
  return {
    type: 'div',
    props: {
      style: {
        width: 1200,
        height: 630,
        display: 'flex',
        flexDirection: 'column',
        background: '#f6f8fb',
        color: '#17213a',
        padding: 60,
        fontFamily: 'Noto Sans JP',
        borderTop: '16px solid #2340a0',
      },
      children: [
        node(`${SITE_LOGO}　${SITE_READING}`, {
          fontSize: 38,
          color: '#2340a0',
        }),
        node(card.title, { fontSize: 36, marginTop: 42, lineHeight: 1.4 }),
        node(card.value, {
          fontSize: 70,
          fontWeight: 700,
          marginTop: 24,
          color: '#1f8a5b',
          lineHeight: 1.4,
        }),
        node(card.note, { fontSize: 23, marginTop: 36, color: '#5b6680' }),
        node('okuritsu-soroban.com', {
          fontSize: 22,
          marginTop: 'auto',
          color: '#5b6680',
        }),
      ],
    },
  };
}
