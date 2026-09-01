
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
    <nav className="yz-header__nav" aria-label="Main navigation">
      {navLinks.map((link) => (
        <a
          key={link.label}
          href={link.href}
          className={link.active ? "is-active" : ""}
          title={link.label}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
};

export default MainNavigation;