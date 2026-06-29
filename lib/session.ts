import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'seevent_session';
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  'seevent_default_secret_key_32_characters_long_for_security';

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  level: 'Admin' | 'Member';
}

/**
 * Encrypts a session payload into an encrypted string.
 */
export function encrypt(payload: SessionPayload): string {
  const algorithm = 'aes-256-cbc';
  // Use pbkdf2Sync or scryptSync to derive a 32-byte key from the secret
  const key = crypto.scryptSync(SESSION_SECRET, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a session token back into the payload, or returns null if invalid.
 */
export function decrypt(token: string): SessionPayload | null {
  try {
    const parts = token.split(':');
    const ivHex = parts.shift();
    const encryptedText = parts.join(':');
    
    if (!ivHex || !encryptedText) return null;

    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(SESSION_SECRET, 'salt', 32);
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted) as SessionPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Sets the encrypted session token in HTTP-only cookies.
 */
export async function setSession(payload: SessionPayload) {
  const token = encrypt(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

/**
 * Retrieves and decrypts the current session from cookies.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return decrypt(token);
}

/**
 * Clears the session cookie (logs the user out).
 */
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
