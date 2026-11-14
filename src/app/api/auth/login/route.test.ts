import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

const loginRequest = (host: string) =>
  new NextRequest(`http://${host}/api/auth/login`, { headers: { host } });

describe('GET /api/auth/login', () => {
  beforeEach(() => {
    vi.stubEnv('GITHUB_CLIENT_ID', 'client-id');
    vi.stubEnv('GITHUB_CLIENT_SECRET', 'client-secret');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('GitHub の許可画面へ、repo スコープと開いているポートの callback URL を付けて移す', () => {
    const response = GET(loginRequest('127.0.0.1:19123'));
    const location = new URL(response.headers.get('location') ?? '');

    expect(location.origin + location.pathname).toBe(
      'https://github.com/login/oauth/authorize',
    );
    expect(location.searchParams.get('client_id')).toBe('client-id');
    expect(location.searchParams.get('scope')).toBe('repo');
    expect(location.searchParams.get('redirect_uri')).toBe(
      'http://127.0.0.1:19123/api/auth/callback',
    );
  });

  it('許可画面に渡す state を、JavaScript から読めない cookie にも保存する', () => {
    const response = GET(loginRequest('127.0.0.1:8880'));
    const location = new URL(response.headers.get('location') ?? '');
    const stateCookie = response.cookies.get('oauth_state');

    expect(stateCookie?.value).toBeTruthy();
    expect(stateCookie?.value).toBe(location.searchParams.get('state'));
    expect(stateCookie?.httpOnly).toBe(true);
  });

  it('ログインのたびに異なる state を発行する', () => {
    const first = GET(loginRequest('127.0.0.1:8880'));
    const second = GET(loginRequest('127.0.0.1:8880'));

    expect(first.cookies.get('oauth_state')?.value).not.toBe(
      second.cookies.get('oauth_state')?.value,
    );
  });

  it('localhost で開かれたら、同じポートの 127.0.0.1 へ移してからログインを始める', () => {
    const response = GET(loginRequest('localhost:8880'));

    expect(response.headers.get('location')).toBe(
      'http://127.0.0.1:8880/api/auth/login',
    );
    expect(response.cookies.get('oauth_state')).toBeUndefined();
  });
});
