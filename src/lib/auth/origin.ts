import type { NextRequest } from 'next/server';

// request.nextUrl / request.url は 127.0.0.1 を localhost に書き換えるため、
// ブラウザが実際に開いている origin は Host ヘッダーから組み立てる。
export const getRequestOrigin = (request: NextRequest): string => {
  const host = request.headers.get('host');
  if (!host) {
    throw new Error('Host header is missing');
  }
  return `${request.nextUrl.protocol}//${host}`;
};

export const isSameOrigin = (request: NextRequest): boolean =>
  request.headers.get('origin') === getRequestOrigin(request);

// GET には Origin が付かないことがあるので、ブラウザが付ける Sec-Fetch-Site で
// 他サイトからの遷移を見分ける。付けないクライアント(curl など)は cookie を
// 自分で持っている本人なので通す。
export const isSameOriginByFetchMetadata = (request: NextRequest): boolean => {
  const site = request.headers.get('sec-fetch-site');
  return site === null || site === 'same-origin';
};
