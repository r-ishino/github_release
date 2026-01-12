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

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['repositories'] });
    queryClient.invalidateQueries({ queryKey: ['releases'] });
    queryClient.invalidateQueries({ queryKey: ['diffStatuses'] });
  };

  return {
    repositories: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
    invalidate,
  };
};
