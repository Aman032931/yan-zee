const SearchBar = ({ value, onChange, onSubmit }) => {
  return (
    <form
      className="flex w-[280px] items-center rounded-[8px] bg-[#f5f5f5] px-[12px] transition-colors duration-200 focus-within:bg-[#eeeeee] max-[1024px]:w-[200px] max-[768px]:w-[140px] max-[480px]:w-[100px]"
      role="search"
      onSubmit={onSubmit}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
        className="shrink-0 text-[#666] max-[480px]:h-[14px] max-[480px]:w-[14px]"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        placeholder="Search all products"
        autoComplete="off"
        aria-label="Search products"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        name="q"
        className="w-full border-none bg-transparent px-[10px] py-[10px] text-[14px] text-black outline-none placeholder:text-[#999] max-[768px]:px-[6px] max-[768px]:py-2 max-[768px]:text-[13px] max-[480px]:px-1 max-[480px]:py-[6px] max-[480px]:text-[12px]"
      />
    </form>
  );
};

export default SearchBar;