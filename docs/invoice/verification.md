# インボイス改修の検証（2026-10-27）

利用者承認済みの仕様A・Bを実装し、本番反映まで実施します。既存のAstro・TypeScript構成を維持し、依存は追加していません。

- npm test：26ファイル・106テスト成功。指定2026/2027ケース、2028〜2031の按分、基準期間、除外理由、値下げ0・売上0、分岐0・100%超、旧URL、旧プロトタイプ完全互換を含む。
- npm run check：136ファイル、エラー・警告・ヒント0。
- PUBLIC_SITE_URL=https://okuritsu-soroban.com npm run build：67ページ生成。サイトマップ公開対象は60ページを維持。
- 375px・1280px：年度切替、手動割合、再読み込み、旧fragmentURL、基準期間未確認、金額全角・カンマ、ヘルプのEscと関連付け、モバイル結果フォーカス、6年のSVGと表を確認。横はみ出し・実行時エラーなし。
- コピー通知は、利用者のシステムクリップボードを書き換えないAPI置換で成功・失敗を検証。
- 主入力4項目、ツール切替ナビ1つ、インボイス専用のバッジと前提。仮広告と空の広告欄が既定で出ないことを確認。

詳細：browser-check.json。スクリーンショット：invoice-375.png、invoice-result-375.png、invoice-years-375.png、invoice-1280.png、invoice-years-1280.png。

独立レビューでは、年次SVGの追加と、旧fragment条件を失わない前提の開き方を修正しました。さらに分岐0%の扱いをテストで固定。分岐比率の表示は丸めを含むため近似と明記しています。

PR説明、指定ケースの数値、公式出典はpr-description.md。公開後の実測はpublish-check.jsonへ記録します。

## 公開後の実測

2026-10-27に本番へ反映。https://okuritsu-soroban.com/tools/invoice/ はHTTP 200。公開スナップショット：https://242b1351.dokuritsu-soroban.pages.dev （ソースe1b26c8）。指定2026/2027ケース・自動/手動・共有URL・375px/1280px・SVGと表・コピー通知を公開サイトでも再確認しました。publish-check.jsonとlive-*.pngが本番の証跡です。サイトマップ公開対象60件、雛形6件の除外・noindex、主要ページも維持しています。
