import { spawnSync } from 'node:child_process';
import { resolveSiteUrl } from '../config/site.mjs';
const site = resolveSiteUrl(
  process.env.PUBLIC_SITE_URL || 'https://okuritsu-soroban.com',
);
if (!site) throw new Error('PUBLIC_SITE_URL is required');
const env = {
  ...process.env,
  PUBLIC_SITE_URL: site,
  ASTRO_TELEMETRY_DISABLED: '1',
};
for (const args of [
  ['run', 'build'],
  [
    'exec',
    '--',
    'wrangler',
    'pages',
    'deploy',
    'dist',
    '--project-name=dokuritsu-soroban',
    '--branch=main',
  ],
]) {
  const result = spawnSync('npm', args, { stdio: 'inherit', env });
  if (result.status !== 0) process.exit(result.status || 1);
}
