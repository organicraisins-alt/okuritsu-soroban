import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const origin = 'https://okuritsu-soroban.com';
const required = [
  ['/', 'product-visual'],
  ['/okuritsu/', 'data-axis-y'],
  ['/dokuritsu/', '会社員から独立する前に知っておきたいお金のこと'],
  ['/about/', 'エンジニア歴5年'],
  ['/logic/', '回帰テストのケースと期待値'],
];
const stubs = [
  '/houjinka/timing/',
  '/houjinka/yakuin-housyu/',
  '/houjinka/shakai-hoken/',
  '/setsuzei/aoiro-65/',
  '/setsuzei/shoukibo-kyousai/',
  '/setsuzei/ideco/',
];
/** @param {string} path */
async function get(path) {
  const url = new URL(path, origin);
  assert.equal(url.origin, origin);
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  const html = await response.text();
  return { path: url.pathname, status: response.status, html };
}
const checks = await Promise.allSettled(
  required.map(async ([path, marker]) => {
    const r = await get(path);
    assert.equal(r.status, 200);
    assert.ok(r.html.includes(marker));
    return { path, status: r.status, newContent: true, html: r.html };
  }),
);
for (const r of checks) if (r.status === 'rejected') throw r.reason;
const pages = checks.map((r) => {
  assert.ok(r.status === 'fulfilled');
  return r.value;
});
const aboutResult = pages.find((p) => p.path === '/about/');
assert.ok(aboutResult);
const about = aboutResult.html;
const visible = about
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/<[^>]+>/g, '');
assert.ok(!visible.includes('TODO'));
assert.ok(!visible.includes('準備中'));
assert.ok(!visible.includes('監修者'));
assert.ok(!visible.includes('連絡先'));
assert.ok(!/<d[td][^>]*>\s*<\/d[td]>/i.test(about));
const schema = [
  ...about.matchAll(
    /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
  ),
].map((m) => JSON.parse(m[1]));
const aboutPage = schema.find((x) => x['@type'] === 'AboutPage');
assert.equal(aboutPage.publisher.name, '億率');
assert.ok(!JSON.stringify(schema).includes('"Person"'));
const index = await get('/sitemap-index.xml');
assert.equal(index.status, 200);
const childUrls = [...index.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  (m) => m[1],
);
assert.ok(childUrls.length > 0);
/** @type {string[]} */
const urls = [];
for (const child of childUrls) {
  const r = await get(child);
  assert.equal(r.status, 200);
  urls.push(...[...r.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
}
assert.equal(urls.length, 60);
assert.equal(new Set(urls).size, 60);
assert.ok(stubs.every((p) => !urls.includes(origin + p)));
/** @type {{pages:Array<{public:boolean,canonical:string}>}} */
const inventory = JSON.parse(await readFile('docs/rebrand-pages.json', 'utf8'));
const expected = inventory.pages
  .filter((p) => p.public)
  .map((p) => p.canonical);
assert.deepEqual([...urls].sort(), expected.sort());
const stubChecks = await Promise.allSettled(
  stubs.map(async (p) => {
    const r = await get(p);
    assert.equal(r.status, 200);
    const robots = r.html.match(/<meta\b[^>]*name="robots"[^>]*>/i)?.[0];
    assert.ok(robots?.includes('noindex'));
    return { path: p, status: r.status, noindex: true };
  }),
);
for (const r of stubChecks) if (r.status === 'rejected') throw r.reason;
assert.equal(
  await readFile('dist/_redirects', 'utf8'),
  await readFile('public/_redirects', 'utf8'),
);
const report = {
  checkedAt: new Date().toISOString(),
  origin,
  pages: pages.map(({ html, ...p }) => p),
  about: {
    noVisibleTodo: true,
    noEmptyFields: true,
    noContactOrSupervisorField: true,
    type: 'AboutPage',
    publisher: '億率',
    noPerson: true,
  },
  sitemap: {
    indexStatus: index.status,
    children: childUrls,
    count: urls.length,
    stubsExcluded: true,
    urls,
  },
  stubs: stubChecks.map((r) => {
    assert.ok(r.status === 'fulfilled');
    return r.value;
  }),
  redirects: {
    bundled: true,
    uploadConfirmed: 'Wrangler: Uploading _redirects',
    wwwTest: 'not requested this run',
  },
};
await writeFile(
  'docs/release-live-checks.json',
  JSON.stringify(report, null, 2) + '\n',
);
console.log(
  JSON.stringify(
    { ...report, sitemap: { ...report.sitemap, urls: undefined } },
    null,
    2,
  ),
);
