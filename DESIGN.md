---
version: alpha
name: 億率（おくりつ）
description: フリーランスの税と手取りを、帳簿の見開きのように比較する計算サイト。
colors:
  accent: '#cf424b'
  accent-soft: '#fff0ef'
  hero-bg: '#fff5f3'
  background: '#f5f8f8'
  paper: '#ffffff'
  ink: '#123b42'
  muted: '#5f7074'
  rule: '#e0e8e8'
  rule-strong: '#bdcccc'
  primary: '#083b43'
  primary-soft: '#edf4f4'
  take: '#1e7563'
  take-soft: '#e6f2ee'
  warning: '#a84c25'
  warning-soft: '#fff1e9'
  pr: '#80621d'
  pr-soft: '#faf3df'
typography:
  display:
    fontFamily: '"Zen Kaku Gothic New", "Hiragino Sans", "Yu Gothic", sans-serif'
  body:
    fontFamily: '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif'
  number:
    fontFamily: '"IBM Plex Mono", ui-monospace, "SFMono-Regular", Menlo, monospace'
rounded:
  DEFAULT: '18px'
  input: '10px'
spacing:
  page-max: '1184px'
  page-inset: '20px'
  tool-gap: '24px'
components:
  header:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
  footer:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.muted}'
  breadcrumbs:
    textColor: '{colors.muted}'
---

# 億率（おくりつ） Design System

## Overview

旧計算の互換確認はprototype/index.htmlを参照します。現在の見た目は2026-10-27に利用者が選択した案②に従います。日本のフリーランスと独立を考える人が、スマートフォンやPCで手取り・法人化・資産の見通しを比較するサイトです。

North Starは「パソコンの中の計算が、そのまま自分の計算になる」。白、淡いピンク、青緑、控えめなコーラルで、紹介から計算へつなぎます。

Runtime ownerはsrc/styles/global.cssの:root。src/styles/showroom.cssは共通トークンを参照するレイアウト層で、本書は生成元ではありません。

## Colors

primary→--ai、primary-soft→--ai-soft、take→--take、background→--bg、paper→--paper、ink→--ink、muted→--muted、rule→--rule、rule-strong→--rule-strong、warning→--warn、warning-soft→--warn-soft、pr→--pr、pr-soft→--pr-soft。計算内訳色は元コードの--seg-*を維持します。

既定はdata-theme="light"。明示のdata-theme="dark"用の色も保持します。暗色のbg #0c2025、paper #132c32、ink #e6f0f0、ai #8ec9c9、take #69c7abを含め全値の正本は元styleです。スクロールバーもrule-strong/bg/muted/aiを使い、強制カラーではシステムに任せます。

## Typography

見出しは--f-display、本文は--f-body、金額は--f-num。日本語フォールバックを維持し、数字は等幅・tabular-numsです。本文16px・行高1.8を基準に、補足・ラベルは役割に応じて小さくします。heroのemは斜体にせず色で強調します。日本語の折り返しを強制的に分断せず、長いバッジだけ自然な折り返しを許します。

## Layout

wrap最大1184px、左右PC24px・モバイル20px。入力350pxと結果の2列、860px以下で1列です。375pxで横にはみ出させず、表のみ内部スクロールにします。

年収別・会社員比較の記事は最大960pxで読み進める構成です。375pxでは結論と各セクションを1列にし、比較表だけを内部スクロールに収めます。金額・FAQ・PR・パンくずは計算ツールと同じ書式・所有コンポーネントを使います。

## Elevation & Depth

paperと1pxの罫線で区切り、勝者強調の内側線以外に強い影を追加しません。バナーや固定要素で結果やフォーカスを隠しません。

## Shapes

カード18px、入力10px。長い税制バッジは元の色と余白を維持し、モバイルで読めるよう10px角丸と複数行にします。

## Components

BaseLayoutがHeader、Footer、パンくず、meta/OGP、条件付きAnalyticsを所有します。パンくずの現在地はリンクにせずaria-current="page"。skip-linkで本文へ移動できます。リンクはhover・focus-visible・activeを用意します。

