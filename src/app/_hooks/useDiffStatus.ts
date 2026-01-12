'use client';

import { useEffect, useState } from 'react';
import type { RepositoryBasic, LatestReleaseInfo, DiffStatus } from '../../types/github';

type UseDiffStatusProps = {
  repositories: RepositoryBasic[];
  releases: Record<string, LatestReleaseInfo | null>;
  fetchedDiffPagesRef: React.RefObject<Set<string>>;
};

export const useDiffStatus = ({
  repositories,
  releases,
  fetchedDiffPagesRef,
}: UseDiffStatusProps) => {
  const [diffStatuses, setDiffStatuses] = useState<Record<string, DiffStatus>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const reposWithReleases = repositories.filter(
      (repo) => releases[repo.full_name]?.tag_name && !(repo.full_name in diffStatuses)
    );

    if (reposWithReleases.length === 0) return;

    const cacheKey = reposWithReleases.map((r) => r.full_name).join(',');
    if (fetchedDiffPagesRef.current?.has(cacheKey)) return;
    fetchedDiffPagesRef.current?.add(cacheKey);

    const fetchDiffStatuses = async () => {
      setLoading(true);
      try {
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

        if (response.ok) {
          const data = await response.json();
          setDiffStatuses((prev) => ({ ...prev, ...data }));
        }
      } catch {
        // Ignore diff fetch errors
      } finally {
        setLoading(false);
      }
    };

    fetchDiffStatuses();
  }, [repositories, releases, diffStatuses, fetchedDiffPagesRef]);

  const resetDiffStatuses = () => {
    setDiffStatuses({});
  };

  return {
    diffStatuses,
    loading,
    resetDiffStatuses,
  };
};
