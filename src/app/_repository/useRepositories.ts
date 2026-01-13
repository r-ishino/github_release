'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { RepositoryBasic } from '../../types/github';

const fetchRepositories = async (): Promise<RepositoryBasic[]> => {
  const response = await fetch('/api/repositories');
  if (!response.ok) {
    throw new Error('リポジトリの取得に失敗しました');
  }
  return response.json();
};

export const useRepositories = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['repositories'],
    queryFn: fetchRepositories,
  });

  const invalidate = async () => {
    // GitHub APIの反映を待つため、少し遅延してから再取得
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await queryClient.refetchQueries({ queryKey: ['releases'] });
    await queryClient.refetchQueries({ queryKey: ['diffStatuses'] });
  };

  return {
    repositories: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
    invalidate,
  };
};
