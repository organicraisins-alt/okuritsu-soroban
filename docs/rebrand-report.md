# 億率リブランド・流入施策の実装報告

2026-10-27。フェーズ4・5を先に完了し、A〜Eをローカル実装しました。**公開・デプロイは実行していません。** 既存URLとCloudflareプロジェクト名を維持しています。

## 検証結果

- npm test：20ファイル・76件すべて成功。旧6件・現行6件、億率のseed再現・途中到達・掛金二重計上・下限・不正入力・共有とGAを含む。
- npm run check：115ファイル、エラー0・警告0・ヒント0。
- PUBLIC_SITE_URL=https://okuritsu-soroban.com ASTRO_TELEMETRY_DISABLED=1 npm run build：警告なし、HTML67件、OG画像42件。
- 公開対象60件がsitemapに収録。雛形6件と404はnoindex・sitemap除外。
- 全67 HTMLを実ブラウザーのCSS幅375pxで確認。ページ全体の横はみ出し0、「次に読む」3件ずつ。viewport-checks.jsonに全件の実測を保存。
- title/description重複0、内部ページ・OG画像リンク切れ0。旧サイト名はaboutの由来欄のみ。
- query形式と従来のhash形式の復元、再読込、トップ→詳細への引き継ぎ、不正年齢での直前結果維持を実操作で確認。
- 簡易計算23ms、詳細25〜33ms、最長82年間65ms（このMacのブラウザー、375px、CPUスロットリングなし）。100ms未満のためWorkerは追加していません。他端末の時間を保証するものではありません。
- GA4未設定で読み込みなしを確認。有効時のカスタムイベントも固定分類とルートURLのみで金額を除くことをテスト。GA4管理画面の拡張計測無効化は運用手順に記載。
- 独立した最終レビューで、簡易版が非表示の詳細条件を復元するP2を1件検出。復元項目を表示4入力＋seed/版に制限し、回帰テストを追加して修正。

LighthouseとDESIGN.md lint、追加の独自監査は今回実行していません。メタ情報・URL・構造化データの一覧は依頼に必要な報告として生成しています。

## 億率の計算例

共通：30歳→60歳、金融資産0円、生活費年300万円、青色65万円、掛金なし、事業税あり、東京23区単身、平均4%・標準偏差15%、1万試行、seed=20261027、モデル版1。売上=利益・経費0円として計算。

| 利益 | 年間手取り | 毎年の総積立額 | 億率 | 中央値の線が1億円に届く年齢／届かない場合 |
|---|---:|---:|---:|---|
| 500万円 | 3,706,160円 | 706,160円 | 2.7% | 60歳時点34,513,923円 |
| 800万円 | 5,407,260円 | 2,407,260円 | 71.0% | 57歳 |
| 1,200万円 | 7,742,360円 | 4,742,360円 | 98.9% | 47歳 |

億率は期限までに一度でも到達した試行の割合で、最終年だけの到達率とは異なります。中央値線は各年の分位点で、一つの実際の経路ではありません。将来の運用成果を保証しません。

トップ・OG・下の画像の初期値は**売上800万円−経費150万円＝利益650万円**のため億率35.2%です。上表の利益800万円とは条件が異なります。

## 追加した公開ページ（18件）

- `/dokuritsu/`
- `/guide/dokuritsu-1nenme/`
- `/guide/juminzei-itsu/`
- `/guide/kakutei-shinkoku/`
- `/guide/keihi/`
- `/guide/kojin-jigyouzei/`
- `/guide/kokuho-takai/`
- `/guide/shiharai-calendar/`
- `/guide/yotei-nouzei/`
- `/guide/zeisei-kaisei-2026/`
- `/logic/`
- `/okuritsu/`
- `/shokugyo/consultant/`
- `/shokugyo/designer/`
- `/shokugyo/engineer/`
- `/shokugyo/illustrator/`
- `/shokugyo/video/`
- `/shokugyo/writer/`

## 変更した既存ページ

- `/`：共通エンジンの4入力簡易版、改善手段3つ、独立前の入口。
- `/nenshu/`と年収別25ページ：ブランド・metadata・相互リンク、各利益での億率とX共有。
- `/hikaku/kaishain-400/`〜`1200/`の9件：ブランド・OG画像・内部リンク。既存の比較入力は保持。
- `/tools/tedori/`・`/tools/houjinka/`・`/tools/invoice/`：ブランド・前提リンク・query共有。手取りにX共有。既存の支払いカレンダーや初年度の情報は削除していない。
- `/about/`：経験、プロフィール記入欄、由来、監修者、確認・更新方針。
- `/privacy/`：ローカル計算とquery共有・X・配信サーバーの扱いを区別。
- `/contact/`：窓口準備中を維持し、記入TODOを明示。
- `/404.html`：ブランドと共通導線。

