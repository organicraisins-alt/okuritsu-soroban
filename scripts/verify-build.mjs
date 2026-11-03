import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const env = {
  ...process.env,
  ASTRO_TELEMETRY_DISABLED: '1',
  PUBLIC_SITE_URL: '',
  PUBLIC_GA_ID: '',
};
/** @param {Record<string,string>} extra */
const build = (extra) =>
  execFileSync('npm', ['run', 'build'], {
    env: { ...env, ...extra },
    stdio: 'pipe',
    encoding: 'utf8',
  });
const html = () => readFileSync('dist/index.html', 'utf8');
function basicChecks() {
  const source = html();
  assert.match(
    readFileSync('dist/tools/tedori/index.html', 'utf8'),
    /4,559,160/,
  );
  assert.match(source, /令和8年分の税制・令和8年度の保険料率で計算/);
  assert.match(source, /当サイトはアフィリエイト広告を利用しています/);
  assert.match(source, /正確な税額を保証/);
  assert(!existsSync('dist/prototype'));
  const files = [
    'dist/index.html',
    'dist/404.html',
    ...['tedori', 'houjinka', 'invoice'].map(
      (tool) => `dist/tools/${tool}/index.html`,
    ),
  ];
  const titles = files.map(
    (f) => readFileSync(f, 'utf8').match(/<title>(.*?)<\/title>/s)?.[1],
  );
  const descriptions = files.map(
    (f) =>
      readFileSync(f, 'utf8').match(
        /<meta name="description" content="([^"]*)"/,
      )?.[1],
  );
  assert(titles.every(Boolean) && new Set(titles).size === files.length);
  assert(
    descriptions.every(Boolean) && new Set(descriptions).size === files.length,
  );
}
try {
  let log = build({});
  assert(!/\bWARN\b|\[warn\]/i.test(log));
  basicChecks();
  assert(!html().includes('rel="canonical"'));
  assert(!html().includes('googletagmanager'));
  assert.match(html(), /noindex, nofollow/);
  assert(!existsSync('dist/sitemap-index.xml'));
  assert.equal(
    readFileSync('dist/robots.txt', 'utf8'),
    'User-agent: *\nDisallow: /\n',
  );
  console.log('PASS: PUBLIC_SITE_URL/GA未設定・原本非公開・メタ重複なし');
  log = build({
    PUBLIC_SITE_URL: 'https://soroban.example/?query=test#hash',
    PUBLIC_GA_ID: 'G-TEST123',
  });
  assert(!/\bWARN\b|\[warn\]/i.test(log));
  basicChecks();
  const source = html();
  assert.match(
    source,
    /<link rel="canonical" href="https:\/\/soroban.example\/"/,
  );
  assert.match(
    source,
    /<meta property="og:url" content="https:\/\/soroban.example\/"/,
  );
  assert.match(source, /application\/ld\+json/);
  assert.match(source, /BreadcrumbList/);
  assert(!source.includes('noindex'));
  assert(!source.includes('query=test'));
  assert.match(source, /googletagmanager.com\/gtag\/js\?id=G-TEST123/);
  const index = readFileSync('dist/sitemap-index.xml', 'utf8');
  assert.match(index, /https:\/\/soroban.example\/sitemap-0.xml/);
  const map = readFileSync('dist/sitemap-0.xml', 'utf8');
  assert.match(map, /<loc>https:\/\/soroban.example\/<\/loc>/);
  assert(!map.includes('/404'));
  assert.match(
    readFileSync('dist/robots.txt', 'utf8'),
    /Sitemap: https:\/\/soroban.example\/sitemap-index.xml/,
  );
  console.log(
    'PASS: 公開URL/GA設定・canonical・OGP・パンくず・子sitemap・robots',
  );
} finally {
  build({});
  console.log('Restored: URL/GA未設定のdist');
}
