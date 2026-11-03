import type { ToolKind, ToolState } from '../tools/state';
import { percent } from '../tax/invoice';

export function describeConditions(kind: ToolKind, s: ToolState) {
  if (kind === 'invoice') {
    const band = {
      under1000: '1,000万円以下',
      under5000: '1,000万円超〜5,000万円以下',
      over5000: '5,000万円超',
      unknown: '未確認（1,000万円超等の条件を確認）',
    }[s.baseBand];
    return (
      s.taxYear +
      '年分・' +
      (s.ratioMode === 'auto' ? '自動' : '手動') +
      ' ' +
      percent(s.ratio) +
      '・事業者向け売上 ' +
      s.b2b +
      '%・みなし仕入率' +
      percent(s.deem) +
      '／2年前売上' +
      band +
      '・' +
      (s.registeredFromExempt ? '免税から登録' : '免税からの登録以外') +
      '・除外条件' +
      (s.specialExcluded ? 'あり' : 'なし') +
      '・値下げ要求' +
      s.discount +
      '%'
    );
  }
  const declaration =
    s.blue === 650000
      ? '青色65万円'
      : s.blue === 100000
        ? '青色10万円'
        : '白色';
  const shared = `${declaration}・介護分${s.age40 ? 'あり' : 'なし'}・事業税${s.jigyo ? 'あり' : 'なし'}`;
  return (
    shared +
    (kind === 'tedori'
      ? `・掛金 年${s.extra.toLocaleString('ja-JP')}万円`
      : `／役員報酬${s.mode === 'auto' ? 'は自動比較' : ` 年${s.salary.toLocaleString('ja-JP')}万円`}・税理士費用 年${s.fee.toLocaleString('ja-JP')}万円`)
  );
}
