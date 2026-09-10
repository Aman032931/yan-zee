const MenuButton = ({ isOpen, onClick }) => {
  return (
    <button
      type="button"
      className="flex items-center justify-center cursor-pointer border-none bg-transparent p-2 text-black hover:opacity-70"
      onClick={onClick}
      aria-label="Open menu"
      aria-expanded={isOpen}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    </button>
  );
};

export default MenuButton;