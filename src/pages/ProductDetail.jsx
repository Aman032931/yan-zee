import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Heart, ShoppingCart, Check, Zap } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useProducts } from "../context/useProducts";
import IconButton from "../components/shared/IconButton";
import { useToast } from "../context/ToastContext";

const CATEGORY_ROUTES = {
  fashion: "/fashion",
  sports: "/sports",
  kids: "/kids",
  beauty: "/beauty",
  outlet: "/outlet",
  premium: "/premium",
  "home-decor": "/home-decor",
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { showToast } = useToast();
  const { products, loading } = useProducts();

  // remembers which product the size belongs to, so it resets when the id changes
  const [selection, setSelection] = useState({ productId: null, size: null });
  const selectedSize = selection.productId === id ? selection.size : null;

  const product = products.find((p) => String(p.id) === id);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-400">
        Loading...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <p className="text-lg font-semibold text-gray-700">Product not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 cursor-pointer text-sm font-semibold text-red-600 hover:underline"
        >
          ← Go back
        </button>
      </div>
    );
  }

  const variants = product.variants;
  const hasSizes = variants.length > 0;
  const selectedVariant = variants.find((v) => v.size === selectedSize);
  const outOfStock = product.stock <= 0;

  const wishlisted = isWishlisted(product.id);
  const inCart = isInCart(product.id);

  // CartContext expects name + priceNPR + stock
  const cartProduct = {
    ...product,
    name: product.title,
    priceNPR: product.price,
    stock: selectedVariant?.stock ?? product.stock,
  };

  const addCurrentToCart = () => {
    if (outOfStock) {
      showToast("This product is out of stock");
      return false;
    }
    if (hasSizes && !selectedSize) {
      alert("Please select a size first.");
      return false;
    }
    addToCart({ ...cartProduct, ...(hasSizes && { size: selectedSize }) });
    return true;
  };

  const handleAddToCart = () => {
    if (addCurrentToCart()) showToast("Added to cart");
  };

  const handleBuyNow = () => {
    if (addCurrentToCart()) navigate("/checkout");
  };

  const handleWishlist = () => {
    const wasWishlisted = wishlisted;
    toggleWishlist(product);
    showToast(wasWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-6 flex flex-wrap items-center gap-1">
        <Link to="/" className="hover:text-gray-800 transition">Home</Link>
        <span>/</span>
        <Link
          to={CATEGORY_ROUTES[product.category] || "/home"}
          className="hover:text-gray-800 transition capitalize"
        >
          {product.brand.toLowerCase()}
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium truncate max-w-xs">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* ================= IMAGE ================= */}
        <div className="relative bg-gray-50 rounded-lg flex items-center justify-center p-8 h-96">
          <img
            src={product.image}
            alt={product.title}
            className="max-h-full max-w-full object-contain"
          />
          <button
            type="button"
            onClick={handleWishlist}
            className="absolute right-4 top-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 hover:scale-110"
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`h-4 w-4 ${
                wishlisted ? "fill-red-600 text-red-600" : "fill-none text-gray-400"
              }`}
            />
          </button>
        </div>

        {/* ================= DETAILS ================= */}
        <div>
          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
            {product.brand}
          </span>

          <h1 className="text-xl font-bold text-gray-900 mt-1 mb-3">{product.title}</h1>

          {product.rating > 0 && (
            <div className="inline-flex items-center gap-1 bg-emerald-600 text-white text-xs font-semibold px-2 py-1 rounded mb-4">
              {product.rating}
              <span>★</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold text-gray-900">
              Nrs {product.price.toLocaleString()}
            </span>
            {product.mrp && (
              <>
                <span className="text-sm text-gray-400 line-through">
                  MRP Nrs {product.mrp.toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-emerald-600">
                  ({product.discountPercent}% OFF)
                </span>
              </>
            )}
          </div>

          <p className="text-xs text-green-600 mb-6">inclusive of all taxes</p>

          {/* Sizes (real variants) */}
          {hasSizes && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-800 mb-2">Select Size</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => {
                  const soldOut = v.stock <= 0;
                  return (
                    <button
                      key={v.id ?? v.size}
                      type="button"
                      disabled={soldOut}
                      onClick={() => setSelection({ productId: id, size: v.size })}
                      className={`h-11 min-w-11 rounded-full border px-3 text-xs font-semibold transition cursor-pointer ${
                        selectedSize === v.size
                          ? "border-red-600 bg-red-600 text-white"
                          : soldOut
                            ? "cursor-not-allowed border-gray-200 text-gray-300 line-through"
                            : "border-gray-300 text-gray-700 hover:border-gray-500"
                      }`}
                    >
                      {v.size}
                    </button>
                  );
                })}
              </div>
              {selectedVariant && (
                <p className="text-[11px] text-gray-500 mt-2">
                  {selectedVariant.stock} in stock
                </p>
              )}
            </div>
          )}

          {/* ================= ACTION BUTTONS ================= */}
          <div className="flex gap-3">
            <IconButton
              icon={inCart ? Check : ShoppingCart}
              variant={inCart ? "secondary" : "primary"}
              size="md"
              className="flex-1 py-3"
              onClick={handleAddToCart}
            >
              {inCart ? "Added to Cart" : "Add to Cart"}
            </IconButton>

            <IconButton
              icon={Zap}
              variant="outline"
              size="md"
              className="flex-1 py-3"
              onClick={handleBuyNow}
            >
              Buy Now
            </IconButton>
          </div>

          {/* Description */}
          <div className="border-t border-gray-100 pt-5 mt-6">
            <p className="text-sm font-semibold text-gray-800 mb-2">Description</p>
            {product.description ? (
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            ) : (
              <p className="text-sm text-gray-400">No description yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}