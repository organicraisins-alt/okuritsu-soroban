# 独立のそろばん

Astro静的サイトのフェーズ3。トップ、手取り計算、法人化シミュレーター、インボイス計算を実装しています。年収別25ページ、会社員比較9ページ、全金額の早見表を追加しています。職業別・ガイドの専用ページは未実装です。公開・デプロイはしていません。

## 開発の始め方

Node.js 22.23.4以上（検証は24.15.0）、npmを使用します。

```sh
git clone https://github.com/organicraisins-alt/okuritsu-soroban.git
cd okuritsu-soroban
npm ci
cp .env.example .env
npm run dev
npm test
npm run check
npm run format:check
npm run build
npm run preview
```

`npm test`はVitestの非watch実行、`npm run check`はAstro/TypeScriptの型検査です。ESLintは未導入で、整形はPrettierで検証します。実行環境が設定領域への書き込みを制限する場合は、`ASTRO_TELEMETRY_DISABLED=1 npm run build` のようにAstroのテレメトリーを無効化できます。

## 環境変数と公開準備

- `PUBLIC_SITE_URL`: 公開予定のhttp(s) origin。認証情報・サブパス不可。空欄ではcanonical/og:url/絶対URLのパンくずJSON-LD/サイトマップを生成せず、全ページnoindex・robotsでクロール禁止にします。設定するとcanonicalはクエリ・hashなしとなり、@astrojs/sitemapがsitemap-index.xmlと子sitemapを生成します。
- `PUBLIC_GA_ID`: 任意のGA4測定ID（G-…）。空欄ではGA4を読み込みません。設定時はpage_locationとpage_referrerからクエリ・hashを除去します。GA4管理画面でもフォーム操作・履歴変更等の拡張計測を公開前に確認してください。

両変数は静的ビルド時に埋め込まれます。変更したら再ビルドしてください。公開ドメインは https://okuritsu-soroban.com です。公開設定の検証結果は docs/launch-report.md を参照してください。OG画像は未作成で、現時点のOGPはタイトル・説明・URL等の基本情報のみです。

```sh
npm run verify:build
```

このコマンドはテスト用の予約ドメインで環境変数の有無を確認します。最後にURL/GAなしで再ビルドするので、distにテストドメインは残りません。

## 計算と税制パラメータの更新

旧版の基準は `prototype/index.html`（受領した原本のコピー、無改変）。令和8年度への更新は公式資料に基づき、新旧別のプロファイル・回帰テストで検証します。`src/lib/tax/` はDOM・API・環境変数に依存しない純粋関数です。

- `params.ts`: 年度パラメータ、確認状態、出典、暫定バッジ。既定は2026年。
- `sole.ts`: 基礎控除、所得税、給与所得控除、住民税、国保、個人事業主の手取り。
- `corp.ts`: 法人税、役員報酬・配当、12万円刻みの報酬探索。totalは全額配当で個人が受け取る概算額です。
- `employee.ts`: 会社員手取り、同じ手取りとなる額面年収の二分探索。
- `invoice.ts`: 2割・3割・簡易・本則と登録比較。対象年・基準期間・登録理由・除外条件で2割/3割を判定します。
- `calendar.ts`: 同じ所得が続く前提の概算納付カレンダー。初年度の実際の請求・予定納税基準額の判定とは異なります。
- `format.ts`: 円・万円表示、丸め、非有限値検証。

更新時は該当年度の `TAX_PARAMS_BY_YEAR` を編集し、国税庁・日本年金機構・協会けんぽ・自治体の公式URL、適用年と確認日をコメントで残します。数値の改定なら原則paramsだけで反映します。計算方法自体が変わる改正では関数とテストも変更します。確認できない値は元の値と `TODO(要確認)` を残してください。

国保4区分、協会けんぽ東京・介護・子ども支援、雇用保険、給与所得控除、インボイスの特例・経過措置はdocs/params-check.mdの公式資料に基づき更新済みです。その他の簡略化はparams.tsに残しています。国民年金年額は年度月額×12で、暦年に実際に支払う額ではありません。国保は低所得軽減・減免を、社会保険は標準報酬等級を精密には再現しません。iDeCo等の掛金を追加控除として扱いますが、将来資産なので元コードどおり手取りから引きません。

まず元コードとの指定6回帰ケースを維持し、制度改定は別の根拠付きテストで差分を検証します。原本を更新して既存テストの基準をすり替えないでください。旧パラメータはtests/fixtures/prototype-params.tsに固定し、同じ計算関数に渡して原本と比較します。新6ケースと差額はdocs/phase25-report.mdを参照してください。

## ページの追加方法

1. `src/pages/` にAstroページを作成し、`BaseLayout`へ固有のtitle、description、パンくずを渡します。
2. 金額は `src/lib/tax/` から計算し、ページ内へ税額を手書きしません。
3. 結果の近くに概算表示、地域・家族・年齢などの前提を記載します。
4. 広告は今後 `src/data/offers.ts` に集約し、PRと `rel="sponsored noopener"` を必須にします。フッターの広告利用表記を維持します。
5. build後にtitle/description重複、canonical、構造化データ、sitemap、375pxとライト／ダークを確認します。

動的な静的生成ルートにはgetStaticPathsを使用します。src/pages以外のprototypeはdistへコピーされません。フォント・色は `DESIGN.md` と `src/styles/global.css` を参照してください。

## 完了範囲と残件

