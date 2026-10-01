const SearchBar = ({ value, onChange, onSubmit }) => {
  return (
    <form
      className="flex w-full min-w-0 items-center rounded-[8px] bg-[#f5f5f5] px-3 transition-colors duration-200 focus-within:bg-[#eeeeee] lg:w-[280px] xl:w-[320px]"
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
        className="w-full min-w-0 border-none bg-transparent px-2 py-2.5 text-sm text-black outline-none placeholder:text-[#999]"
      />
    </form>
  );
};

export default SearchBar;