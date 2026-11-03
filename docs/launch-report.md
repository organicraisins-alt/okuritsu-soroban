# 公開準備・Pages公開（2026-10-26）

- Cloudflare Pagesプロジェクト: dokuritsu-soroban
- 本番URL: https://dokuritsu-soroban.pages.dev/
- 今回の配信URL: https://51d7e353.dokuritsu-soroban.pages.dev/
- PUBLIC_SITE_URL: https://okuritsu-soroban.com
- 独自ドメイン: Pagesに接続済み。CloudflareでInitializing → Verifyingを確認（DNS・証明書の反映待ち）
- GA4: 未設定・読み込みなし

## 変更

/about/、/privacy/、/contact/と共通フッターリンクを追加。連絡先は準備中と表示。共有条件をfragment形式へ変更し、入力・比較・ページ間リンクで金額をqueryへ書き込まない。従来のquery形式は読み取り互換を残し、初回アクセス時にサーバーへ届く例外をポリシーへ明記。

Wrangler 4.152.0を固定し、npm run deployで公開URLを設定して再ビルド・Pagesへアップロードする。初回プロジェクト作成時はWranglerのWorkersへの委譲が失敗したため、案内に従い --force を1回指定してPagesへ作成。以後のdeployに --force は不要。

## 検証

- npm test: 12ファイル・53件成功（fragment保存・旧URL読み取りテスト2件を含む）
- npm run check: 0 errors / 0 warnings / 0 hints
- PUBLIC_SITE_URL指定build: 43 HTML生成
- 公開42ページ: noindexなし、canonicalはokuritsu-soroban.com。404のみnoindex維持
- sitemap-0.xml: 公開42 URL、すべて指定ドメイン。sitemap-index.xmlは同ドメインのsitemap-0.xmlを参照
- robots.txt: Allow: /、指定ドメインのsitemap-index.xmlを案内
- 配信先のトップ・案内3ページ・手取り・robots・サイトマップ: HTTP 200
- 375px: 案内ページで横はみ出しなし。画像はscreenshots/launch/about-375.png

独自ドメインのDNS・証明書の反映が済むまではpages.devで閲覧できる。canonicalが独自ドメインを指すため、検索登録は接続後に行う。

公開環境で /tools/tedori/#sales=800&exp=150 の復元を確認（売上800万円・経費150万円、query空、375px横はみ出しなし）。

CloudflareでDNS再確認を実行。確認完了後は登録メール宛てに通知される。最終確認時、独自ドメインのHTTPSはDNS反映待ち（ENOTFOUND）。
