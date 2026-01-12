'use client';

export const RepositoryCardSkeleton = () => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white animate-pulse">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-5 w-16 bg-gray-200 rounded" />
          </div>
          <div className="h-5 w-32 bg-gray-200 rounded" />
        </div>
        <div className="h-5 w-5 bg-gray-200 rounded" />
      </div>

      <div className="h-4 w-full bg-gray-200 rounded mb-3" />

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 bg-gray-200 rounded" />
          <div className="h-4 w-12 bg-gray-200 rounded" />
        </div>
        <div className="h-8 w-20 bg-gray-200 rounded" />
      </div>
    </div>
  );
};
