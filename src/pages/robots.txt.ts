import type { APIRoute } from 'astro';
import { robotsText } from '../../config/site.mjs';
export const prerender = true;
export const GET: APIRoute = ({ site }) =>
  new Response(robotsText(site?.href), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
