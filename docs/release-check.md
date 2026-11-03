# 億率の公開結果（2026-10-27）

公開先：https://okuritsu-soroban.com/

Pagesプロジェクト：dokuritsu-soroban

配信スナップショット：https://5b1ce7ce.dokuritsu-soroban.pages.dev/

公開したコードのコミット：5aec125（表示修正c7fe4c0を含む）

本番HTTP確認日時：2026-10-27 08:21:24 JST

## 反映した内容

運営者本人が確認した文章を加筆・強調せずにaboutへ反映。運営者名はOPERATOR_NAME（億率 運営者）に集約。連絡先・監修者欄は非表示。aboutはAboutPage、publisherはOrganization「億率」。Personは生成していない。解説の執筆者は「億率 運営者（税務システム開発エンジニア）」でaboutへリンクし、Articleのauthor・publisherはOrganization。

contactは指定の「お問い合わせ窓口は現在準備中です。計算の誤りに気づかれた場合の受付方法は、準備ができしだいこのページでお知らせします。」へ変更。フッターのリンクとソースのTODOコメントは保持。

縦軸は表示範囲に応じて1/2/5×10の整数乗の目盛りを使う。既定例は0・5,000万円・1億円・1.5億円・2億円で、1億円の目標線は保持。トップは文節をまとまりとして375px・1280pxで途中改行しないことを確認。

## 実測結果

| 公開URL | HTTP | 表示 |
|---|---:|---|
| https://okuritsu-soroban.com/ | 200 | 新内容を確認 |
| https://okuritsu-soroban.com/okuritsu/ | 200 | 新内容を確認 |
| https://okuritsu-soroban.com/dokuritsu/ | 200 | 新内容を確認 |
| https://okuritsu-soroban.com/about/ | 200 | 新内容を確認 |
| https://okuritsu-soroban.com/logic/ | 200 | 新内容を確認 |

- sitemap-index.xmlはHTTP 200。参照先sitemap-0.xmlを辿り、公開対象60 URL、重複なし、ローカルの公開対象一覧と完全一致を確認。
- 雛形6件はサイトマップに含まれない。各URLはHTTP 200でnoindexあり：/houjinka/timing/、/houjinka/yakuin-housyu/、/houjinka/shakai-hoken/、/setsuzei/aoiro-65/、/setsuzei/shoukibo-kyousai/、/setsuzei/ideco/。
- aboutの可視テキストにTODO・準備中・連絡先・監修者の項目なし。空のdt/ddなし。AboutPageのpublisher名とPersonなしを公開HTMLで確認。実ブラウザーでもTODOや非表示項目が見えないことを確認。
- _redirectsはdistへコピーされ、Wranglerの「Uploading _redirects」を確認。今回は指示どおりwwwへの通信・301実測を行っていない。_redirectsはCloudflareが転送設定として処理するため、HTTPでファイル本体が配信されることを確認方法にはしていない。
- npm test：22ファイル・79件成功。npm run check：公開コード118ファイルでエラー・警告0。検証スクリプト追加後も119ファイルでエラー・警告0。
- PUBLIC_SITE_URL指定build：67 HTML・42 OG画像生成、成功。npm run deployで再ビルドし公開を完了。
- 本番トップ375px/1280px、about375pxで横はみ出しなし。各見出し文節は描画矩形1つで途中改行なし。

詳細な実測データ：[release-live-checks.json](release-live-checks.json)。

## スクリーンショット（本番、375px）

- [トップ](published-screenshots/top-375.jpg)（375×1600）
- [運営者情報](published-screenshots/about-375.jpg)（375×2000）
- [画面幅検証記録](published-screenshots/viewport-checks.json)

## 残TODO

[release-todos.md](release-todos.md)へ全分類を記録。お問い合わせ窓口、監修者が決まった場合の追記、税制・掛金と業種判定の要確認項目が残る。運営者プロフィール本文の未記入は解消済み。
