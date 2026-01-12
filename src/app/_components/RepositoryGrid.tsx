'use client';

import { RepositoryCard } from '../../components/RepositoryCard';
import type { RepositoryWithRelease, DiffStatus } from '../../types/github';

type RepositoryGridProps = {
  repositories: RepositoryWithRelease[];
  releases: Record<string, unknown>;
  diffStatuses: Record<string, DiffStatus>;
  releasesLoading: boolean;
  diffLoading: boolean;
  isFavorite: (fullName: string) => boolean;
  onToggleFavorite: (fullName: string) => void;
  onCreateRelease: (repository: RepositoryWithRelease) => void;
};

export const RepositoryGrid = ({
  repositories,
  releases,
  diffStatuses,
  releasesLoading,
  diffLoading,
  isFavorite,
  onToggleFavorite,
  onCreateRelease,
}: RepositoryGridProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {repositories.map((repo) => (
        <RepositoryCard
          key={repo.id}
          repository={repo}
          isFavorite={isFavorite(repo.full_name)}
          onToggleFavorite={onToggleFavorite}
          onCreateRelease={onCreateRelease}
          isLoadingRelease={releasesLoading && !(repo.full_name in releases)}
          diffStatus={diffStatuses[repo.full_name]}
          isLoadingDiff={diffLoading && !(repo.full_name in diffStatuses)}
        />
      ))}
    </div>
  );
};
