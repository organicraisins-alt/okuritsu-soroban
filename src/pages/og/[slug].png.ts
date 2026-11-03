import { readFile } from 'node:fs/promises';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import type { APIRoute } from 'astro';
import { ogCards, ogTree, type OgCard } from '../../lib/og';
const font = await readFile(
  new URL('../../../assets/fonts/NotoSansJP.ttf', import.meta.url),
);
export function getStaticPaths() {
  return ogCards().map((card) => ({
    params: { slug: card.slug },
    props: { card },
  }));
}
export const GET: APIRoute = async ({ props }) => {
  const svg = await satori(ogTree(props.card as OgCard), {
    width: 1200,
    height: 630,
    fonts: [{ name: 'Noto Sans JP', data: font, weight: 700, style: 'normal' }],
  });
  const png = new Resvg(svg).render().asPng();
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
