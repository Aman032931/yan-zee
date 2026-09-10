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
    <div className="fixed inset-0 z-2000 flex">
      <div
        className="absolute inset-0 bg-[rgba(0,0,0,0.5)]"
        onClick={onClose}
      ></div>
      <div className="relative z-1 h-full w-75 max-w-[80%] animate-slide-in overflow-y-auto bg-white p-5">
        <button
          className="mb-5 cursor-pointer border-0 bg-transparent p-2 text-[24px] text-[#333]"
          onClick={onClose}
        >
          ✕
        </button>
        <nav className="flex flex-col gap-2">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-sm px-4 py-3 text-[16px] text-[#333] no-underline transition-colors duration-200 hover: mg-text-red "
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default MobileSidebar;
