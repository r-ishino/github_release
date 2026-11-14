import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { POST } from './route';

const ORIGIN = 'http://127.0.0.1:8880';

const buildLogoutRequest = (origin: string) =>
  new NextRequest(`${ORIGIN}/api/auth/logout`, {
    method: 'POST',
    headers: { host: '127.0.0.1:8880', origin, cookie: 'session=encrypted' },
  });

describe('POST /api/auth/logout', () => {
  it('同じサイトから送られたら、セッション cookie を消してトップへ戻す', () => {
    const response = POST(buildLogoutRequest(ORIGIN));

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(`${ORIGIN}/`);
    expect(response.cookies.get('session')?.maxAge).toBe(0);
  });

  it('他のサイトから送られたら、セッションを消さずに 403 で拒否する', () => {
    const response = POST(buildLogoutRequest('https://evil.example'));

    expect(response.status).toBe(403);
    expect(response.cookies.get('session')).toBeUndefined();
  });
});
