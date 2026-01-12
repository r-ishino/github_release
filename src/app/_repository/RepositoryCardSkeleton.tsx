'use client';

export const RepositoryCardSkeleton = () => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white animate-pulse">
      {/* Header: owner badge + repo name + star */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {/* Owner badge: matches px-2 py-0.5 text-xs */}
            <div className="h-[22px] w-16 bg-gray-200 rounded" />
          </div>
          {/* Repo name: matches text-base font-semibold */}
          <div className="h-6 w-32 bg-gray-200 rounded" />
        </div>
        {/* Star button: matches text-lg */}
        <div className="h-7 w-7 bg-gray-200 rounded" />
      </div>

      {/* Description: matches text-sm mb-3 */}
      <div className="h-5 w-full bg-gray-200 rounded mb-3" />

      {/* Footer: version info + button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* Version tag: matches px-2 py-0.5 text-xs */}
          <div className="h-[22px] w-14 bg-gray-200 rounded" />
          {/* Days ago: matches text-xs */}
          <div className="h-4 w-10 bg-gray-200 rounded" />
        </div>
        {/* Release button: matches px-3 py-1.5 text-xs */}
        <div className="h-[30px] w-[68px] bg-gray-200 rounded" />
      </div>
    </div>
  );
};
