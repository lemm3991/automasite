export const prerender = false;

import type { APIRoute } from 'astro';
import { verifySitePassword, createAdminSession } from '../../../lib/session';
import { checkRateLimitAsync, createRateLimitResponse, resetRateLimit, getClientIp } from '../../../lib/rate-limiter';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const ip = getClientIp(request);
  const isJsonRequest = request.headers.get('accept')?.includes('application/json') || request.headers.get('content-type')?.includes('application/json');

  // 1. Rate Limiting no Login (Máximo de 5 tentativas a cada 5 minutos por IP)
  const rateLimit = await checkRateLimitAsync('login', ip, {
    windowMs: 5 * 60 * 1000,
    maxRequests: 5
  });

  if (!rateLimit.allowed) {
    if (isJsonRequest) {
      return createRateLimitResponse(
        rateLimit,
        `Muitas tentativas de login incorretas. Aguarde ${rateLimit.retryAfterSeconds} segundos antes de tentar novamente.`
      );
    }
    const errorMsg = `Muitas tentativas de login incorretas. Aguarde ${rateLimit.retryAfterSeconds} segundos antes de tentar novamente.`;
    return redirect(`/login?error=${encodeURIComponent(errorMsg)}`);
  }

  let email = '';
  let password = '';
  let redirectTo = '/';

  if (isJsonRequest) {
    const body = await request.json().catch(() => ({}));
    email = (body.email || '').toString().trim().toLowerCase();
    password = (body.password || '').toString();
    redirectTo = (body.redirect || '/').toString();
  } else {
    const formData = await request.formData();
    email = formData.get('email')?.toString().trim().toLowerCase() || '';
    password = formData.get('password')?.toString() || '';
    redirectTo = formData.get('redirect')?.toString() || '/';
  }

  if (!password) {
    if (isJsonRequest) {
      return new Response(JSON.stringify({ error: 'Preencha a chave de acesso.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return redirect('/login?error=Preencha a chave de acesso.');
  }

  try {
    const isValid = await verifySitePassword(password);

    if (!isValid) {
      if (isJsonRequest) {
        return new Response(JSON.stringify({ error: 'Credenciais inválidas. Verifique sua chave de acesso.' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return redirect(`/login?error=${encodeURIComponent('Credenciais inválidas. Verifique sua chave de acesso.')}`);
    }

    // Cria a sessão segura com cookie assinado
    createAdminSession(cookies);

    // Login bem-sucedido: limpa o contador de tentativas para este IP
    resetRateLimit('login', ip);

    // Redireciona com segurança para a rota interna solicitada
    const safeRedirect = redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : '/';
    
    if (isJsonRequest) {
      return new Response(JSON.stringify({ success: true, redirectTo: safeRedirect, user: { role: 'admin' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return redirect(safeRedirect);

  } catch (err: any) {
    console.error('[AUTH LOGIN ERROR]', err);
    const detail = err?.message ? `: ${err.message}` : '';
    const userMsg = `Erro na autenticação${detail}`;
    if (isJsonRequest) {
      return new Response(JSON.stringify({ error: userMsg }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return redirect(`/login?error=${encodeURIComponent(userMsg)}`);
  }
};