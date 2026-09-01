

const SearchBar = ({ value, onChange, onSubmit }) => {
  return (
    <form className="yz-header__search" role="search" onSubmit={onSubmit}>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
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
      />
    </form>
  );
};

export default SearchBar;