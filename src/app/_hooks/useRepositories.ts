'use client';

import { useEffect, useState, useRef } from 'react';
import type { RepositoryBasic } from '../../types/github';

export const useRepositories = (refreshKey: number) => {
  const [repositories, setRepositories] = useState<RepositoryBasic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedPagesRef = useRef<Set<string>>(new Set());
  const fetchedDiffPagesRef = useRef<Set<string>>(new Set());

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey is used to trigger refetch
  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        setLoading(true);
        fetchedPagesRef.current = new Set();
        fetchedDiffPagesRef.current = new Set();
        const response = await fetch('/api/repositories');
        if (!response.ok) {
          throw new Error('リポジトリの取得に失敗しました');
        }
        const data = await response.json();
        setRepositories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, [refreshKey]);

  return {
    repositories,
    loading,
    error,
    fetchedPagesRef,
    fetchedDiffPagesRef,
  };
};
