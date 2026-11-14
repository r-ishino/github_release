const MIN_SESSION_SECRET_LENGTH = 32;

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
};

export const getOAuthConfig = () => ({
  clientId: requireEnv('GITHUB_CLIENT_ID'),
  clientSecret: requireEnv('GITHUB_CLIENT_SECRET'),
});

export const getSessionSecret = (): string => {
  const secret = requireEnv('SESSION_SECRET');
  if (secret.length < MIN_SESSION_SECRET_LENGTH) {
    throw new Error(
      `SESSION_SECRET must be at least ${MIN_SESSION_SECRET_LENGTH} characters`,
    );
  }
  return secret;
};