元依頼のフェーズ6用に `/houjinka/timing/`・`/houjinka/yakuin-housyu/`・`/houjinka/shakai-hoken/`・`/setsuzei/aoiro-65/`・`/setsuzei/shoukibo-kyousai/`・`/setsuzei/ideco/` の雛形6件を追加。本文未完のためnoindexで、完成記事としての集客導線は置いていません。

全生成ページと各メタ値・文字数・canonical・OG・構造化データは [rebrand-pages.json](rebrand-pages.json) を参照してください。

## 運営者が記入するTODO（6箇所）

| ファイル | 項目 |
|---|---|
| src/pages/about/index.astro | 名前・活動名 |
| 同上 | 経歴 |
| 同上 | 税務システム構築に関わった具体的内容・担当範囲・期間 |
| 同上 | 連絡先 |
| 同上 | 監修者。未監修なら監修済みと表示しない |
| src/pages/contact/index.astro | 実際のお問い合わせ窓口 |

各箇所に `<!-- TODO(運営者が記入) -->` を記載。架空の経歴・氏名・資格は作っていません。Articleのauthorは当面サイトのOrganizationで、aboutへリンクします。広告先は引き続き仮URLです。

## title・descriptionの長さ

全60公開ページの文字数はJSONに保存。32文字を超えるtitleは次の3件で、いずれも33〜34文字です。120文字を超えるdescriptionはありません。元の長い年収別・会社員比較titleは短縮し、H1の具体的説明は保持しました。文字数は表示幅や検索結果での省略を保証する基準ではありません。

- `/guide/kokuho-takai/`：33文字 — 国保が高い理由と負担を見直す方法｜任意継続と比較｜億率（おくりつ）
- `/guide/yotei-nouzei/`：34文字 — 予定納税とは？対象・7月と11月の支払いと減額申請｜億率（おくりつ）
- `/guide/zeisei-kaisei-2026/`：33文字 — 令和8年の税制・料率更新で手取りはいくら変わる？｜億率（おくりつ）

## 構造化データの確認URL

[rebrand-rich-results.md](rebrand-rich-results.md) に全60公開URLとWebSite・Organization・BreadcrumbList・FAQPage・Articleの実装種別を列挙しました。新ページは未公開のためGoogleのリッチリザルトテストは未実施です。生成HTMLのJSON構文と一覧は確認しています。

## 公開前に残る作業とモデルの制約

- 現在のapexはHTTP 200。wwwはDNS未設定（ENOTFOUND）。`public/_redirects`にwww→apexの301を用意済みですが未デプロイです。公開指示後にwwwのカスタムドメイン・証明書を接続して転送を実測する必要があります。今回はCloudflare設定を変更していません。
- iDeCoは2026年11月までの第1号20〜59歳の上限（月6.8万円、他制度と合算）を固定したモデル。12月の改正や将来の年齢到達を年次適用しません。運用手順に更新予定を記載しました。
- 税制・年齢条件・手取り・生活費は固定。物価上昇、昇給、年金受給や将来制度は範囲外です。共済を含む総資産へ同じ利用者指定利回りを当てる概算で、給付・引出制限・受取課税・運用益課税・手数料は再現しません。
- 掛金は総積立へ二重加算しません。法人化差分はbestCorpの最終手取り・掛金控除なし。会社留保と個人資産を分けています。
- 税制記事の比較元は年度が混在した旧プロトタイプです。正式な令和7年との比較や改正単独の効果と断定しません。
- 共有URLの金額はページ取得時に配信サーバーへ届き、X投稿画面にも渡ります。入力を計算APIやDBへ送信しないこととは区別し、ボタン付近とprivacyに明記しました。OGは静的な既定例で、個別入力に応じた画像ではありません。

運用予定・Search Console・税制更新・GA4の手順：[operations.md](operations.md)。

## 375pxスクリーンショット

ページ上部の撮影であり、長いページ全体ではありません。億率は入力欄と結果・グラフを別に保存しました。

- [トップ](rebrand-screenshots/top-375.jpg)（375×1600）
- [億率・入力と結果上部](rebrand-screenshots/okuritsu-375.jpg)（375×2200）
- [億率・確率とグラフ](rebrand-screenshots/okuritsu-result-375.jpg)（375×1400）
- [計算ロジック](rebrand-screenshots/logic-375.jpg)（375×1600）
- [独立準備ハブ](rebrand-screenshots/dokuritsu-375.jpg)（375×1600）

実測記録：[viewport-checks.json](rebrand-screenshots/viewport-checks.json)。

## コミット

- フェーズ4：378c162
- フェーズ5：ce1fd0b
- フェーズA：2191488
- フェーズB：75e9859
- フェーズC：fecb9b4
- フェーズD：f29c753
- フェーズE：運用手順・最終検証・レビュー修正・報告を本コミットへ記録。
