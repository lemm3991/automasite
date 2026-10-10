export const prerender = false;

import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import { getAdminSession } from '../../../../lib/session';
import { checkRateLimit, getClientIp } from '../../../../lib/rate-limiter';

export const GET: APIRoute = async ({ params, request, cookies }) => {
  const ip = getClientIp(request);

  // 1. Rate limiting para prevenção de scraping massivo (100 req/min por IP)
  const rateLimit = checkRateLimit('lead-assets', ip, {
    windowMs: 60 * 1000,
    maxRequests: 100
  });

  if (!rateLimit.allowed) {
    return new Response('Muitas requisições. Aguarde um momento.', {
      status: 429,
      headers: { 'Retry-After': rateLimit.retryAfterSeconds.toString() }
    });
  }

  // 2. Validação Server-Side Obrigatória de Sessão
  try {
    const session = getAdminSession(cookies, request);

    if (!session) {
      return new Response('Acesso restrito. Autenticação obrigatória.', { status: 401 });
    }
  } catch (err) {
    return new Response('Erro na verificação de autenticação.', { status: 401 });
  }

  const slug = params.slug;
  const assetPath = params.path;

  if (!slug || !assetPath) {
    return new Response('Asset não encontrado', { status: 404 });
  }

  // Sanitização de caracteres no slug
  if (!/^[a-z0-9-_]+$/i.test(slug)) {
    return new Response('Slug inválido', { status: 400 });
  }

  const rootDir = process.cwd();
  const fullPath = path.join(rootDir, 'leads', slug, assetPath);

  // Proteção contra Path Traversal
  const normalized = path.normalize(fullPath);
  const expectedDir = path.normalize(path.join(rootDir, 'leads', slug));
  if (!normalized.startsWith(expectedDir)) {
    return new Response('Acesso negado', { status: 403 });
  }

  if (!fs.existsSync(normalized)) {
    return new Response('Arquivo não encontrado', { status: 404 });
  }

  const ext = path.extname(normalized).toLowerCase();
  let contentType = 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  if (ext === '.svg') contentType = 'image/svg+xml';
  if (ext === '.webp') contentType = 'image/webp';
  if (ext === '.json') contentType = 'application/json';

  const buffer = fs.readFileSync(normalized);
  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'private, no-cache, no-store, must-revalidate'
    }
  });
};
