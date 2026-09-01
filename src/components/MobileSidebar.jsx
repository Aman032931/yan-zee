

const MobileSidebar = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

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

  return (
    <div className="yz-mobile-sidebar">
      <div className="yz-mobile-sidebar__overlay" onClick={onClose}></div>
      <div className="yz-mobile-sidebar__content">
        <button className="yz-mobile-sidebar__close" onClick={onClose}>
          ✕
        </button>
        <nav>
          {navLinks.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default MobileSidebar;