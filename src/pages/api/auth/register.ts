export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async () => {
  return new Response(JSON.stringify({ error: 'Cadastro de novos usuários desativado pelo administrador.' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' }
  });
};
