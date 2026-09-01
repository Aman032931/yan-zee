

const LoginButton = () => {
  return (
    <a className="yz-header__login" aria-label="Login" href="/login">
      <svg
        width="18"
        height="18"
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
      <span className="yz-header__login-text">Login</span>
    </a>
  );
};

export default LoginButton;