/** Fragment values stay in the browser; legacy query links remain readable. */
export function readSharedParams(location: { hash: string; search: string }) {
  return new URLSearchParams(
    location.hash.includes('=') ? location.hash.slice(1) : location.search,
  );
}
export function sharedUrl(href: string, params: string | URLSearchParams) {
  const url = new URL(href);
  url.search = '';
  url.hash = params.toString();
  return url;
}
