import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  encryptSession,
  exchangeCodeForToken,
  getCallbackUrl,
  getRequestOrigin,
  SESSION_COOKIE,
  STATE_COOKIE,
  STATE_COOKIE_PATH,
  sessionCookieOptions,
} from '../../../../lib/auth';
import { getAuthenticatedUser } from '../../../../lib/github';

const clearStateCookie = (response: NextResponse) => {
  response.cookies.set(STATE_COOKIE, '', {
    path: STATE_COOKIE_PATH,
    maxAge: 0,
  });
  return response;
};

export const GET = async (request: NextRequest) => {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return clearStateCookie(
      new NextResponse(
        'ログインを確認できませんでした。もう一度ログインしてください。',
        { status: 400 },
      ),
    );
  }

  const accessToken = await exchangeCodeForToken({
    code,
    redirectUri: getCallbackUrl(request),
  });
  const user = await getAuthenticatedUser(accessToken);

  const response = NextResponse.redirect(
    new URL('/', getRequestOrigin(request)),
  );
  response.cookies.set(
    SESSION_COOKIE,
    await encryptSession({ accessToken, login: user.login }),
    sessionCookieOptions(request),
  );
  return clearStateCookie(response);
};
