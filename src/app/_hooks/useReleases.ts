'use client';

import { useEffect, useState } from 'react';
import type { RepositoryBasic, LatestReleaseInfo } from '../../types/github';

type UseReleasesProps = {
  repositories: RepositoryBasic[];
  fetchedPagesRef: React.RefObject<Set<string>>;
};

export const useReleases = ({
  repositories,
  fetchedPagesRef,
}: UseReleasesProps) => {
  const [releases, setReleases] = useState<Record<string, LatestReleaseInfo | null>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const reposToFetch = repositories.filter(
      (repo) => !(repo.full_name in releases)
    );

    if (reposToFetch.length === 0) return;

    const cacheKey = reposToFetch.map((r) => r.full_name).join(',');
    if (fetchedPagesRef.current?.has(cacheKey)) return;
    fetchedPagesRef.current?.add(cacheKey);

    const fetchReleases = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/releases/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repositories: reposToFetch.map((repo) => ({
              owner: repo.owner,
              name: repo.name,
              full_name: repo.full_name,
            })),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setReleases((prev) => ({ ...prev, ...data }));
        }
      } catch {
        // Ignore release fetch errors
      } finally {
        setLoading(false);
      }
    };

    fetchReleases();
  }, [repositories, releases, fetchedPagesRef]);

  const resetReleases = () => {
    setReleases({});
  };

  return {
    releases,
    loading,
    resetReleases,
  };
};
