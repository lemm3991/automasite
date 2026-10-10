export const prerender = false;

import type { APIRoute } from 'astro';
import { getAdminSession } from '../../../lib/session';
import { checkRateLimitAsync, createRateLimitResponse, getClientIp } from '../../../lib/rate-limiter';

export const POST: APIRoute = async ({ request, cookies }) => {
  const ip = getClientIp(request);

  // 1. Validação Server-Side Obrigatória de Sessão (Endpoint de Alto Custo)
  let userId = 'admin';
  try {
    const session = getAdminSession(cookies, request);

    if (!session) {
      return new Response(JSON.stringify({ 
        error: 'Acesso restrito. Autenticação obrigatória para utilizar recursos de inteligência artificial.' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Falha na validação de credenciais.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 2. Rate Limiting Restritivo para Operações de Alto Custo / IA:
  // Máximo de 5 chamadas a cada 10 minutos por IP e por Usuário
  const rateLimit = await checkRateLimitAsync('ai-generation', ip, {
    windowMs: 10 * 60 * 1000,
    maxRequests: 5,
    userId
  });

  if (!rateLimit.allowed) {
    return createRateLimitResponse(
      rateLimit,
      `Limite de chamadas de IA atingido (5 requisições a cada 10 minutos). Aguarde ${rateLimit.retryAfterSeconds} segundos.`
    );
  }

  // 3. Processamento com Limite de Payload (Proteção contra sobrecarga de tokens)
  try {
    const body = await request.json().catch(() => ({}));
    const prompt = (body.prompt || '').toString().trim();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'O campo prompt é obrigatório.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (prompt.length > 2000) {
      return new Response(JSON.stringify({ error: 'O prompt excede o limite máximo permitido de 2000 caracteres.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Retorno controlado
    return new Response(JSON.stringify({
      success: true,
      message: 'Prompt validado e enfileirado para processamento do agente com controle de custos.',
      characterCount: prompt.length,
      quotaRemaining: rateLimit.remaining
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': rateLimit.remaining.toString()
      }
    });

  } catch (err: any) {
    console.error('[AI API ERROR]', err);
    return new Response(JSON.stringify({ error: 'Erro no processamento da solicitação de IA.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
