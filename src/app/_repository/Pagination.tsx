'use client';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-gray-50 transition-colors"
      >
        前へ
      </button>
      <div className="flex gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`px-3 py-1.5 text-sm rounded cursor-pointer transition-colors ${
              currentPage === page
                ? 'bg-gray-800 text-white'
                : 'text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-gray-50 transition-colors"
      >
        次へ
      </button>
    </div>
  );
};
