'use client';

import { useQuery } from '@tanstack/react-query';
import type { RepositoryBasic, LatestReleaseInfo } from '../../types/github';

type UseReleasesProps = {
  repositories: RepositoryBasic[];
};

type ReleasesResponse = Record<string, LatestReleaseInfo | null>;

const fetchReleases = async (
  repositories: RepositoryBasic[]
): Promise<ReleasesResponse> => {
  if (repositories.length === 0) return {};

  const response = await fetch('/api/releases/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      repositories: repositories.map((repo) => ({
        owner: repo.owner,
        name: repo.name,
        full_name: repo.full_name,
      })),
    }),
  });

  if (!response.ok) {
    throw new Error('リリース情報の取得に失敗しました');
  }

  return response.json();
};

export const useReleases = ({ repositories }: UseReleasesProps) => {
  const repoKeys = repositories.map((r) => r.full_name).sort().join(',');

  const { data, isLoading } = useQuery({
    queryKey: ['releases', repoKeys],
    queryFn: () => fetchReleases(repositories),
    enabled: repositories.length > 0,
  });

  return {
    releases: data ?? {},
    loading: isLoading,
  };
};
