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
      className="w-full min-w-0 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition duration-200 flex flex-col overflow-hidden relative group"
    >
      {/* Top Badge */}
      {product?.badge && (
        <span className="absolute top-2 left-2 z-10 text-[10px] font-bold uppercase bg-orange-600 text-white px-2 py-0.5 rounded">
          {product.badge}
        </span>
      )}

      {/* Wishlist Button */}
      <button
        type="button"
        onClick={handleWishlistToggle}
        className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-gray-600 hover:text-red-500 transition cursor-pointer"
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

      {/* Product Image */}
      <div className="w-full h-48 bg-gray-50 flex items-center justify-center p-4 overflow-hidden">
        <img
          src={product?.image}
          alt={product?.title || product?.name || "Product"}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Product Details */}
      <div className="p-3 flex flex-col flex-grow justify-between">
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