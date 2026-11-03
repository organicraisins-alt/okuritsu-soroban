export const OFFERS = {
  soft: {
    why: '65万円控除の記帳に',
    title: 'クラウド会計ソフト',
    body: '銀行口座やカードと連携して、複式簿記の帳簿を自動で作れます。',
    url: '#',
    cta: '会計ソフトを比較する',
  },
  ideco: {
    why: '所得控除を増やすなら',
    title: 'iDeCoの口座開設',
    body: '掛金が全額所得から差し引かれます。手数料の安い金融機関を比べられます。',
    url: '#',
    cta: 'iDeCo口座を比較する',
  },
  setup: {
    why: '法人化が得な結果の方へ',
    title: '会社設立サービス',
    body: '定款作成から登記書類まで、オンラインで準備できます。',
    url: '#',
    cta: '設立サービスを見る',
  },
  tax: {
    why: '法人化の前に相談',
    title: '税理士紹介サービス',
    body: '法人化のタイミングや役員報酬の決め方を、無料で相談できる税理士を紹介します。',
    url: '#',
    cta: '無料で税理士を探す',
  },
  card: {
    why: '経費の管理をラクに',
    title: 'ビジネスカード',
    body: '事業の支払いを個人のカードと分けると、記帳と確定申告が楽になります。',
    url: '#',
    cta: 'ビジネスカードを比較する',
  },
  invoice: {
    why: 'インボイス対応に',
    title: '請求書作成ソフト',
    body: '登録番号入りの適格請求書を作って、そのまま送れます。',
    url: '#',
    cta: '請求書ソフトを比較する',
  },
} as const;

export type OfferKey = keyof typeof OFFERS;
export function offerKeys(
  kind: string,
  blue: number,
  profit: number,
  corpWin = false,
): OfferKey[] {
  if (kind === 'invoice') return ['invoice', 'soft', 'tax'];
  if (kind === 'houjinka')
    return corpWin ? ['tax', 'setup', 'soft'] : ['soft', 'ideco', 'tax'];
  return blue < 650000
    ? ['soft', 'card', 'ideco']
    : profit > 9000000
      ? ['tax', 'soft', 'ideco']
      : ['soft', 'ideco', 'card'];
}
