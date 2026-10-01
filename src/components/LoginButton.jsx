import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut } from "lucide-react";
import { useAuth } from "../context/useAuth";

const UserIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M5 20c1.5-3.5 4.5-5 7-5s5.5 1.5 7 5" />
  </svg>
);

const LoginButton = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const currentPage = location.pathname + location.search;

  // close the dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---------- LOGGED OUT ----------
  if (!currentUser) {
    return (
      <Link
        to="/login"
        state={{ from: currentPage }}
        className="flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2.25 text-[13px] font-semibold uppercase tracking-wide text-white no-underline transition-colors duration-200 hover:bg-red-700"
        aria-label="Login"
      >
        <UserIcon />
        <span>Login</span>
      </Link>
    );
  }

  // ---------- LOGGED IN ----------
  const fullName = currentUser.fullName || currentUser.name || "Account";
  const firstName = fullName.split(" ")[0];
  const role = (currentUser.role || "").toLowerCase();

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-gray-200 px-4 py-2.25 text-[13px] font-semibold tracking-wide text-black transition-colors duration-200 hover:bg-gray-300"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Account menu"
      >
        <UserIcon />
        <span className="max-w-20 truncate">{firstName}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-[1100] mt-2 w-60 overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-lg"
        >
          <div className="border-b border-[#eee] px-4 py-3">
            <p className="m-0 truncate text-[14px] font-semibold text-[#111]">
              {fullName}
            </p>
            <p className="m-0 truncate text-[12px] text-[#777]">
              {currentUser.email}
            </p>
            {role && (
              <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-[2px] text-[11px] font-medium capitalize text-slate-700">
                {role}
              </span>
            )}
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center gap-2 border-0 bg-transparent px-4 py-3 text-left text-[14px] text-[#333] transition-colors duration-200 hover:bg-slate-50 hover:text-red-600"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginButton;