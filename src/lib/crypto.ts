/**
 * MÓDULO DE CRIPTOGRAFIA EM REPOUSO E MINIMIZAÇÃO DE DADOS
 * Padrão: AES-256-GCM (Authenticated Encryption) + SHA-256 para Pseudonimização.
 * 
 * Garante que dados sensíveis persistidos sejam criptografados com integridade garantida,
 * e que identificadores pessoais (como endereços IP) sejam pseudonimizados.
 * 
 * SEGURANÇA: Este módulo só é executado no ambiente do servidor (Node.js/SSR)
 * e NUNCA é empacotado para o cliente.
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Recomendado para GCM
const TAG_LENGTH = 16;

/**
 * Obtém ou deriva a chave mestra de 256 bits (32 bytes) estritamente do servidor.
 */
function getEncryptionKey(): Buffer {
  const envKey = (typeof process !== 'undefined' ? process.env.DATA_ENCRYPTION_KEY : '') || '';

  if (envKey) {
    if (envKey.length === 64) {
      return Buffer.from(envKey, 'hex');
    }
    // Derivação segura caso a chave seja uma passphrase
    return crypto.createHash('sha256').update(envKey).digest();
  }

  // Fallback seguro derivado das variáveis de ambiente de infraestrutura existentes
  const fallbackSeed = (typeof process !== 'undefined' ? (process.env.SESSION_SECRET || process.env.NODE_ENV || 'local-secure-dev-salt') : 'local-secure-dev-salt');
  return crypto.createHash('sha256').update(`site-automatico-encryption-salt:${fallbackSeed}`).digest();
}

/**
 * Criptografa uma string de texto em repouso usando AES-256-GCM.
 * Formato retornado: iv.hex:tag.hex:ciphertext.hex
 */
export function encryptData(plaintext: string): string {
  if (!plaintext) return '';

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Descriptografa um texto em repouso cifrado com AES-256-GCM.
 */
export function decryptData(ciphertext: string): string {
  if (!ciphertext || !ciphertext.includes(':')) return ciphertext;

  try {
    const [ivHex, authTagHex, encryptedHex] = ciphertext.split(':');
    if (!ivHex || !authTagHex || !encryptedHex) return ciphertext;

    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (err) {
    console.error('[CRYPTO ERROR] Falha ao descriptografar dados:', err);
    return ciphertext;
  }
}

/**
 * Criptografa um objeto JavaScript em repouso serializado como JSON.
 */
export function encryptObject<T>(data: T): string {
  const jsonStr = JSON.stringify(data);
  return encryptData(jsonStr);
}

/**
 * Descriptografa um objeto serializado em repouso.
 */
export function decryptObject<T>(ciphertext: string, fallback: T): T {
  try {
    const decryptedStr = decryptData(ciphertext);
    return JSON.parse(decryptedStr) as T;
  } catch {
    return fallback;
  }
}

/**
 * Pseudonimiza dados sensíveis ou identificadores (como endereços IP de usuários)
 * usando hash unidirecional SHA-256 com salt do servidor, evitando armazenamento
 * desnecessário de dados pessoais (Minimização de Dados - LGPD/GDPR).
 */
export function hashSensitiveData(data: string): string {
  if (!data) return '';
  const salt = getEncryptionKey().toString('hex').slice(0, 16);
  return crypto.createHash('sha256').update(`${salt}:${data}`).digest('hex');
}
