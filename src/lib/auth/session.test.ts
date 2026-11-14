import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  decryptSession,
  encryptSession,
  SESSION_MAX_AGE_SECONDS,
} from './session';

const SECRET = 'a'.repeat(32);
const session = { accessToken: 'gho_secret_token', login: 'octocat' };

describe('セッション cookie', () => {
  beforeEach(() => {
    vi.stubEnv('SESSION_SECRET', SECRET);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it('暗号化したセッションは同じ鍵で元のトークンとユーザー名に戻る', async () => {
    const cookie = await encryptSession(session);

    expect(await decryptSession(cookie)).toEqual(session);
  });

  it('cookie の値にトークンを平文で含まない', async () => {
    const cookie = await encryptSession(session);

    expect(cookie).not.toContain(session.accessToken);
  });

  it('書き換えた cookie はログインしていないものとして扱う', async () => {
    const cookie = await encryptSession(session);
    const parts = cookie.split('.');
    const ciphertext = parts[3];
    const tamperedCiphertext = `${ciphertext[0] === 'A' ? 'B' : 'A'}${ciphertext.slice(1)}`;
    const tampered = [...parts.slice(0, 3), tamperedCiphertext, parts[4]].join(
      '.',
    );

    expect(await decryptSession(tampered)).toBeNull();
  });

  it('別の SESSION_SECRET で作られた cookie はログインしていないものとして扱う', async () => {
    const cookie = await encryptSession(session);
    vi.stubEnv('SESSION_SECRET', 'b'.repeat(32));

    expect(await decryptSession(cookie)).toBeNull();
  });

  it('有効期限を過ぎた cookie はログインしていないものとして扱う', async () => {
    const cookie = await encryptSession(session);
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + (SESSION_MAX_AGE_SECONDS + 1) * 1000);

    expect(await decryptSession(cookie)).toBeNull();
  });

  it('SESSION_SECRET が 32 文字未満なら暗号化せずに失敗する', async () => {
    vi.stubEnv('SESSION_SECRET', 'short');

    await expect(encryptSession(session)).rejects.toThrow('SESSION_SECRET');
  });
});
