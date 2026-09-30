import { Link } from "react-router-dom";
import { ChevronRight, X } from "lucide-react";
import GenderDropdown from "./GenderDropdown";

const MobileSidebar = ({ isOpen, onClose, selectedGender, onSelectGender }) => {
  if (!isOpen) return null;

  const navLinks = [
    { label: "Yanzee", href: "/home" },
    { label: "Fashion", href: "/fashion" },
    { label: "Sports", href: "/sports" },
    { label: "Beauty", href: "/beauty" },
    { label: "Outlet", href: "/outlet" },
    { label: "Kids", href: "/kids" },
    { label: "Premium", href: "/premium" },
    { label: "Home Decor & Appliances", href: "/home-decor" },
  ];

  return (
    <div className="fixed inset-0 z-[2000] flex">

      <div
        className="absolute inset-0 bg-[rgba(0,0,0,0.5)]"
        onClick={onClose}
      ></div>

      <div className="relative z-[1] flex h-full w-[300px] max-w-[85%] animate-slide-in flex-col overflow-y-auto bg-white">

        {/* Header — wordmark + close */}
        <div className="flex items-center justify-between border-b border-[#eee] px-5 py-5">
          <span className="text-[20px] font-bold italic">YANZEE</span>
          <button
            className="cursor-pointer border-0 bg-transparent p-1 text-[#333]"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Categories row — label + gender pill */}
        <div className="flex items-center justify-between px-5 py-5">
          <span className="text-[16px] font-semibold text-[#111]">Categories</span>
          <GenderDropdown
            selectedGender={selectedGender}
            onSelectGender={(gender) => {
              onSelectGender(gender);
              onClose();
            }}
          />
        </div>

        {/* Departments */}
        <div className="px-5 pb-2">
          <span className="text-[11px] font-semibold tracking-wide text-[#999]">
            DEPARTMENTS
          </span>
        </div>

        <nav className="flex flex-col">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              onClick={onClose}
              className="flex items-center justify-between border-b border-[#f0f0f0] px-5 py-4 text-[16px] text-[#0c0c0c] no-underline transition-colors duration-200 hover:text-red-500"
            >
              {link.label}
              <ChevronRight size={16} className="text-[#bbb]" />
            </Link>
          ))}
        </nav>

      </div>
    </div>
  );
};

export default MobileSidebar;