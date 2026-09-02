const navLinks = [
  { label: "Yanzee", href: "/all", active: false },
  { label: "Fashion", href: "/fashion" },
  { label: "Beauty", href: "/beauty" },
  { label: "Sports", href: "/sports" },
  { label: "Outlet", href: "/outlet" },
  { label: "Kids", href: "/kids" },
  { label: "Premium", href: "/premium" },
  { label: "Home Decor & Appliances", href: "/home" },
];

const MainNavigation = () => {
  return (
    <nav
      className="flex flex-wrap items-center gap-1 max-[1024px]:hidden"
      aria-label="Main navigation"
    >
      {navLinks.map((link) => (
        <a
          key={link.label}
          href={link.href}
          className={`relative rounded-[4px] px-[14px] py-2 whitespace-nowrap text-[14px] text-[#333] no-underline transition-colors duration-200  hover:bg-[#f5f5f5] after:absolute after:left-1/2 after:bottom-0 after:h-[2px] after:w-0 after:-translate-x-1/2 after:bg-red-600 after:transition-all after:duration-300 hover:after:w-[calc(100%-28px)] ${
            link.active ? "bg-[#f0f0f0] font-semibold text-black" : ""
          }`}
          title={link.label}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
};

export default MainNavigation;