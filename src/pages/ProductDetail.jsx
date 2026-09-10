import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useProductContext } from "../context/ProductContext";
import { useWishlist } from "../context/WishlistContext";

const formatNPR = (amount) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount);

const categoryLabel = (category = "") => {
  const labels = {
    "women's clothing": "Women",
    "men's clothing": "Men",
    jewelery: "Accessories",
    electronics: "Lifestyle",
  };
  return labels[category.toLowerCase()] || "Yanzee";
};

const subcategoryLabel = (category = "") => {
  const labels = {
    "women's clothing": "Clothing",
    "men's clothing": "Clothing",
    jewelery: "Jewellery & Accessories",
    electronics: "Home & Lifestyle",
  };
  return labels[category.toLowerCase()] || "Collection";
};

export default function ProductDetail() {
  const { id } = useParams();
  const { products, loading } = useProductContext();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);

  const product = products.find((item) => String(item.id) === String(id));

  const gallery = useMemo(() => {
    if (!product?.image) return [];
    return [product.image];
  }, [product]);

  const priceNPR = product ? Math.round(product.price * 135) : 0;
  const originalPrice = Math.round(priceNPR * 1.25);
  const discount = Math.round(((originalPrice - priceNPR) / originalPrice) * 100);
  const wishlisted = product ? isWishlisted(product.id) : false;

  const addProductToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.title,
      image: product.image,
      priceNPR,
      stock: 999,
      category: product.category,
    }, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const toggleProductWishlist = () => {
    if (!product) return;
    toggleWishlist({
      id: product.id,
      name: product.title,
      image: product.image,
      priceNPR,
      brand: product.category,
    });
  };

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-24 text-center text-sm text-gray-500">Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Product not found</h1>
        <p className="mt-2 text-sm text-gray-500">The product may have been removed or is no longer available.</p>
        <Link to="/all" className="mt-6 inline-flex items-center gap-2 rounded-md bg-black px-5 py-3 text-sm font-semibold text-white">
          <ArrowLeft className="h-4 w-4" /> Back to shopping
        </Link>
      </div>
    );
  }

  const related = products
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1 text-xs text-gray-500">
          <Link to="/" className="hover:text-black">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/all" className="hover:text-black">{categoryLabel(product.category)}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate text-gray-900">{product.title}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          {/* Gallery */}
          <div className="grid gap-4 sm:grid-cols-[88px_1fr]">
            <div className="order-2 flex gap-3 sm:order-1 sm:flex-col">
              {gallery.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`h-20 w-20 overflow-hidden rounded-lg border bg-gray-50 p-2 transition ${selectedImage === index ? "border-black" : "border-gray-200 hover:border-gray-400"}`}
                >
                  <img src={image} alt={`${product.title} thumbnail`} className="h-full w-full object-contain" />
                </button>
              ))}
            </div>

            <div className="order-1 flex min-h-[520px] items-center justify-center rounded-xl bg-gray-50 p-8 sm:order-2">
              <img
                src={gallery[selectedImage]}
                alt={product.title}
                className="max-h-[540px] w-full object-contain mix-blend-multiply transition duration-300"
              />
            </div>
          </div>

          {/* Product info */}
          <section className="flex flex-col">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
              <span>{subcategoryLabel(product.category)}</span>
              {product.rating?.rate && (
                <span className="rounded-full bg-gray-100 px-2 py-1 normal-case tracking-normal text-gray-700">
                  ★ {product.rating.rate} · {product.rating.count || 0} reviews
                </span>
              )}
            </div>

            <h1 className="max-w-xl text-2xl font-semibold leading-tight text-gray-950 sm:text-3xl">{product.title}</h1>

            <div className="mt-5 flex items-end gap-3">
              <span className="text-2xl font-semibold text-gray-950">Rs. {formatNPR(priceNPR)}</span>
              <span className="text-sm text-gray-400 line-through">Rs. {formatNPR(originalPrice)}</span>
              <span className="rounded bg-red-50 px-2 py-1 text-xs font-bold text-red-600">{discount}% OFF</span>
            </div>

            <div className="mt-6 border-y border-gray-200 py-5">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <Check className="h-4 w-4" /> In stock
              </div>
              <p className="mt-1 text-xs text-gray-500">Ready to ship from Yanzee.</p>
            </div>

            {/* Fashion-friendly selectors. They remain optional for generic products. */}
            {(product.category === "women's clothing" || product.category === "men's clothing") && (
              <div className="mt-6 space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-semibold">Select size</label>
                    <button type="button" className="text-xs font-medium underline underline-offset-4">Size guide</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["XS", "S", "M", "L", "XL"].map((size, index) => (
                      <button key={size} type="button" className={`h-10 min-w-12 rounded-md border px-4 text-xs font-medium transition ${index === 2 ? "border-black bg-black text-white" : "border-gray-300 hover:border-black"}`}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <span className="mb-2 block text-sm font-semibold">Quantity</span>
              <div className="flex h-11 w-fit items-center rounded-md border border-gray-300">
                <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="grid h-full w-11 place-items-center hover:bg-gray-50" aria-label="Decrease quantity">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                <button type="button" onClick={() => setQuantity((q) => Math.min(10, q + 1))} className="grid h-full w-11 place-items-center hover:bg-gray-50" aria-label="Increase quantity">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_52px]">
              <button
                type="button"
                onClick={addProductToCart}
                className="flex h-12 items-center justify-center gap-2 rounded-md bg-black px-6 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                <ShoppingBag className="h-4 w-4" />
                {added ? "Added to Bag" : "Add to Bag"}
              </button>
              <button
                type="button"
                onClick={toggleProductWishlist}
                className={`grid h-12 place-items-center rounded-md border transition ${wishlisted ? "border-black bg-black text-white" : "border-gray-300 hover:border-black"}`}
                aria-label="Add to wishlist"
              >
                <Heart className={`h-5 w-5 ${wishlisted ? "fill-current" : ""}`} />
              </button>
            </div>

            <div className="mt-3">
              <Link to="/cart" className="flex h-12 items-center justify-center rounded-md border border-black text-sm font-semibold hover:bg-gray-50">
                View Bag
              </Link>
            </div>

            <div className="mt-8 divide-y rounded-xl border border-gray-200">
              <div className="flex gap-3 p-4">
                <Truck className="mt-0.5 h-5 w-5 shrink-0" />
                <div><p className="text-sm font-semibold">Free shipping over Rs. 3,000</p><p className="mt-1 text-xs text-gray-500">Fast delivery across Nepal.</p></div>
              </div>
              <div className="flex gap-3 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
                <div><p className="text-sm font-semibold">Authentic Yanzee products</p><p className="mt-1 text-xs text-gray-500">Secure shopping and reliable support.</p></div>
              </div>
            </div>
          </section>
        </div>

        {/* Details */}
        <section className="mt-16 border-t border-gray-200 pt-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
            <div>
              <h2 className="text-xl font-semibold">Product details</h2>
              <p className="mt-4 text-sm leading-7 text-gray-600">{product.description || "A carefully selected Yanzee product made for everyday style and comfort."}</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Product information</h2>
              <dl className="mt-4 divide-y border-y border-gray-200 text-sm">
                <div className="flex justify-between gap-6 py-3"><dt className="text-gray-500">Category</dt><dd className="font-medium capitalize">{product.category}</dd></div>
                <div className="flex justify-between gap-6 py-3"><dt className="text-gray-500">Collection</dt><dd className="font-medium">{categoryLabel(product.category)}</dd></div>
                <div className="flex justify-between gap-6 py-3"><dt className="text-gray-500">Availability</dt><dd className="font-medium text-green-700">In stock</dd></div>
              </dl>
            </div>
          </div>
        </section>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-gray-200 pt-10 pb-12">
            <div className="mb-5 flex items-end justify-between">
              <div><h2 className="text-xl font-semibold">You may also like</h2><p className="mt-1 text-sm text-gray-500">More from this collection.</p></div>
              <Link to="/all" className="text-xs font-semibold underline underline-offset-4">View all</Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {related.map((item) => {
                const relatedPrice = Math.round(item.price * 135);
                return (
                  <Link key={item.id} to={`/product/${item.id}`} className="group overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <div className="aspect-[4/5] bg-gray-50 p-5"><img src={item.image} alt={item.title} className="h-full w-full object-contain transition duration-300 group-hover:scale-105" /></div>
                    <div className="p-3"><p className="line-clamp-2 min-h-9 text-xs font-medium text-gray-800">{item.title}</p><p className="mt-2 text-sm font-bold">Rs. {formatNPR(relatedPrice)}</p></div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
