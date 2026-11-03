import { readSharedParams } from '../tools/shared-url';
type Scope = 'tedori' | 'okuritsu';
const isScoped = (key: string) =>
  key.startsWith('tedori.') || key.startsWith('okuritsu.');

/** Legacy home URLs belonged to the yen-based okuritsu calculator. */
export function readHomeState(
  location: { hash: string; search: string },
  scope: Scope,
) {
  const all = readSharedParams(location);
  if (![...all.keys()].some(isScoped))
    return scope === 'okuritsu' ? all : new URLSearchParams();
  const scoped = new URLSearchParams();
  for (const [key, value] of all)
    if (key.startsWith(`${scope}.`))
      scoped.set(key.slice(scope.length + 1), value);
  return scoped;
}

export function homeStateUrl(
  href: string,
  scope: Scope,
  params: URLSearchParams,
) {
  const url = new URL(href);
  let all = readSharedParams(url);
  if (![...all.keys()].some(isScoped)) {
    all = new URLSearchParams(
      [...all].map(([key, value]) => [`okuritsu.${key}`, value]),
    );
  }
  for (const key of [...all.keys()])
    if (key.startsWith(`${scope}.`)) all.delete(key);
  for (const [key, value] of params) all.set(`${scope}.${key}`, value);
  url.search = all.toString();
  if (url.hash.includes('=')) url.hash = '';
  return url;
}
