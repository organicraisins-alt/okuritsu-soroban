# 2026-11-03 変更・検証記録

起点：main c40ae3b。Search Consoleの変更前記録は ../../search-console/2026-11-03-baseline.md（同リポジトリ）に先行保存済み。

## 変更

1. 会社員比較9ページのtitleを指定どおり変更。h1直下に既存employeeComparisonの計算結果から年額・月額の結論を追加。同額のフリーランス利益ページを明記して相互リンク。
2. 事業税の記事に第1種5%・第2種4%・第3種原則5%と一部3%の目安表、条件付きの対象外例、6職業へのリンクを追加。出典と判断の限界はsources.mdに記録。記事の表示・Article更新日を2026-11-03に更新。
3. 利益別25ページのtitleを指定どおり変更。5つの税・保険料を合計して冒頭に表示し、内訳へアンカーリンク。
4. 年収一覧に売上1,000〜2,000万円（100万円刻み）×3経費率の換算表を追加。換算額はsrc/lib/taxのsole().profitを利用。存在しない利益880万円や1,050万円等は、正確な入力の計算リンクと前後の既存利益ページを明記する。新しいURLは作らない。消費税は手取りと別に確認する案内とインボイスへのリンクを追加。

## 計算と検証

- 既存のparams.ts / sole.ts / employee.ts / content.ts等の計算ルール・端数処理は変更なし。page-summary.tsは既存結果の表示用集計・利益換算のみ。
- npm test：29ファイル・116件成功。
- npm run check：142ファイル、エラー・警告・ヒント0。
- PUBLIC_SITE_URL=https://okuritsu-soroban.com npm run build：成功、67HTML。
- sitemap60件、雛形6件noindexと除外を維持。全金額34ページのtitle・結論・同額リンクを生成HTMLで確認。内部リンク先の欠落0。
- 375px：公開60＋雛形6＝66ページで実際のCSS幅375pxを確認、横はみ出し0。大きな表はラベルとcaption付きの領域内で横スクロール。
- 初回に事業税表の親グリッドが広がる問題を検出し、子要素のmin-widthを修正。修正前の幅631px→修正後はページのclient幅内（375pxのブラウザーでclient361px、scroll361px）。全66ページで再確認。
- 別コンテキストのレビュアーにより重要指摘なし。指摘された更新日の混同は、計算データ確認日とページ更新日の別表示で整理。

local-verification.json / viewport-375.json と画面画像を保存。管理画面画像は個人情報を含むためGitから除外。

## 公開

公開済み。実装コミットc785d9bをmainへfast-forwardで統合し、GitHubへpush後、既存のnpm run deployでCloudflare Pagesへ公開。

- 本番：https://okuritsu-soroban.com/
- デプロイ：https://acd89ad8.dokuritsu-soroban.pages.dev
- 実測時刻（UTC）：2026-11-03T07:29:12.564Z
- 全60公開ページHTTP 200、title60件すべて今回の生成HTMLと一致。
- 会社員比較9・利益別25ページの新title、会社員の冒頭結論、利益別の税・保険料合計を確認。
- /nenshu/ の換算表と正確な1,050万円への計算リンク、/guide/kojin-jigyouzei/ の税率表・条件付き対象外例を確認。
- sitemap-index.xmlと子サイトマップはHTTP 200。公開URL60件・重複なし・雛形6件除外を確認。
- 雛形6件はHTTP 200でnoindexを保持。
- 会社員年収900万円の本番画面をブラウザーで表示し、新titleと「約661.6万円（月55.1万円）」の結論を確認。本番のCSS幅375pxでもページ全体の横はみ出しなし。
- 本番画像：production-employee-900-375.png。全URLとtitleの実測データ：production.json。
- wwwのDNS・転送設定、コンセプト、既存URL、既存の税計算ロジックは変更していない。

