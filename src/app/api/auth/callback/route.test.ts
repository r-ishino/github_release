import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { decryptSession } from '../../../../lib/auth';
import { GET } from './route';

const ORIGIN = 'http://127.0.0.1:8880';
const ACCESS_TOKEN = 'gho_issued_token';

const buildCallbackRequest = ({
  query,
  stateCookie,
}: {
  query: string;
  stateCookie?: string;
}) =>
  new NextRequest(`${ORIGIN}/api/auth/callback?${query}`, {
    headers: {
      host: '127.0.0.1:8880',
      ...(stateCookie ? { cookie: `oauth_state=${stateCookie}` } : {}),
    },
  });

const stubGitHub = () => {
  const fetchMock = vi.fn(async (input: string | URL | Request) => {
    const url = input.toString();
    if (url === 'https://github.com/login/oauth/access_token') {
      return Response.json({ access_token: ACCESS_TOKEN });
    }
    if (url === 'https://api.github.com/user') {
      return Response.json({ login: 'octocat' });
    }
    throw new Error(`unexpected fetch: ${url}`);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

describe('GET /api/auth/callback', () => {
  beforeEach(() => {
    vi.stubEnv('GITHUB_CLIENT_ID', 'client-id');
    vi.stubEnv('GITHUB_CLIENT_SECRET', 'client-secret');
    vi.stubEnv('SESSION_SECRET', 'a'.repeat(32));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('state がログイン開始時の cookie と一致しなければ、トークンを取りに行かずに拒否する', async () => {
    const fetchMock = stubGitHub();

    const response = await GET(
      buildCallbackRequest({
        query: 'code=abc&state=attacker',
        stateCookie: 'expected',
      }),
    );

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(response.cookies.get('session')).toBeUndefined();
  });

  it('ログイン開始時の state cookie が無ければ拒否する', async () => {
    const fetchMock = stubGitHub();

    const response = await GET(
      buildCallbackRequest({ query: 'code=abc&state=expected' }),
    );

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('GitHub で許可されなかった（code が無い）ときは拒否する', async () => {
    const fetchMock = stubGitHub();

    const response = await GET(
      buildCallbackRequest({
        query: 'error=access_denied&state=expected',
        stateCookie: 'expected',
      }),
    );

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('state が一致すれば、トークンを暗号化した cookie に入れてトップへ戻し、使い終わった state cookie は消す', async () => {
    stubGitHub();

    const response = await GET(
      buildCallbackRequest({
        query: 'code=abc&state=expected',
        stateCookie: 'expected',
      }),
    );
    const sessionCookie = response.cookies.get('session');

    expect(response.headers.get('location')).toBe(`${ORIGIN}/`);
    expect(await decryptSession(sessionCookie?.value)).toEqual({
      accessToken: ACCESS_TOKEN,
      login: 'octocat',
    });
    expect(sessionCookie?.httpOnly).toBe(true);
    expect(sessionCookie?.sameSite).toBe('lax');
    expect(response.cookies.get('oauth_state')?.maxAge).toBe(0);
  });

  it('トークン交換で GitHub が拒否したら、セッションを作らずに失敗する', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ error: 'bad_verification_code' })),
    );

    await expect(
      GET(
        buildCallbackRequest({
          query: 'code=abc&state=expected',
          stateCookie: 'expected',
        }),
      ),
    ).rejects.toThrow('bad_verification_code');
  });
});
