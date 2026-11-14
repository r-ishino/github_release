import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { isSameOrigin } from './origin';
import { decryptSession, SESSION_COOKIE } from './session';

type AuthenticatedHandler<Context> = (
  request: NextRequest,
  token: string,
  context: Context,
) => Promise<Response>;

export const withGitHubToken =
  <Context>(handler: AuthenticatedHandler<Context>) =>
  async (request: NextRequest, context: Context): Promise<Response> => {
    if (request.method !== 'GET' && !isSameOrigin(request)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const session = await decryptSession(
      request.cookies.get(SESSION_COOKIE)?.value,
    );
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return handler(request, session.accessToken, context);
  };
