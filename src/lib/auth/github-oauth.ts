import type { NextRequest } from 'next/server';
import { getOAuthConfig } from './config';
import { getRequestOrigin } from './origin';

const AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const TOKEN_URL = 'https://github.com/login/oauth/access_token';

export const OAUTH_SCOPE = 'repo';
export const STATE_COOKIE = 'oauth_state';
export const STATE_COOKIE_PATH = '/api/auth';
export const STATE_MAX_AGE_SECONDS = 60 * 10;

export const getCallbackUrl = (request: NextRequest): string =>
  `${getRequestOrigin(request)}/api/auth/callback`;

export const buildAuthorizeUrl = ({
  redirectUri,
  state,
}: {
  redirectUri: string;
  state: string;
}): string => {
  const url = new URL(AUTHORIZE_URL);
  url.searchParams.set('client_id', getOAuthConfig().clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', OAUTH_SCOPE);
  url.searchParams.set('state', state);
  return url.toString();
};

type TokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

export const exchangeCodeForToken = async ({
  code,
  redirectUri,
}: {
  code: string;
  redirectUri: string;
}): Promise<string> => {
  const { clientId, clientSecret } = getOAuthConfig();
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  const data = (await response.json()) as TokenResponse;
  if (!response.ok || !data.access_token) {
    throw new Error(
      `GitHub token exchange failed: ${data.error_description ?? data.error ?? response.status}`,
    );
  }
  return data.access_token;
};
