'use client';

import { RepositoryCardSkeleton } from '../../components/RepositoryCardSkeleton';

export const LoadingSkeleton = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="h-7 w-40 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton items don't reorder
          <RepositoryCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};
