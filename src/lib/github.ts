import type {
  GitHubRepository,
  GitHubRelease,
  RepositoryBasic,
  RepositoryWithRelease,
  LatestReleaseInfo,
  GeneratedNotes,
} from '@/types/github';

const GITHUB_API_BASE = 'https://api.github.com';

const getHeaders = (): HeadersInit => {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN is not set');
  }

  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  };
};

const fetchGitHub = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const url = `${GITHUB_API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `GitHub API error: ${response.status}`);
  }

  return response.json();
};

export const getRepositoriesBasic = async (): Promise<RepositoryBasic[]> => {
  const repos = await fetchGitHub<GitHubRepository[]>(
    '/user/repos?per_page=100&sort=updated'
  );

  return repos.map((repo) => ({
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    owner: repo.owner.login,
    description: repo.description,
    private: repo.private,
    html_url: repo.html_url,
    default_branch: repo.default_branch,
  }));
};

export const getRepositories = async (): Promise<RepositoryWithRelease[]> => {
  const repos = await fetchGitHub<GitHubRepository[]>(
    '/user/repos?per_page=100&sort=updated'
  );

  const reposWithRelease = await Promise.all(
    repos.map(async (repo) => {
      const latestRelease = await getLatestRelease(repo.owner.login, repo.name);

      return {
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        owner: repo.owner.login,
        description: repo.description,
        private: repo.private,
        html_url: repo.html_url,
        default_branch: repo.default_branch,
        latest_release: latestRelease,
      };
    })
  );

  return reposWithRelease;
};

export const getLatestRelease = async (
  owner: string,
  repo: string
): Promise<LatestReleaseInfo | null> => {
  try {
    const release = await fetchGitHub<GitHubRelease>(
      `/repos/${owner}/${repo}/releases/latest`
    );

    const publishedAt = release.published_at;
    const daysSinceRelease = publishedAt
      ? Math.floor(
          (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

    return {
      tag_name: release.tag_name,
      published_at: publishedAt || '',
      days_since_release: daysSinceRelease,
    };
  } catch {
    return null;
  }
};

export const getReleases = async (
  owner: string,
  repo: string
): Promise<GitHubRelease[]> => {
  return fetchGitHub<GitHubRelease[]>(`/repos/${owner}/${repo}/releases?per_page=20`);
};

export const generateReleaseNotes = async (
  owner: string,
  repo: string,
  tagName: string,
  targetCommitish?: string,
  previousTagName?: string
): Promise<GeneratedNotes> => {
  const body: Record<string, string> = {
    tag_name: tagName,
  };

  if (targetCommitish) {
    body.target_commitish = targetCommitish;
  }

  if (previousTagName) {
    body.previous_tag_name = previousTagName;
  }

  return fetchGitHub<GeneratedNotes>(`/repos/${owner}/${repo}/releases/generate-notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
};

export const createRelease = async (
  owner: string,
  repo: string,
  tagName: string,
  options?: {
    name?: string;
    body?: string;
    targetCommitish?: string;
    draft?: boolean;
    prerelease?: boolean;
  }
): Promise<GitHubRelease> => {
  return fetchGitHub<GitHubRelease>(`/repos/${owner}/${repo}/releases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tag_name: tagName,
      name: options?.name || tagName,
      body: options?.body || '',
      target_commitish: options?.targetCommitish,
      draft: options?.draft || false,
      prerelease: options?.prerelease || false,
    }),
  });
};

export const calculateNextVersion = (currentVersion: string): string => {
  const hasPrefix = currentVersion.startsWith('v');
  const version = hasPrefix ? currentVersion.slice(1) : currentVersion;

  const parts = version.split('.');
  if (parts.length !== 3) {
    return hasPrefix ? `v${version}.1` : `${version}.1`;
  }

  const [major, minor, patch] = parts;
  const nextPatch = Number.parseInt(patch, 10) + 1;

  const nextVersion = `${major}.${minor}.${nextPatch}`;
  return hasPrefix ? `v${nextVersion}` : nextVersion;
};
