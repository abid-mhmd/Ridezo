import { FiSearch } from 'react-icons/fi';

interface AdminSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}

export default function AdminSearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search...',
}: AdminSearchBarProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="flex w-full gap-2 sm:w-auto"
    >
      <label className="relative block min-w-0 flex-1 sm:w-64">
        <span className="sr-only">Search</span>

        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[#707B8F]">
          <FiSearch size={15} />
        </span>

        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full appearance-none rounded-xl border border-[#263044] bg-[#080B12] py-2 pl-10 pr-3 text-xs text-[#F8FAFC] outline-none transition placeholder:text-[#707B8F] focus:border-[#C37DF5] [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
        />
      </label>

      <button
        type="submit"
        className="rounded-xl bg-[#C37DF5] px-4 py-2 text-xs font-semibold text-[#080B12] transition hover:bg-[#D5A0FA]"
      >
        Search
      </button>
    </form>
  );
}