フェーズ3まで。各ツールは入力条件をURLへ反映し、再読込で復元します。入力金額は万円、URLのblueのみ円です。金額は0〜100,000万円に制限し、不正入力では直前の結果を保持します。税制の公式調査はdocs/params-check.md、反映記録はdocs/phase25-report.mdにあります。インボイスは既定70%で対象年・基準期間・登録条件を指定します。

税計算・SEO・GAのテストは `tests/`、生成HTMLの設定別検証は `scripts/verify-build.mjs`、結果とファイル一覧は `docs/phase1-report.md` を参照してください。公式調査の結果と現行実装の差分、フェーズ2のスクリーンショット、Lighthouse1回の測定結果はdocs/phase2-report.mdを参照してください。その後の税制反映はdocs/phase25-report.md、公開設定はdocs/launch-report.mdを参照してください。

## 年収別・会社員比較ページ

src/data/amounts.tsの範囲からgetStaticPathsで生成します。年収別の「年収」は売上ではなく利益です。incomeSummaryが年額、月額、条件別比較、掛金シナリオ、法人比較、FAQを共通計算します。金額を増やすときはデータ範囲とページ内容を確認してください。

会社員比較はemployeeComparisonで必要な利益を探索し、経費率に応じた売上を1,000円単位に切り上げます。経費率は0〜90%で変更できURLにも保存します。税額が下がったり上がったりする控除境界で全域の単純な二分探索をせず、区間を分けています。

本フェーズの生成ページ一覧・3枚の375px画像と検証結果はdocs/phase3-report.mdを参照してください。PUBLIC_SITE_URL未設定では引き続きnoindexでサイトマップを出しません。公開URL設定時には公開対象39ページがsitemapに載ります。

## Cloudflare Pagesへの公開

公開URLは https://okuritsu-soroban.com です。Node.js 22.23.4以上で `npm ci` を実行してください。初回は `npx wrangler login` でブラウザーから許可し、プロジェクトがない場合のみ `npx wrangler pages project create dokuritsu-soroban --production-branch=main` を実行します。

```sh
npm test
ASTRO_TELEMETRY_DISABLED=1 npm run check
npm run deploy
```

`deploy` は PUBLIC_SITE_URL の既定値を `https://okuritsu-soroban.com` として毎回再ビルドし、Wranglerで `dokuritsu-soroban` の本番ブランチ `main` へ直接アップロードします。別ドメインの場合は `PUBLIC_SITE_URL=https://example.com npm run deploy` と指定します。公開後は表示、robots.txt、sitemap-index.xmlを確認してください。独自ドメインはCloudflare Pagesのプロジェクト内「Custom domains」から登録します。

PUBLIC_GA_IDは未設定ならGA4を読み込みません。設定前にGoogle Analytics管理画面の拡張計測のフォーム操作・ブラウザー履歴イベントを無効にし、入力条件を収集しない運用を確認してください。秘密のAPIトークンをPUBLIC_変数やリポジトリへ保存しないでください。

入力条件の共有は `#sales=800` 形式です。fragmentはページ取得時にサーバーへ送信されません。旧query形式は互換読み込み後にfragmentへ置き換えますが、旧URLの最初のリクエストはサーバーへ届きます。お問い合わせ先は `/contact/` に実際の窓口を記載してから受付開始してください。

公開対象は案内3ページを含む42ページです。404ページのみnoindexを維持します。以前のフェーズ報告の公開保留・39ページという記載は当時の状態です。

## 億率リブランド（ローカル実装）

サイト名の定義はconfig/site.mjs。既存URLとCloudflareプロジェクト名は維持します。/okuritsu/、/logic/、/dokuritsu/を追加し、職業別6・解説9ページを静的生成します。運用の予定・更新・GA4設定・公開前の運営者記入事項はdocs/operations.mdを参照してください。

億率はsrc/lib/okuritsu/のシード付き1万回シミュレーションです。tax/soleの掛金支出前の手取りに掛金を足さず、手取り−生活費を総積立とします。差分比較は同じ乱数列、毎年の手取り・生活費・税保険条件は固定。運用成果を保証しません。

共有URLは今回の指定によりquery形式へ戻しています。再読込や共有先で開くと金額等が配信サーバーへ届くため、privacyを合わせて変更しました。従来のfragmentも復元できます。上記の過去の公開時点でのfragment説明は履歴であり、現在の新規共有の形式ではありません。

OG画像はビルド時にsatoriとresvgで生成。assets/fontsの日本語フォントとOFLを同梱し、ビルド時の外部フォント取得はありません。画像は既定の計算例です。公開する場合は上記のdeploy手順を使います。

## 2026-10-27 インボイス計算の更新

個人事業主向けに年分・基準期間で適用可否を判定し、経過措置は月次均等の年間実効値を自動設定します。2026年は77.5%、2027年70%、2028年65%。明示した旧URLの割合は手動値として復元します。登録しない場合も課税となる条件では、免税を前提とした比較は行いません。

仮広告を確認する場合だけPUBLIC_SHOW_PLACEHOLDER_ADS=trueでビルドしてください。既定の本番では非表示です。変更点・検算例・公式出典はdocs/invoice/pr-description.md、操作確認はdocs/invoice/browser-check.jsonを参照してください。

## この公開リポジトリに含めるもの

サイトのソース、計算・回帰テスト、設定例、原型、画像・フォントとライセンス、設計・運用・検証ドキュメントを収録しています。2026年10月28日に公開した検索流入改善を含みます。

認証情報、実際の`.env`、依存パッケージと生成物、Cloudflare・Search Consoleの管理画面画像は含めません。検証記録内で参照する管理画面画像は運営者の手元で保管しています。
