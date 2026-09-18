import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Heart, ShoppingCart, Check, Zap } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import IconButton from "../components/shared/IconButton";

const CATEGORY_LABELS = {
  "men's clothing": "Men's Clothing",
  "women's clothing": "Women's Clothing",
  jewelery: "Jewelery",
  electronics: "Electronics",
};

const CLOTHING_CATEGORIES = ["men's clothing", "women's clothing"];
const SIZES = ["S", "M", "L", "XL", "XXL"];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setNotFound(false);
    setSelectedSize(null);

    fetch(`https://fakestoreapi.com/products/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Product not found");
        }
        return res.json();
      })
      .then((item) => {
        if (cancelled) return;

        if (!item || !item.id) {
          setNotFound(true);
          return;
        }

        const priceNPR = Math.round(item.price * 135);
        const mrp = Math.round(priceNPR * 1.3);
        const discountPercent = Math.round(
          ((mrp - priceNPR) / mrp) * 100
        );

        setProduct({
          id: item.id,
          name: item.title,
          title: item.title,
          category: item.category,
          priceNPR,
          price: priceNPR,
          mrp,
          discountPercent,
          image: item.image,
          description: item.description,
          rating: Math.round(item.rating?.rate || 4),
          reviewCount: item.rating?.count || 0,
          stock: 999,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-400">
        Loading...
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <p className="text-lg font-semibold text-gray-700">
          Product not found.
        </p>

        <button
          onClick={() => navigate(-1)}
          className="mt-4 cursor-pointer text-sm font-semibold text-red-600 hover:underline"
        >
          ← Go back
        </button>
      </div>
    );
  }

  const isClothing = CLOTHING_CATEGORIES.includes(product.category);
  const categoryLabel =
    CATEGORY_LABELS[product.category] || product.category;

  const wishlisted = isWishlisted(product.id);
  const inCart = isInCart(product.id);

  /*
   * The product object sent to CartContext.
   * This is important because CartContext expects
   * name + priceNPR + stock.
   */
  const cartProduct = {
    ...product,
    name: product.name || product.title,
    priceNPR: product.priceNPR ?? product.price ?? 0,
    stock: product.stock ?? 999,
    image: product.image,
  };

  const handleAddToCart = () => {
    if (isClothing && !selectedSize) {
      alert("Please select a size first.");
      return;
    }

    addToCart({
      ...cartProduct,
      ...(isClothing && { size: selectedSize }),
    });
  };

  const handleBuyNow = () => {
    if (isClothing && !selectedSize) {
      alert("Please select a size first.");
      return;
    }

    /*
     * Add the product to the actual cart first.
     * Then go to checkout.
     */
    addToCart({
      ...cartProduct,
      ...(isClothing && { size: selectedSize }),
    });

    navigate("/checkout");
  };

  const handleWishlist = () => {
    toggleWishlist(product);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">

      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-6 flex flex-wrap items-center gap-1">
        <Link
          to="/"
          className="hover:text-gray-800 transition"
        >
          Home
        </Link>

        <span>/</span>

        <Link
          to="/home"
          className="hover:text-gray-800 transition"
        >
          {categoryLabel}
        </Link>

        <span>/</span>

        <span className="text-gray-800 font-medium truncate max-w-xs">
          {product.title}
        </span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* ================= IMAGE ================= */}
        <div className="relative bg-gray-50 rounded-lg flex items-center justify-center p-8 h-96">
          <img
            src={product.image}
            alt={product.title}
            className="max-h-full max-w-full object-contain"
          />

          {/* Wishlist heart — overlaid on the photo, top-right */}
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
            {categoryLabel}
          </span>

          <h1 className="text-xl font-bold text-gray-900 mt-1 mb-3">
            {product.title}
          </h1>

          {/* Rating */}
          <div className="inline-flex items-center gap-1 bg-emerald-600 text-white text-xs font-semibold px-2 py-1 rounded mb-4">
            {product.rating}
            <span>★</span>

            <span className="text-white/80 font-normal ml-1">
              | {product.reviewCount} Ratings
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold text-gray-900">
              Nrs {product.priceNPR.toLocaleString()}
            </span>

            <span className="text-sm text-gray-400 line-through">
              MRP Nrs {product.mrp.toLocaleString()}
            </span>

            <span className="text-sm font-semibold text-emerald-600">
              ({product.discountPercent}% OFF)
            </span>
          </div>

          <p className="text-xs text-green-600 mb-6">
            inclusive of all taxes
          </p>

          {/* Size */}
          {isClothing && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-800 mb-2">
                Select Size
              </p>

              <div className="flex gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`w-11 h-11 rounded-full border text-xs font-semibold transition cursor-pointer ${
                      selectedSize === size
                        ? "border-red-600 bg-red-600 text-white"
                        : "border-gray-300 text-gray-700 hover:border-gray-500"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-gray-400 mt-2">
                Sizes shown for reference only — real per-size stock
                isn't tracked yet.
              </p>
            </div>
          )}

          {/* ================= ACTION BUTTONS ================= */}
          <div className="flex gap-3">

            {/* ADD TO CART */}
            <IconButton
              icon={inCart ? Check : ShoppingCart}
              variant={inCart ? "secondary" : "primary"}
              size="md"
              className="flex-1 py-3"
              onClick={handleAddToCart}
            >
              {inCart ? "Added to Cart" : "Add to Cart"}
            </IconButton>

            {/* BUY NOW */}
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
            <p className="text-sm font-semibold text-gray-800 mb-2">
              Description
            </p>

            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}