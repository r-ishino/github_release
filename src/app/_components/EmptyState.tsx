'use client';

type EmptyStateProps = {
  searchQuery: string;
};

export const EmptyState = ({ searchQuery }: EmptyStateProps) => {
  return (
    <div className="text-center text-gray-400 py-12">
      {searchQuery
        ? `「${searchQuery}」に一致するリポジトリはありません`
        : 'リポジトリがありません'}
    </div>
  );
};
