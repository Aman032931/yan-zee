import { NavLink } from "react-router-dom";

const navLinks = [
  { label: "Yanzee", href: "/all" },
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
        <NavLink
          key={link.label}
          to={link.href}
          className={({ isActive }) =>
            `relative px-[14px] py-2 whitespace-nowrap text-[14px] no-underline transition-colors duration-200 after:absolute after:left-1/2 after:bottom-0 after:h-[2px] after:w-0 after:-translate-x-1/2 after:bg-red-600 after:transition-all after:duration-300 ${
              isActive
                ? "font-semibold text-black after:w-[calc(100%-28px)]"
                : "text-[#333]"
            }`
          }
          title={link.label}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default MainNavigation;
