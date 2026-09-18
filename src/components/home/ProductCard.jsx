import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

export default function ProductCard({ product }) {
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const wishlisted = isWishlisted(product.id);
  const inCart = isInCart(product.id);

  const cartPayload = {
    ...product,
    id: product.id,
    name: product.name || product.title,
    image: product.image,
    priceNPR: product.priceNPR ?? product.price ?? 0,
    brand: product.brand || product.category,
    stock: product.stock ?? 999,
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.preventDefault();
    e.stopPropagation();

    toggleWishlist(cartPayload);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart(cartPayload);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group relative flex w-full min-w-0 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white transition-all duration-300 hover:border-gray-200 hover:shadow-lg"
    >
      {/* Top Badge */}
      {product?.badge && (
        <span className="absolute top-2 left-2 z-10 text-[10px] font-bold uppercase bg-orange-600 text-white px-2 py-0.5 rounded">
          {product.badge}
        </span>
      )}

      {/* ===== Wishlist ===== */}
      <button
        type="button"
        onClick={handleWishlistToggle}
        className="absolute right-2 top-2 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 hover:scale-110"
        aria-label="Add to wishlist"
      >
        <svg
          className={`w-4 h-4 ${
            wishlisted
              ? "fill-red-500 text-red-500"
              : "fill-none stroke-current"
          }`}
          viewBox="0 0 24 24"
          strokeWidth="2"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/*
        ===== Image + overlay =====
        This wrapper MUST keep `relative overflow-hidden` — it is the
        positioning context the Add to Cart bar anchors to, and the
        clip boundary that keeps the bar from pushing card content down.
      */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-50">
        <img
          src={product?.image}
          alt={product?.title || product?.name || "Product"}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* ===== Info ===== */}
      <div className="flex flex-grow flex-col justify-between p-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block truncate">
            {product?.brand || "GENERIC"}
          </span>

          <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 mt-1 min-h-[32px]">
            {product?.title || product?.name}
          </h4>

          {/* Star Rating */}
          <div className="flex items-center gap-1 mt-1 text-yellow-400 text-xs">
            {"★".repeat(product?.rating || 4)}
            {"☆".repeat(5 - (product?.rating || 4))}
          </div>
        </div>

        {/* Price */}
        <div className="mt-2">
          <span className="text-sm font-bold text-gray-900">
            Nrs{" "}
            {(product?.priceNPR ?? product?.price ?? 0).toLocaleString()}
          </span>

          {product?.mrp && (
            <>
              <span className="text-[11px] text-gray-400 line-through">
                Nrs {product.mrp.toLocaleString()}
              </span>
              {product.discountPercent > 0 && (
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600">
                  {product.discountPercent}% OFF
                </span>
              )}
            </>
          )}
        </div>

        {/* Add to Cart */}
        <button
          type="button"
          onClick={handleAddToCart}
          className={`mt-3 w-full rounded-md px-3 py-2 text-xs font-semibold transition ${
            inCart
              ? "bg-gray-200 text-gray-700"
              : "bg-black text-white hover:bg-gray-800"
          }`}
        >
          {inCart ? "Added to Cart" : "Add to Cart"}
        </button>
      </div>
    </Link>
  );
}