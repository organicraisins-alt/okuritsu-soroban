# 億率UI整理 Implementation Plan

> Execute with superpowers:executing-plans in the existing checkout. The user selected and approved visual direction ②, including the calculator disclosure design.

**Goal:** 紹介から計算へつながるトップと、補足を開閉できる計算画面。
**Architecture:** Astroの共通コンポーネントと素のTSによるイベント委譲。入力・結果生成の計算経路はそのまま使い、税金の値をUIへ手書きしない。
**Tech Stack:** Astro 7 / TypeScript / CSS / Vitest。
**Spec:** ../specs/2026-10-27-product-showroom-design.md

## Global Constraints
- src/lib/taxとsrc/lib/okuritsuの計算ロジックを維持。
- 375pxでページ全体の横はみ出しなし。ラベル・単位・重要な前提・免責・PRを維持。
- 実装前のGitHub OSS比較をspecに記録済み。ユーザーによる案②承認に基づくUI実装で、依存や構成の変更は行わない。

## Review Focus
- 折りたたみ内の無効入力が見えないままにならない。
- 結果の再描画後もヘルプが動く。
- /tools/tedori/#calendarなどの既存リンクを維持。
- URLで復元した追加条件と入力表示・結果が一致。
- トップに複数の計算器を配置してもイベントやIDが衝突しない。

## Task 1: 共通操作と計算画面
- [x] helpMarkup・disclosure・ハッシュによる開閉のテストを先に追加し失敗を確認。
- [x] 共通ヘルプ、details、入力の要約・エラー開示、結果の整理を実装。
- [x] 既存の税・保険・シミュレーション回帰を含めてテスト。

## Task 2: 配色とトップ
- [x] 新トークンを承認案へ更新し、DESIGN.mdに記録。
- [x] ヘッダー・ツールナビ・パソコン画像と実計算プレビューを追加。
- [x] 手取りと億率の計算、独立準備・既存コンテンツをトップへ整理。

## Task 3: 検証と記録
- [x] npm test / npm run check / 本番URL指定buildを実行。
- [x] ブラウザで375pxと1280px、ヘルプ・エラー・共有入力・アンカーを確認。
- [x] 差分レビュー、画面証跡、変更ファイルだけをコミット。

## 実行記録
- 既存チェックアウトを継続利用。開始時点のサイト変更はdocs/search-consoleの未追跡証跡のみで、本件に含めない。

- 完了: 85テスト、check 0エラー・0警告、67ページbuild、375pxの67ページと1280pxの主要画面を確認。独立レビューの3件を修正。詳細はdocs/ui-showroom/verification.md。公開なし。
