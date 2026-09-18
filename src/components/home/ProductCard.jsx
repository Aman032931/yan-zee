import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

function StarRow({ rating = 0 }) {
  const rounded = Math.round(rating);

  return (
    <div className="mt-1 flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="h-3 w-3"
          fill={i <= rounded ? "#f59e0b" : "#e5e7eb"}
          aria-hidden="true"
        >
          <path d="M12 2l2.9 6.3 6.6.8-4.9 4.6 1.3 6.5L12 17l-5.9 3.2 1.3-6.5L2.5 9.1l6.6-.8L12 2z" />
        </svg>
      ))}
      {rating ? (
        <span className="ml-1 text-[11px] text-gray-400">{rating}</span>
      ) : null}
    </div>
  );
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const wishlisted = isWishlisted(product.id);

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
      {/* ===== Badges (top-left stack) ===== */}
      <div className="absolute left-2 top-2 z-20 flex flex-col items-start gap-1">
        {product?.badge && (
          <span className="rounded bg-orange-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            {product.badge}
          </span>
        )}
        {product?.isNew && (
          <span className="rounded bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            New
          </span>
        )}
        {product?.discountPercent > 0 && (
          <span className="rounded bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            -{product.discountPercent}%
          </span>
        )}
      </div>

      {/* ===== Wishlist ===== */}
      <button
        type="button"
        onClick={handleWishlistToggle}
        className="absolute right-2 top-2 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 hover:scale-110"
        aria-label="Add to wishlist"
      >
        <svg
          className={`h-4 w-4 ${
            wishlisted
              ? "fill-red-600 text-red-600"
              : "fill-none stroke-gray-400"
          }`}
          viewBox="0 0 24 24"
          strokeWidth="2"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/*
        ===== Image + overlay =====
        This wrapper MUST keep `relative overflow-hidden` — it's the
        anchor for the Add to Cart bar and the clip boundary that
        stops it pushing card content down.
      */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-50">
        <img
          src={product?.image}
          alt={product?.title || product?.name || "Product"}
          className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
        />

        {/*
          Add to Cart bar — always reads "Add to cart," matching
          shared/ProductCard.jsx. No inCart/"Added to Cart" swap —
          that was the bug: on this card it was flipping permanently
          on click instead of staying a stateless action button.
        */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="absolute inset-x-0 bottom-0 z-10 translate-y-0 cursor-pointer border-0 bg-black py-2.5 text-[11px] font-bold uppercase tracking-widest text-white transition-transform duration-300 md:translate-y-full md:group-hover:translate-y-0 hover:bg-red-600"
        >
          Add to cart
        </button>
      </div>

      {/* ===== Info ===== */}
      <div className="flex flex-grow flex-col justify-between p-3">
        <div>
          <span className="block truncate text-[10px] font-semibold uppercase tracking-widest text-red-600">
            {product?.brand || "GENERIC"}
          </span>

          <h4 className="mt-1 line-clamp-2 min-h-[36px] text-sm font-medium text-gray-800">
            {product?.title || product?.name}
          </h4>

          <StarRow rating={product?.rating} />
        </div>

        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-sm font-bold text-gray-900">
            Nrs {(product?.priceNPR ?? product?.price ?? 0).toLocaleString()}
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
      </div>
    </Link>
  );
}