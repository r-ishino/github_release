import { NextRequest, NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { encryptSession, SESSION_COOKIE } from './session';
import { withGitHubToken } from './with-github-token';

const ORIGIN = 'http://127.0.0.1:8880';
const URL_ = `${ORIGIN}/api/repositories`;

const buildRequest = async ({
  method = 'GET',
  origin,
  loggedIn = true,
}: {
  method?: string;
  origin?: string;
  loggedIn?: boolean;
}) => {
  const headers = new Headers({ host: '127.0.0.1:8880' });
  if (origin) {
    headers.set('origin', origin);
  }
  if (loggedIn) {
    const cookie = await encryptSession({
      accessToken: 'gho_token',
      login: 'octocat',
    });
    headers.set('cookie', `${SESSION_COOKIE}=${cookie}`);
  }
  return new NextRequest(URL_, { method, headers });
};

describe('withGitHubToken', () => {
  const handler = vi.fn(async (_request: NextRequest, token: string) =>
    NextResponse.json({ token }),
  );
  const route = withGitHubToken(handler);

  beforeEach(() => {
    vi.stubEnv('SESSION_SECRET', 'a'.repeat(32));
    handler.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('ログインしていなければ 401 を返し、GitHub API を呼ぶ処理に進まない', async () => {
    const response = await route(await buildRequest({ loggedIn: false }), {});

    expect(response.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it('ログインしていれば、セッションに入っているユーザーのトークンで処理する', async () => {
    const response = await route(await buildRequest({}), {});

    expect(response.status).toBe(200);
    expect(handler.mock.calls[0][1]).toBe('gho_token');
  });

  it('他のサイトから送られた POST は、ログインしていても 403 で拒否する', async () => {
    const response = await route(
      await buildRequest({ method: 'POST', origin: 'https://evil.example' }),
      {},
    );

    expect(response.status).toBe(403);
    expect(handler).not.toHaveBeenCalled();
  });

  it('送信元が分からない POST は 403 で拒否する', async () => {
    const response = await route(await buildRequest({ method: 'POST' }), {});

    expect(response.status).toBe(403);
    expect(handler).not.toHaveBeenCalled();
  });

  it('同じサイトから送られた POST は処理する', async () => {
    const response = await route(
      await buildRequest({ method: 'POST', origin: ORIGIN }),
      {},
    );

    expect(response.status).toBe(200);
  });
});
