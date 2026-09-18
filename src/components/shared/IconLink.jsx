import { Link } from "react-router-dom";

const BASE =
  "inline-flex items-center justify-center gap-1.5 font-semibold rounded transition cursor-pointer whitespace-nowrap";

const VARIANTS = {
  primary: "bg-black text-white hover:bg-gray-800",
  secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
  outline: "border border-gray-900 text-gray-900 hover:bg-black hover:text-white",
  ghost: "text-gray-700 hover:text-black",
};

const SIZES = {
  sm: "text-[11px] px-3 py-1.5",
  md: "text-sm px-6 py-2.5",
  lg: "h-12 px-5 text-sm",
};

const ICON_SIZES = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-4 h-4",
};

/**
 * Same look/behavior as IconButton, but renders a react-router
 * <Link> for navigation actions ("Continue Shopping", "Proceed
 * to Checkout", "Explore Products", etc).
 *
 * <IconLink to="/home" icon={ShoppingBag}>Continue Shopping</IconLink>
 *
 * `ref` is accepted as a plain prop (React 19+) — no forwardRef
 * wrapper needed.
 */
export default function IconLink({
  ref,
  to,
  icon: Icon,
  iconPosition = "left",
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const iconEl = Icon ? (
    <Icon className={`${ICON_SIZES[size]} shrink-0`} />
  ) : null;

  return (
    <Link
      ref={ref}
      to={to}
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {iconPosition === "left" && iconEl}
      {children}
      {iconPosition === "right" && iconEl}
    </Link>
  );
}