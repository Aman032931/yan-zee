import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Check } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import IconButton from "../shared/IconButton";

export default function FashionProductCard({ product }) {
  const { addToCart, isInCart } = useCart();
  const {
    toggleWishlist,
    isWishlisted: checkIsWishlisted,
  } = useWishlist();

  const inCart = isInCart(product.id);
  const wishlisted = checkIsWishlisted(product.id);

  // =========================
  // ADD TO CART
  // =========================
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      ...product,
      name: product.name || product.title,
      priceNPR: product.priceNPR ?? product.price ?? 0,
      stock: product.stock ?? 999,
    });
  };

  // =========================
  // WISHLIST
  // =========================
  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    toggleWishlist({
      ...product,
      name: product.name || product.title,
      priceNPR: product.priceNPR ?? product.price ?? 0,
      mrp: product.mrp,
      discountPercent: product.discountPercent,
      stock: product.stock ?? 999,
    });
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="w-full min-w-0 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition duration-200 flex flex-col overflow-hidden relative group"
    >
      {/* BADGE */}
      {product.badge && (
        <span className="absolute top-2 left-2 z-10 text-[10px] font-bold uppercase bg-orange-600 text-white px-2 py-0.5 rounded">
          {product.badge}
        </span>
      )}

      {/* WISHLIST BUTTON */}
      <button
        type="button"
        onClick={handleWishlistToggle}
        className={`absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur-sm rounded-full transition cursor-pointer ${
          wishlisted
            ? "text-red-500"
            : "text-gray-600 hover:text-red-500"
        }`}
        aria-label={
          wishlisted
            ? "Remove from wishlist"
            : "Add to wishlist"
        }
      >
        <Heart
          className={`w-4 h-4 ${
            wishlisted ? "fill-red-500" : ""
          }`}
        />
      </button>

      {/* PRODUCT IMAGE */}
      <div className="w-full h-56 bg-gray-50 flex items-center justify-center p-4 overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* PRODUCT DETAILS */}
      <div className="p-3 flex flex-col flex-grow justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block truncate">
            {product.category}
          </span>

          <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 mt-1 min-h-[32px]">
            {product.title}
          </h4>

          <div className="flex items-center gap-1 mt-1 text-xs">
            <span className="text-yellow-400">★</span>
            <span className="text-gray-600">
              {product.rating}
            </span>
          </div>
        </div>

        {/* PRICE + CART */}
        <div className="mt-2">
          <span className="text-sm font-bold text-gray-900 block">
            Nrs {(product.priceNPR ?? product.price)?.toLocaleString()}
          </span>

          {product.mrp && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-gray-400 line-through">
                Nrs {product.mrp.toLocaleString()}
              </span>

              {product.discountPercent > 0 && (
                <span className="text-[11px] font-semibold text-orange-600">
                  {product.discountPercent}% OFF
                </span>
              )}
            </div>
          )}

          {/* ADD TO CART */}
          <div className="mt-2 flex items-center justify-end">
            <IconButton
              icon={inCart ? Check : ShoppingCart}
              variant={inCart ? "secondary" : "primary"}
              size="sm"
              onClick={handleAddToCart}
            >
              {inCart ? "Added" : "Add to cart"}
            </IconButton>
          </div>
        </div>
      </div>
    </Link>
  );
}