フォームは原本のネイティブinput/select/radioを使用します。フォームのエラーは日本語のテキストとaria-invalidで示し、読み上げは小さなstatus領域に集約します。ダイアログ、CRUD、検索、非同期ローディングは対象外です。計算例はdlで内訳を示し、結果と前提を近くに配置します。日本語のです・ます調、金額はja-JP、未確認の制度を断定しません。パソコン写真に実計算のHTMLを重ね、補助アイコンはIconコンポーネントを使います。元バーの遷移はprefers-reduced-motionで無効になります。

## Do's and Don'ts

- 元ファイルの計算・言葉・トークンを変更するときは根拠を明示します。
- 売上、利益、手取りを区別し、確認済み項目と未確認料率を同じ確度で表示しません。
- 税制バッジは依頼者指定の暫定表記を使います。
- まだないツールへの偽リンクや、使えそうに見える未実装ボタンを置きません。

## 2026-10-27 リブランド（UI整理前の履歴）
この時点では既存トークンを維持。ロゴは億率＋小さな読み。トップの主役は確率と入力、資産推移は藍の中央値線と淡い帯。資産形成と独立準備を併設し、ナビ・前提・次に読むを共通化する。

## 2026-10-27 承認済みUI整理（旧見た目の記述を置き換える）

North Starは「パソコンの中の計算が、そのまま自分の計算になる」。白・淡いピンク・青緑・控えめなコーラルで紹介から計算へつなぐ。旧プロトタイプは計算の互換確認用に残し、現在の見た目は利用者が承認した案②に従う。

Runtime ownerはsrc/styles/global.cssの:root。src/styles/showroom.cssは共通トークンを参照するレイアウト・操作層。角丸はカード18px・入力10px。日本のフリーランスと独立検討者が対象。日本語・円・ja-JP、スマートフォン中心。ライトを既定とし、明示ダーク指定も維持。追加依存なし。

ヘルプの正本はsrc/lib/ui/markup.ts + client.ts、AstroラッパーHelp。クリック・タッチ・Enterで開閉、Esc・外側クリックで閉じる。結果再描画もイベント委譲で対応する。入力追加条件・結果内訳・しくみ・カレンダーはネイティブdetails/summaryで開閉。既存アンカーは自動展開。追加条件のエラー時はそのdetailsを開く。

条件要約はsrc/lib/ui/conditions.ts。URL復元した追加条件も閉じたまま確認できる。ラベル・単位・概算・対象地域・掛金支出前の意味・投資免責を常時表示する。375pxでは1列、ツールナビは短い4ラベル。本文スクロールを維持し、強制スクロールや固定高のフォームは使わない。

入力はToolForm、結果はrenderTool、配置はCalculatorPanelをトップと既存ツールで共有。億率は既存OkuritsuCalculator。金額・確率はtax/okuritsuから生成。

画像はbuilt-in image_genで生成した正面の銀色ノートPC、白い空画面、淡いピンクの机と自然光。生成プロンプトは「文字・数字・UI・ロゴなし、正面の無銘銀色ノートPC、白い空画面、淡いピンクの机と自然光」。public/images/laptop-{640,1000,1536}.webpへ保存。実際の計算プレビューをHTMLで重ね、写真に金額を焼き込まない。

## インボイス専用UI（2026-10-27）

InvoiceFormとsrc/lib/tools/invoice.tsが対象画面を所有。主入力は売上・課税経費・年分・事業者向け割合。基準期間・除外条件・業種・値下げ要求率・経過措置の自動/手動は詳細設定へ。年分と選択肢は即時更新、文字入力はIME確定後に更新。スマホの送信は検算後に結果へ移動。

インボイスだけはヘッダーの機能リンク・パンくずを表示せず、ツール切替を1つのナビへ集約。年度バッジと前提は消費税専用。結果は結論→登録比較→損益分岐→方法カード→年次SVGと表→詳しい前提。非登録免税の仮定を満たさない場合は比較を抑止。割合の分岐点表示は近似値と示す。

共通トーストはapp-toast。コピーの成功/失敗をrole=statusで通知。helpボタンはaria-controlsとaria-describedbyを持つ。インボイス結果は安定したresult-status領域で金額要約をpoliteに読み上げる。仮広告はPUBLIC_SHOW_PLACEHOLDER_ADS=trueの場合のみ表示し、既定では空の広告開閉欄も出さない。
