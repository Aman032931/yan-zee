import { NavLink, useLocation } from "react-router-dom";

const navLinks = [
  { label: "Yanzee", href: "/home" },
  { label: "Fashion", href: "/fashion" },
  { label: "Beauty", href: "/beauty" },
  { label: "Sports", href: "/sports" },
  { label: "Outlet", href: "/outlet" },
  { label: "Kids", href: "/kids" },
  { label: "Premium", href: "/premium" },
  { label: "Home Decor & Appliances", href: "/home-decor" },
];

const MainNavigation = () => {
  const location = useLocation();

  return (
    <nav
      className="
        flex
        min-w-0
        flex-nowrap
        items-center
        gap-0
        overflow-x-auto
        scrollbar-none
        lg:max-w-[calc(100vw-650px)]
        xl:max-w-none
      "
      aria-label="Main navigation"
    >
      {navLinks.map((link) => {
        const isActive =
          link.href === "/home"
            ? location.pathname === "/home" || location.pathname === "/"
            : location.pathname === link.href;

        return (
          <NavLink
            key={link.label}
            to={link.href}
            className={`
              relative
              shrink-0
              whitespace-nowrap
              px-2.5
              py-2
              text-[13px]
              no-underline
              transition-colors
              duration-200
              xl:px-3
              xl:text-[14px]
              after:absolute
              after:bottom-0
              after:left-1/2
              after:h-[2px]
              after:w-0
              after:-translate-x-1/2
              after:bg-red-600
              after:transition-all
              after:duration-300
              ${
                isActive
                  ? "font-semibold text-black after:w-[calc(100%-20px)]"
                  : "text-[#333] hover:text-black"
              }
            `}
            title={link.label}
          >
            {link.label}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MainNavigation;