import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';
import { resolveSiteUrl } from './config/site.mjs';
const env = loadEnv(
  process.env.NODE_ENV ?? 'development',
  process.cwd(),
  'PUBLIC_',
);
const site = resolveSiteUrl(process.env.PUBLIC_SITE_URL ?? env.PUBLIC_SITE_URL);
export default defineConfig({
  output: 'static',
  site,
  trailingSlash: 'always',
  integrations: site
    ? [
        sitemap({
          filter: (page) =>
            !/^\/(og\/|404|setsuzei\/|houjinka\/)/.test(new URL(page).pathname),
        }),
      ]
    : [],
});
