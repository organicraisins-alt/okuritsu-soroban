# Search Growth Implementation Plan

**Goal:** 既存60公開ページの検索入口・関連記事・日付を改善する。
**Architecture:** 既存Astroの静的生成を継続し、関連リンクと記事履歴を型付きデータで管理。
**Tech Stack:** Astro / TypeScript / Vitest / 既存CSS。
**Spec:** ../specs/2026-10-28-search-growth-design.md と2026-10-28の追加承認。

## Global Constraints

年収別25ページ・会社員比較9ページを含む。title末尾は｜億率。税計算変更なし。60公開URL・6雛形noindexを維持。375px確認。公開前に利用者が提供するSearch Console画面を記録する。

## Tasks

- [x] 1. 本番about確認と変更前記録。画面未着中は実装のみ進める。
- [x] 2. title末尾と検索意図、金額別・話題別関連リンクのテストをRED→GREEN。
- [x] 3. 記事ごとの日付と公式出典の確認、短い結論と開閉する前提、favicon。
- [x] 4. test/check/build、60件・noindex・内部リンク・375px確認、最終レビュー。
- [x] 5. baseline受領後に公開し、本番HTTP/title/sitemap/noindexを実測。

## Review Focus

存在しない金額ページへのリンク、売上と利益と給与額面の混同、根拠のない確認日、JSON-LDと表示日付の差、未完了雛形のindex化。

## Progress / Rulings

- 本番aboutは指定された経歴・AboutPageが公開済み（HTTP取得2026-10-28）。経歴の追記はしない。
- 同額の比較ページが存在しない利益帯では近い既存の会社員年収を明記して案内する。架空の同額ページは作らない。
- 金額別の次に読むページは前後・比較・億率を含むため最大4件。既存の3件制限より今回の指定を優先。
- Search Console画面は未受領。数値を推測せず、公開前に記録する。

- 2026-10-28 検証：113テスト成功、138ファイルの型確認エラー・警告なし、67HTML生成。60件sitemap・雛形6件noindex、66画面375px横はみ出しなし、内部リンク切れ0、34金額ページtitle確認済み。
- 最終レビュー：別コンテキストのレビュアーにより重大な問題なし。出典確認記録を `docs/search-growth/2026-10-28-source-check.md` に保存。
- 公開待機：必要なSearch Console画面が未着のため、本番更新と公開後実測は未実施。再承認は不要、画面受領・記録後に公開を続ける。

- 2026-10-28 公開完了：eeae436で変更前記録と実画面を保存後に公開。デプロイf653d91e。全60ページHTTP200・title一致、サイトマップ60、雛形6件noindexを実測。過去の「画面未受領・公開待機」はこの記録で解消。添付自体は確認できず、同じプロパティの認証済み実画面を直接保存した。
