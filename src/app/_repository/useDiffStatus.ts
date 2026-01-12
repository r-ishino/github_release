'use client';

import { useQuery } from '@tanstack/react-query';
import type { RepositoryBasic, LatestReleaseInfo, DiffStatus } from '../../types/github';

type UseDiffStatusProps = {
  repositories: RepositoryBasic[];
  releases: Record<string, LatestReleaseInfo | null>;
};

type DiffStatusResponse = Record<string, DiffStatus>;

const fetchDiffStatuses = async (
  repositories: RepositoryBasic[],
  releases: Record<string, LatestReleaseInfo | null>
): Promise<DiffStatusResponse> => {
  const reposWithReleases = repositories.filter(
    (repo) => releases[repo.full_name]?.tag_name
  );

  if (reposWithReleases.length === 0) return {};

  const response = await fetch('/api/diff-status/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      repositories: reposWithReleases.map((repo) => ({
        owner: repo.owner,
        name: repo.name,
        full_name: repo.full_name,
        tag_name: releases[repo.full_name]?.tag_name,
        default_branch: repo.default_branch,
      })),
    }),
  });

  if (!response.ok) {
    throw new Error('差分情報の取得に失敗しました');
  }

  return response.json();
};

export const useDiffStatus = ({ repositories, releases }: UseDiffStatusProps) => {
  const reposWithReleases = repositories.filter(
    (repo) => releases[repo.full_name]?.tag_name
  );
  const repoKeys = reposWithReleases.map((r) => r.full_name).sort().join(',');

  const { data, isLoading } = useQuery({
    queryKey: ['diffStatuses', repoKeys],
    queryFn: () => fetchDiffStatuses(repositories, releases),
    enabled: reposWithReleases.length > 0,
  });

  return {
    diffStatuses: data ?? {},
    loading: isLoading,
  };
};
