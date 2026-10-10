import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import { getAdminSession } from '../../lib/session';
import { checkRateLimitAsync, createRateLimitResponse, getClientIp } from '../../lib/rate-limiter';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const ip = getClientIp(request);

  // 1. Validação Server-Side Obrigatória de Sessão
  let userId = 'admin';
  try {
    const session = getAdminSession(cookies, request);

    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado. Autenticação obrigatória.' }), 
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Erro de validação de autenticação.' }), 
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // 2. Rate Limiting Duplo na API de Modificação de Dados (Máximo de 30 atualizações por minuto por IP e Usuário)
  const rateLimit = await checkRateLimitAsync('lead-status', ip, {
    windowMs: 60 * 1000,
    maxRequests: 30,
    userId
  });

  if (!rateLimit.allowed) {
    return createRateLimitResponse(
      rateLimit,
      'Limite de atualizações de status excedido. Aguarde alguns instantes.'
    );
  }

  // 3. Processamento e Sanitização dos Dados
  try {
    const body = await request.json();
    const { slug, status } = body;

    const validStatuses = ['ativo', 'aprovado', 'nao_aprovado', 'arquivado', 'draft', 'review', 'published'];

    // Sanitização rigorosa contra Path Traversal no slug
    if (!slug || typeof slug !== 'string' || !/^[a-z0-9-_]+$/i.test(slug)) {
      return new Response(JSON.stringify({ error: 'Slug inválido ou em formato incorreto.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!status || !validStatuses.includes(status)) {
      return new Response(JSON.stringify({ error: 'Status informado é inválido.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const rootDir = process.cwd();
    
    // Atualização de lead.json
    const leadJsonPath = path.join(rootDir, 'leads', slug, 'lead.json');
    if (fs.existsSync(leadJsonPath)) {
      try {
        const content = fs.readFileSync(leadJsonPath, 'utf8').replace(/^\uFEFF/, '');
        const data = JSON.parse(content);
        data.status = status;
        data.updatedAt = new Date().toISOString();
        fs.writeFileSync(leadJsonPath, JSON.stringify(data, null, 2), 'utf8');
      } catch (e) {
        console.error('Erro ao atualizar lead.json:', e);
      }
    }

    // Atualização de client config.ts
    const clientDataPath = path.join(rootDir, 'src', 'clients', 'data', `${slug}.ts`);
    if (fs.existsSync(clientDataPath)) {
      try {
        let code = fs.readFileSync(clientDataPath, 'utf8');
        code = code.replace(/status:\s*["'][^"']+["']/, `status: "${status}"`);
        fs.writeFileSync(clientDataPath, code, 'utf8');
      } catch (e) {
        console.error('Erro ao atualizar client config.ts:', e);
      }
    }

    return new Response(JSON.stringify({ success: true, slug, status }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Erro interno no servidor.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
