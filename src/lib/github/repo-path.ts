const GITHUB_NAME_PATTERN = /^[A-Za-z0-9_.-]+$/;

const assertGitHubName = (kind: string, value: string): void => {
  if (!GITHUB_NAME_PATTERN.test(value) || value === '.' || value === '..') {
    throw new Error(`Invalid ${kind}: ${value}`);
  }
};

export const repoPath = (owner: string, repo: string): string => {
  assertGitHubName('owner', owner);
  assertGitHubName('repo', repo);
  return `/repos/${owner}/${repo}`;
};
