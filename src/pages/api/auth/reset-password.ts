export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async () => {
  return new Response(JSON.stringify({ error: 'Redefinição de senha desativada. Altere a variável SITE_PASSWORD_HASH.' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' }
  });
};
