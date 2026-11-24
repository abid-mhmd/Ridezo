interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), safeTotalPages);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={safeCurrentPage <= 1}
        onClick={() => onPageChange(Math.max(1, safeCurrentPage - 1))}
        className="inline-flex items-center gap-1 rounded-lg border border-[#263044] bg-[#080B12] px-3 py-1.5 text-xs font-medium text-[#A7B0C0] transition hover:text-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>

      <span className="min-w-16 text-center text-xs text-[#A7B0C0]">
        {safeCurrentPage} / {safeTotalPages}
      </span>

      <button
        type="button"
        disabled={safeCurrentPage >= safeTotalPages}
        onClick={() =>
          onPageChange(Math.min(safeTotalPages, safeCurrentPage + 1))
        }
        className="inline-flex items-center gap-1 rounded-lg border border-[#263044] bg-[#080B12] px-3 py-1.5 text-xs font-medium text-[#A7B0C0] transition hover:text-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
