const BASE =
  "inline-flex items-center justify-center gap-1.5 font-semibold rounded transition cursor-pointer whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-40";

const VARIANTS = {
  primary: "bg-black text-white hover:bg-gray-800",
  secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
  outline: "border border-gray-900 text-gray-900 hover:bg-black hover:text-white",
  outlineMuted: "border border-gray-300 text-gray-700 hover:bg-gray-50",
  ghost: "text-gray-500 hover:text-red-600",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const SIZES = {
  sm: "text-[11px] px-3 py-1.5",
  md: "text-sm px-4 py-2",
  lg: "h-12 px-5 text-sm",
};

const ICON_SIZES = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-4 h-4",
};

/**
 * Reusable button with an icon + label that are always aligned
 * correctly (icon left of text, vertically centered, never wraps
 * onto its own line). Use this instead of hand-building
 * flex/gap/shrink classes on every button across the app.
 *
 * <IconButton icon={ShoppingCart} variant="primary" size="sm">
 *   Add to cart
 * </IconButton>
 *
 * Pass iconPosition="right" to put the icon after the text
 * (e.g. "Proceed to Checkout" with an arrow).
 *
 * `ref` is accepted as a plain prop (React 19+) — no forwardRef
 * wrapper needed.
 */
export default function IconButton({
  ref,
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
    <button
      ref={ref}
      type="button"
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {iconPosition === "left" && iconEl}
      {children}
      {iconPosition === "right" && iconEl}
    </button>
  );
}