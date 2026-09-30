import { Link, useLocation } from "react-router-dom";

const LoginButton = () => {
    const location = useLocation();

    const currentPage =
        location.pathname + location.search;

    return (
        <Link
            to="/login"
            state={{
                from: currentPage
            }}
            className="flex items-center gap-[6px] rounded-full bg-red-600 px-4 py-[9px] text-[13px] font-semibold uppercase tracking-wide text-white no-underline transition-colors duration-200 hover:bg-red-700"
            aria-label="Login"
        >
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

            <span>Login</span>
        </Link>
    );
};

export default LoginButton;