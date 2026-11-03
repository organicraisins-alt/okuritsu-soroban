/** @param {string | undefined} value */
export function resolveSiteUrl(value) {
  if (!value?.trim()) return undefined;
  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error('PUBLIC_SITE_URLにはhttp(s)の公開URLを指定してください。');
  }
  if (
    !['https:', 'http:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== '/'
  ) {
    throw new Error(
      'PUBLIC_SITE_URLは認証情報・サブパスのないhttp(s)のドメインを指定してください。',
    );
  }
  return url.origin + '/';
}
/** @param {string | undefined} site @param {string} path */
export function pageUrl(site, path) {
  if (!site) return undefined;
  const cleanPath = new URL(path, site).pathname;
  return new URL(cleanPath, site).href;
}
/** @typedef {{name: string, path: string}} Breadcrumb */
/** @param {string | undefined} site @param {Breadcrumb[]} items */
export function breadcrumbJsonLd(site, items) {
  if (!site) return undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: pageUrl(site, item.path),
    })),
  };
}
/** @param {string | undefined} value */
export function analyticsId(value) {
  if (!value?.trim()) return undefined;
  if (!/^G-[A-Z0-9]+$/.test(value.trim()))
    throw new Error('PUBLIC_GA_IDはGA4の測定ID（G-…）を指定してください。');
  return value.trim();
}
/** @param {string | undefined} site */
export function robotsText(site) {
  return site
    ? `User-agent: *\nAllow: /\nSitemap: ${pageUrl(site, '/sitemap-index.xml')}\n`
    : 'User-agent: *\nDisallow: /\n';
}
/** @param {unknown} data */
export function serializeJsonLd(data) {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export const SITE_NAME = '億率（おくりつ）';
export const SITE_LOGO = '億率';
export const SITE_READING = 'おくりつ';
export const SITE_COPY = 'フリーランスのお金を、数字で決める';
/** @param {string} title */
export function siteTitle(title) {
  return `${title.replace(/｜億率(?:（おくりつ）)?$/, '')}｜${SITE_LOGO}`;
}
/** @param {string} site */
export function siteIdentity(site) {
  return [
    {
      '@type': 'WebSite',
      '@id': new URL('#website', site).href,
      name: SITE_NAME,
      url: site,
      inLanguage: 'ja',
      publisher: { '@id': new URL('#organization', site).href },
    },
    {
      '@type': 'Organization',
      '@id': new URL('#organization', site).href,
      name: SITE_LOGO,
      url: site,
    },
  ];
}

/** @param {string} path */
export function ogImagePath(path) {
  const income = path.match(/^\/nenshu\/(\d+)\/$/),
    employee = path.match(/^\/hikaku\/kaishain-(\d+)\/$/),
    job = path.match(/^\/shokugyo\/([a-z]+)\/$/);
  const slug = income
    ? `nenshu-${income[1]}`
    : employee
      ? `kaishain-${employee[1]}`
      : job
        ? `shokugyo-${job[1]}`
        : path === '/okuritsu/'
          ? 'okuritsu'
          : 'default';
  return `/og/${slug}.png`;
}

export const OPERATOR_NAME = '億率 運営者';
export const OPERATOR_ROLE = '税務システム開発エンジニア';
/** @param {string} site */
export function organizationReference(site) {
  return {
    '@type': 'Organization',
    '@id': new URL('#organization', site).href,
    name: SITE_LOGO,
    url: site,
  };
}
/** @param {string} site */
export function aboutPageJsonLd(site) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': new URL('about/#webpage', site).href,
    url: new URL('about/', site).href,
    name: '運営者情報',
    publisher: organizationReference(site),
    mainEntity: { '@id': new URL('#organization', site).href },
  };
}
