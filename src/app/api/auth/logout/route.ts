import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  getRequestOrigin,
  isSameOrigin,
  SESSION_COOKIE,
} from '../../../../lib/auth';

export const POST = (request: NextRequest) => {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const response = NextResponse.redirect(
    new URL('/', getRequestOrigin(request)),
    303,
  );
  response.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  return response;
};
