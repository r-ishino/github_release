import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  buildAuthorizeUrl,
  getCallbackUrl,
  getRequestOrigin,
  STATE_COOKIE,
  STATE_COOKIE_PATH,
  STATE_MAX_AGE_SECONDS,
} from '../../../../lib/auth';

export const GET = (request: NextRequest) => {
  const origin = new URL(getRequestOrigin(request));
  if (origin.hostname === 'localhost') {
    origin.hostname = '127.0.0.1';
    return NextResponse.redirect(new URL('/api/auth/login', origin));
  }

  const state = crypto.randomUUID();
  const response = NextResponse.redirect(
    buildAuthorizeUrl({ redirectUri: getCallbackUrl(request), state }),
  );
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: request.nextUrl.protocol === 'https:',
    path: STATE_COOKIE_PATH,
    maxAge: STATE_MAX_AGE_SECONDS,
  });
  return response;
};
