import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, X } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { formatNPR } from "./Cart";

export default function Wishlist() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="mx-auto max-w-1440px px-4 py-16">
        <div className="mx-auto flex max-w-md flex-col items-center rounded-lg bg-gray-50 px-6 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
            <Heart className="h-7 w-7 text-gray-300" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Your wishlist is empty</h2>
          <p className="mt-2 text-sm text-gray-500">
            Tap the heart icon on any product to save it here for later.
          </p>
          <Link
            to="/all"
            className="mt-6 inline-block rounded-md bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
          >
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  const handleMoveAllToCart = () => {
    wishlist.forEach((item) => {
      if (!isInCart(item.id)) {
        addToCart({
          id: item.id,
          name: item.name,
          image: item.image,
          priceNPR: item.priceNPR,
          stock: 50,
        });
      }
    });
  };

  const allInCart = wishlist.every((item) => isInCart(item.id));

  return (
    <div className="mx-auto max-w-1440px px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
          <p className="mt-1 text-sm text-gray-500">
            {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleMoveAllToCart}
            disabled={allInCart}
            className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <ShoppingCart className="h-4 w-4" />
            Move all to cart
          </button>
          <button
            type="button"
            onClick={clearWishlist}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            <Trash2 className="h-4 w-4" />
            Clear all
          </button>
        </div>
      </div>

      {/* Grid of items */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {wishlist.map((item) => {
          const inCart = isInCart(item.id);
          return (
            <div
              key={item.id}
              className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition duration-200 hover:shadow-md"
            >
              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeFromWishlist(item.id)}
                aria-label={`Remove ${item.name} from wishlist`}
                className="absolute top-2 right-2 z-10 rounded-full bg-white/80 p-1.5 text-gray-500 backdrop-blur-sm transition hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Image */}
              <Link
                to={`/product/${item.id}`}
                className="flex h-40 w-full items-center justify-center overflow-hidden bg-gray-50 p-4"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </Link>

              {/* Details */}
              <div className="flex flex-grow flex-col justify-between p-3">
                <div>
                  {item.brand && (
                    <span className="block truncate text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {item.brand}
                    </span>
                  )}
                  <Link
                    to={`/product/${item.id}`}
                    className="mt-1 block min-h-[32px] text-xs font-semibold text-gray-800 line-clamp-2 hover:underline"
                  >
                    {item.name}
                  </Link>
                </div>

                <div className="mt-2">
                  <span className="block text-sm font-bold text-gray-900">
                    Rs. {formatNPR(item.priceNPR)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      addToCart({
                        id: item.id,
                        name: item.name,
                        image: item.image,
                        priceNPR: item.priceNPR,
                        stock: 50,
                      })
                    }
                    className={`mt-2 w-full rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition ${
                      inCart
                        ? "border border-gray-300 bg-gray-100 text-gray-900"
                        : "bg-gray-900 text-white hover:bg-black"
                    }`}
                  >
                    {inCart ? "In Cart" : "Add to Cart"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}