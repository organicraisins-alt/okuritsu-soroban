// Prototype model cases. These are illustrative assumptions, not industry averages.
export const modelCases = [
  {
    job: 'Webエンジニア',
    note: '週5日の業務委託',
    sales: 960,
    exp: 120,
    jigyo: true,
  },
  {
    job: 'Webデザイナー',
    note: '制作案件中心',
    sales: 600,
    exp: 100,
    jigyo: true,
  },
  {
    job: 'ライター',
    note: '記事・取材執筆',
    sales: 400,
    exp: 50,
    jigyo: false,
  },
  {
    job: '動画編集者',
    note: 'YouTube・広告動画',
    sales: 500,
    exp: 80,
    jigyo: true,
  },
  {
    job: 'コンサルタント',
    note: '顧問契約・研修',
    sales: 1500,
    exp: 200,
    jigyo: true,
  },
  {
    job: '副業から独立1年目',
    note: '売上が安定する前',
    sales: 350,
    exp: 60,
    jigyo: true,
  },
] as const;

export interface Job {
  slug: string;
  name: string;
  sales: number[];
  expenseRatio: number;
  jigyo: boolean;
  businessTax: string;
  expenses: string[];
  invoice: string;
}
export const jobs: Job[] = [
  {
    slug: 'engineer',
    name: 'Webエンジニア・プログラマー',
    sales: [600, 800, 1000, 1200],
    expenseRatio: 0.12,
    jigyo: true,
    businessTax:
      '契約と業務の実態によって請負業などに当たるか判断が分かれます。この表は対象として計算しています。TODO(要確認)：都道府県税事務所で業務内容を確認してください。',
    expenses: [
      '開発用パソコンと周辺機器',
      'クラウド・検証環境の利用料',
      '業務用ソフト・技術書',
      '業務に使う通信費',
    ],
    invoice:
      '法人の発注先が中心でも登録が一律に必須になるわけではありません。契約単価、仕入税額控除、登録後の納税額を比較します。',
  },
  {
    slug: 'designer',
    name: 'Webデザイナー',
    sales: [400, 600, 800],
    expenseRatio: 0.17,
    jigyo: true,
    businessTax:
      'デザイン業は個人事業税の法定業種です。表は税率5%の対象として計算します。制作以外の業務を含む場合の区分は都道府県税事務所で確認してください。',
    expenses: [
      'デザインソフトの利用料',
      '画像・フォントのライセンス',
      '制作機材・色校正用品',
      '打ち合わせの交通費',
    ],
    invoice:
      '法人の制作会社と一般消費者のどちらが主な顧客かを整理します。取引先の依頼だけで決めず、価格と納税額をセットで確認します。',
  },
  {
    slug: 'writer',
    name: 'ライター',
    sales: [300, 400, 600],
    expenseRatio: 0.12,
    jigyo: false,
    businessTax:
      '文筆業としての執筆を想定し、表は個人事業税の対象外で計算します。広告制作や編集請負等を含む実態によって扱いが変わるため、都道府県税事務所で確認してください。',
    expenses: [
      '取材の交通費・宿泊費',
      '録音機器・文字起こし',
      '資料・書籍・新聞購読',
      '執筆に使う通信費',
    ],
    invoice:
      '出版社や企業からの報酬は、源泉徴収と消費税を混同しないよう明細を確認します。消費税の負担を契約単価に反映できるか相談しましょう。',
  },
  {
    slug: 'video',
    name: '動画編集者',
    sales: [300, 500, 700],
    expenseRatio: 0.16,
    jigyo: true,
    businessTax:
      '表では請負業等の対象として計算します。撮影・編集・著作物制作の実態によって判断が分かれます。TODO(要確認)：都道府県税事務所に契約内容を伝えて確認してください。',
    expenses: [
      '編集ソフト・ストレージ',
      '編集用PCとモニター',
      '素材・音源の使用料',
      '撮影機材・業務交通費',
    ],
    invoice:
      '企業案件と個人クリエイター案件で取引条件は違います。外注費が多い場合には本則課税と簡易課税の比較も重要です。',
  },
  {
    slug: 'consultant',
    name: 'コンサルタント',
    sales: [800, 1200, 1500],
    expenseRatio: 0.13,
    jigyo: true,
    businessTax:
      'コンサルタント業は個人事業税の法定業種です。表では税率5%を使います。研修・執筆等を兼ねる場合は所得区分を都道府県税事務所で確認してください。',
    expenses: [
      '調査データ・業務書籍',
      '会議・業務用システム',
      '出張・移動費',
      '業務に関連する専門家報酬',
    ],
    invoice:
      '法人顧客が中心なら、登録の有無に加えて報酬の税込・税抜条件を確認します。売上規模と基準期間によって免税や特例の可否は変わります。',
  },
  {
    slug: 'illustrator',
    name: 'イラストレーター',
    sales: [300, 500, 700],
    expenseRatio: 0.15,
    jigyo: false,
    businessTax:
      '著作物の創作を想定し、表は対象外として計算します。デザイン業・請負業等に該当するかは業務の実態で判断されます。TODO(要確認)：対象外と断定せず都道府県税事務所に確認してください。',
    expenses: [
      '画材・ペンタブレット',
      '制作ソフト・素材',
      '作品集・営業用印刷物',
      '業務用の資料・展示費',
    ],
    invoice:
      '個人向け販売と企業からの制作依頼で判断材料が異なります。著作権使用料や制作費の条件も分けて整理し、登録後の利益を試算します。',
  },
];
