'use client';

type SearchHeaderProps = {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filteredCount: number;
  totalCount: number;
};

export const SearchHeader = ({
  searchQuery,
  onSearchChange,
  filteredCount,
  totalCount,
}: SearchHeaderProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-4 mb-2">
        <h2 className="text-xl font-semibold text-gray-800">リポジトリ一覧</h2>
        <input
          type="text"
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="検索..."
          className="px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 w-64"
        />
      </div>
      <p className="text-gray-500 text-sm">
        {searchQuery
          ? `${filteredCount} / ${totalCount} 件`
          : `${totalCount} 件のリポジトリ`}
      </p>
    </div>
  );
};
