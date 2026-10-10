import { defineMiddleware } from 'astro:middleware';
import { getAdminSession } from './lib/session';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // 1. Permitir ativos estáticos legítimos sem processamento de autenticação
  const isStaticAsset = 
    pathname.startsWith('/_astro/') || 
    pathname.startsWith('/assets/') || 
    pathname === '/favicon.ico' || 
    pathname === '/placeholder.svg' ||
    /\.(ico|png|jpg|jpeg|svg|webp|css|js|woff2?|ttf|map)$/i.test(pathname);

  if (isStaticAsset) {
    return next();
  }

  // 2. Permitir endpoints de autenticação públicos
  if (pathname.startsWith('/api/auth/')) {
    return next();
  }

  const isLoginPage = pathname === '/login';

  // 3. Mapear rotas protegidas que exigem validação de sessão server-side
  const isProtectedPage = pathname === '/' || pathname.startsWith('/preview');
  const isProtectedApi = pathname === '/api/lead-status' || pathname.startsWith('/api/lead-asset/') || pathname.startsWith('/api/ai/');

  // Se não for nem rota protegida nem página de login (ex.: páginas públicas /[slug] ou /site/[slug]), segue o fluxo
  if (!isProtectedPage && !isProtectedApi && !isLoginPage) {
    return next();
  }

  try {
    const session = getAdminSession(context.cookies, context.request);
    const isAuthenticated = !!session;

    // Se o usuário tentar acessar API protegida sem autenticação válida
    if (isProtectedApi && !isAuthenticated) {
      return new Response(
        JSON.stringify({ 
          error: 'Acesso negado. Autenticação necessária.',
          code: 'UNAUTHORIZED' 
        }), 
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Se o usuário tentar acessar página protegida sem autenticação válida (ex.: após limpar cookies)
    if (isProtectedPage && !isAuthenticated) {
      const redirectParam = pathname === '/' ? '' : `?redirect=${encodeURIComponent(pathname)}`;
      return context.redirect(`/login${redirectParam}`);
    }

    // Se já estiver logado e tentar acessar a página de login
    if (isLoginPage && isAuthenticated) {
      return context.redirect('/');
    }

  } catch (err) {
    console.error('[AUTH ERROR] Falha na validação de sessão server-side:', err);

    // Em caso de falha de serviço, bloquear acesso a rotas privadas por padrão (Fail-Safe)
    if (isProtectedApi) {
      return new Response(
        JSON.stringify({ error: 'Erro de verificação de autenticação.', code: 'AUTH_ERROR' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (isProtectedPage) {
      return context.redirect('/login');
    }
  }

  return next();
});