import type {
  GitHubRelease,
  LatestReleaseInfo,
  GeneratedNotes,
  GitHubCompareResponse,
  DiffStatus,
} from '@/types/github';
import { fetchGitHub } from './client';

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

export const getDiffStatus = async (
  owner: string,
  repo: string,
  tagName: string,
  defaultBranch: string
): Promise<DiffStatus> => {
  try {
    const compare = await fetchGitHub<GitHubCompareResponse>(
      `/repos/${owner}/${repo}/compare/${encodeURIComponent(tagName)}...${encodeURIComponent(defaultBranch)}`
    );

    return {
      hasChanges: compare.ahead_by > 0,
      commitsAhead: compare.ahead_by,
    };
  } catch {
    return {
      hasChanges: false,
      commitsAhead: 0,
    };
  }
};
