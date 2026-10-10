import crypto from 'crypto';
import argon2 from 'argon2';
import type { AstroCookies } from 'astro';

export interface SessionPayload {
  authenticated: true;
  role: 'admin';
  issuedAt: number;
  expiresAt: number;
}

const COOKIE_NAME = 'admin_session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias
const DEV_FALLBACK_SECRET = 'fabdeb4c2ef4dfe6abb4d819a4c634a35ec8948e5007381a245abeddf53fc2bd';

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET || (import.meta as any).env?.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[SECURITY WARNING] SESSION_SECRET não configurada em produção. Usando fallback temporário.');
    }
    return DEV_FALLBACK_SECRET;
  }
  return secret.trim();
}

/**
 * Valida a senha fornecida pelo usuário contra o hash Argon2id (SITE_PASSWORD_HASH).
 */
export async function verifySitePassword(password: string): Promise<boolean> {
  const hash = process.env.SITE_PASSWORD_HASH || (import.meta as any).env?.SITE_PASSWORD_HASH;
  if (!hash) {
    console.error('[AUTH ERROR] Variável SITE_PASSWORD_HASH não encontrada no ambiente.');
    return false;
  }

  try {
    return await argon2.verify(hash.trim(), password);
  } catch (err) {
    console.error('[AUTH ERROR] Erro na validação Argon2id:', err);
    return false;
  }
}

/**
 * Cria e assina a sessão do administrador, gravando o cookie HttpOnly.
 */
export function createAdminSession(cookies: AstroCookies): void {
  const secret = getSessionSecret();
  const payload: SessionPayload = {
    authenticated: true,
    role: 'admin',
    issuedAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION_MS
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const hmac = crypto.createHmac('sha256', secret).update(payloadBase64).digest('base64url');
  const token = `${payloadBase64}.${hmac}`;

  cookies.set(COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: Math.floor(SESSION_DURATION_MS / 1000)
  });
}

/**
 * Remove o cookie de sessão do administrador.
 */
export function destroyAdminSession(cookies: AstroCookies): void {
  cookies.delete(COOKIE_NAME, {
    path: '/'
  });
}

/**
 * Valida a integridade e validade temporal do token de sessão.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadBase64, providedHmac] = parts;
  const secret = getSessionSecret();

  const expectedHmac = crypto.createHmac('sha256', secret).update(payloadBase64).digest('base64url');

  const providedBuf = Buffer.from(providedHmac);
  const expectedBuf = Buffer.from(expectedHmac);

  if (providedBuf.length !== expectedBuf.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(providedBuf, expectedBuf)) {
    return null;
  }

  try {
    const jsonStr = Buffer.from(payloadBase64, 'base64url').toString('utf8');
    const payload = JSON.parse(jsonStr) as SessionPayload;

    if (!payload.authenticated || payload.role !== 'admin') {
      return null;
    }

    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Recupera e valida a sessão ativa a partir dos cookies ou cabeçalho HTTP da requisição.
 */
export function getAdminSession(cookies: AstroCookies, request?: Request): SessionPayload | null {
  let token = cookies.get(COOKIE_NAME)?.value;

  if (!token && request) {
    const rawHeader = request.headers.get('cookie') || '';
    const match = rawHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
    if (match) {
      token = match[1];
    }
  }

  if (!token) return null;

  return verifySessionToken(token);
}
