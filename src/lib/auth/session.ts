import { EncryptJWT, jwtDecrypt } from 'jose';
import type { NextRequest } from 'next/server';
import { getSessionSecret } from './config';

export type Session = {
  accessToken: string;
  login: string;
};

export const SESSION_COOKIE = 'session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const deriveKey = async (): Promise<Uint8Array> => {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(getSessionSecret()),
  );
  return new Uint8Array(digest);
};

export const encryptSession = async (session: Session): Promise<string> =>
  new EncryptJWT({ accessToken: session.accessToken, login: session.login })
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .encrypt(await deriveKey());

export const decryptSession = async (
  value: string | undefined,
): Promise<Session | null> => {
  if (!value) {
    return null;
  }

  const key = await deriveKey();
  try {
    const { payload } = await jwtDecrypt(value, key);
    if (
      typeof payload.accessToken !== 'string' ||
      typeof payload.login !== 'string'
    ) {
      return null;
    }
    return { accessToken: payload.accessToken, login: payload.login };
  } catch {
    return null;
  }
};

export const sessionCookieOptions = (request: NextRequest) => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: request.nextUrl.protocol === 'https:',
  path: '/',
  maxAge: SESSION_MAX_AGE_SECONDS,
});
