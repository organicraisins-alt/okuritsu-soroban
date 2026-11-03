# フェーズ1 完了報告

日付：2026-10-26。作業範囲はフェーズ1のみです。フェーズ2以降のフォーム・ツール・集客ページは未実装です。公開・デプロイしていません。

## 実装したもの

- Astro 7.4.2 static、TypeScript strict、Vitest 5.0.5。型検査ツールの対応範囲に合わせTypeScript 6.0.3を使用。
- src/lib/taxの7ファイルへ計算を移植。税制数値・探索刻み・納期をparams.tsへ集約。
- 原本を指定のClaudeワークスペースからprototype/index.htmlにコピー。cmpで完全一致を確認。distには原本を含めません。
- 共通ヘッダー・フッター・パンくず・BaseLayout、確認用モデルケースのトップ、404。
- プロトタイプの全テーマのCSSトークンとフォントを維持。バッジは「令和8年分の所得税改正に対応（一部は令和7年度の料率で概算）」。
- 所得税基礎控除の指定3区分と国民年金のみ確認済みとして公式出典を記録。他の値は変更せずTODO(要確認)。元コードに確認済み2項目がすでにあるため、移植に伴う年度改定差分はありません。
- PUBLIC_SITE_URLでcanonical/OGP/パンくずJSON-LD/条件付きsitemap/robotsを制御。PUBLIC_GA_IDがあるときのみGA4を読み込み、計算クエリを計測URLから除去。
- README、DESIGN.md、環境変数例、生成物の設定別検証スクリプト。

## 指定の回帰テスト6ケース

条件：青色65万円、40歳未満、個人事業税あり、追加控除0。法人は40歳未満、税理士費用30万円。金額は円。

| ケース                                     |                期待値 |                実測値 | 判定 |
| ------------------------------------------ | --------------------: | --------------------: | ---- |
| sole(8,000,000, 1,500,000).total           |             4,567,060 |             4,567,060 | 一致 |
| sole(12,000,000, 2,000,000).total          |             6,595,160 |             6,595,160 | 一致 |
| sole(5,000,000, 0).total                   |             3,713,160 |             3,713,160 | 一致 |
| employee(6,000,000)                        |             4,658,200 |             4,658,200 | 一致 |
| bestCorp(10,000,000, 0) のR / total        | 1,320,000 / 6,690,388 | 1,320,000 / 6,690,388 | 一致 |
| 利益6,500,000のbestCorp.total − sole.total |                47,522 |                47,522 | 一致 |

## 検証結果

- npm test：6ファイル、31テスト、全件成功。指定6ケースのほか、控除・税率境界、国保上限、40歳、赤字、法人報酬探索と配当、会社員二分探索、非有限入力、インボイスとカレンダーの原本比較、GAクエリ除去、デザイントークンを確認。
- ASTRO_TELEMETRY_DISABLED=1 npm run check：エラー0、警告0、ヒント0。
- npm run format:check：成功。原本は整形対象外。
- npm run verify:build：URL/GAの有無でcanonical、OGP、JSON-LD、robots、sitemap-indexと子sitemap、title/descriptionの一意性を確認。最後にURL/GAなしのdistへ復元。
- ASTRO_TELEMETRY_DISABLED=1 npm run build：警告なし、static、2ページ生成。
- audit_project.pyのstrict監査：指摘0。結果はpremium-audit.json。
- DESIGN.md公式lint：エラー0、文書内コンポーネントから未参照の色トークン9件の警告。Astroのビルド警告ではありません。
- 独立コードレビュー：重大な修正事項なし。
- 実ブラウザー：375 CSS pxでライト・ダークともinnerWidth=375、document.scrollWidth=375。バッジも折り返され横はみ出しなし。ライトは同じ生成HTMLのhtmlにdata-theme=lightのみ付けた一時ページで確認し、配信物は変更していません。
- キーボード：Tabで本文へのスキップリンクにフォーカス、Enterでmainへ移動。フォーカス枠を確認。
- 検証用サーバーを停止し、一時的な表示幅を解除しました。

## 生成された静的ファイル

PUBLIC_SITE_URL未設定の現在のdist：

```text
dist/404.html
dist/_astro/BaseLayout.Bj8I1roe.css
dist/index.html
dist/robots.txt
```

PUBLIC_SITE_URL設定時にはsitemap-index.xmlとsitemap-0.xmlが追加されます。canonical、og:url、BreadcrumbListも同じ公開URLで生成されます。

## 作成・保存したファイル一覧

サイトディレクトリからの相対パスです。node_modules、dist、.astroの内部生成物を除く全ファイルを列挙しています。

```text
.env.example
.gitignore
.prettierignore
.prettierrc.json
DESIGN.md
README.md
astro.config.mjs
config/analytics.mjs
config/site.mjs
docs/evidence/375-dark.png
docs/evidence/375-light.png
docs/phase1-report.md
docs/premium-audit.json
package-lock.json
package.json
prototype/index.html
scripts/verify-build.mjs
src/components/Analytics.astro
src/components/Breadcrumbs.astro
src/components/Footer.astro
src/components/Header.astro
src/env.d.ts
src/layouts/BaseLayout.astro
src/lib/tax/calendar.ts
src/lib/tax/corp.ts
src/lib/tax/employee.ts
src/lib/tax/format.ts
src/lib/tax/invoice.ts
src/lib/tax/params.ts
src/lib/tax/sole.ts
src/pages/404.astro
src/pages/index.astro
src/pages/robots.txt.ts
src/styles/global.css
tests/analytics.test.ts
tests/design-tokens.test.ts
tests/helpers/prototype.ts
tests/invoice-calendar.test.ts
tests/regression.test.ts
tests/seo.test.ts
tests/tax-boundaries.test.ts
tsconfig.json
vitest.config.ts
```

サイト外の実装計画：docs/superpowers/plans/2026-10-26-soroban-phase1.md。

## 残件と停止位置

- 国保、協会けんぽ・介護・子ども子育て、雇用保険、給与所得控除の特例加算範囲、インボイス3割・経過措置などは未確認です。元コードを維持しており、現行制度の正確な適用を保証していません。
- 国民年金は年度月額×12、カレンダーは同程度の所得が続く概算。暦年の実支払額や初年度の実請求とは異なります。
- 公開ドメイン未定のため本公開SEOは保留。未設定時はnoindex、robotsは全禁止、canonical/og:url/絶対URLのJSON-LD/サイトマップを省略します。
- GA4拡張計測の管理設定、OG画像、本公開前の制度・コンテンツレビューは今後の確認事項です。
- Lighthouse各90以上は本フェーズでは未測定です。375pxの表示確認をLighthouse合格とは扱いません。

ご指定どおりフェーズ1で停止します。
