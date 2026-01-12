'use client';

import type { RepositoryWithRelease, DiffStatus } from '../types/github';

type RepositoryCardProps = {
  repository: RepositoryWithRelease;
  isFavorite: boolean;
  onToggleFavorite: (repoFullName: string) => void;
  onCreateRelease: (repository: RepositoryWithRelease) => void;
  isLoadingRelease?: boolean;
  diffStatus?: DiffStatus;
  isLoadingDiff?: boolean;
};

const ownerColors = [
  'bg-slate-100 text-slate-600',
  'bg-zinc-100 text-zinc-600',
  'bg-stone-100 text-stone-600',
  'bg-neutral-100 text-neutral-600',
  'bg-gray-100 text-gray-600',
  'bg-slate-50 text-slate-500',
  'bg-zinc-50 text-zinc-500',
  'bg-stone-50 text-stone-500',
  'bg-neutral-50 text-neutral-500',
  'bg-gray-50 text-gray-500',
];

const getOwnerColor = (owner: string): string => {
  let hash = 0;
  for (let i = 0; i < owner.length; i++) {
    hash = owner.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % ownerColors.length;
  return ownerColors[index];
};

export const RepositoryCard = ({
  repository,
  isFavorite,
  onToggleFavorite,
  onCreateRelease,
  isLoadingRelease = false,
  diffStatus,
  isLoadingDiff = false,
}: RepositoryCardProps) => {
  const { latest_release } = repository;
  const ownerColorClass = getOwnerColor(repository.owner);

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${ownerColorClass}`}>
              {repository.owner}
            </span>
            {repository.private && (
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                Private
              </span>
            )}
          </div>
          <a
            href={repository.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-semibold text-gray-800 hover:text-blue-600 hover:underline transition-colors"
          >
            {repository.name}
          </a>
        </div>
        <button
          type="button"
          onClick={() => onToggleFavorite(repository.full_name)}
          className={`text-lg cursor-pointer hover:scale-110 transition-transform ${isFavorite ? 'text-amber-400' : 'text-gray-300 hover:text-amber-300'}`}
          title={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </div>

      {repository.description && (
        <p className="text-gray-600 text-sm mb-3">{repository.description}</p>
      )}

      <div className="flex justify-between items-center">
        <div className="text-sm">
          {isLoadingRelease ? (
            <div className="flex items-center gap-2">
              <div className="h-[22px] w-14 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-10 bg-gray-200 rounded animate-pulse" />
            </div>
          ) : latest_release ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded font-mono text-xs">
                {latest_release.tag_name}
              </span>
              <span className="text-gray-400 text-xs">
                {latest_release.days_since_release === 0
                  ? '今日'
                  : `${latest_release.days_since_release}日前`}
              </span>
            </div>
          ) : (
            <span className="text-gray-400 text-xs">リリースなし</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {latest_release && (
            isLoadingDiff ? (
              <div className="h-[22px] w-8 bg-gray-200 rounded animate-pulse" />
            ) : diffStatus?.hasChanges ? (
              <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-xs font-medium">
                +{diffStatus.commitsAhead}
              </span>
            ) : diffStatus ? (
              <span className="text-gray-400 text-xs">✓</span>
            ) : null
          )}
          <button
            type="button"
            onClick={() => onCreateRelease(repository)}
            disabled={!latest_release || !diffStatus?.hasChanges}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors cursor-pointer disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Release
          </button>
        </div>
      </div>
    </div>
  );
};
