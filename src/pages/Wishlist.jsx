import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, X, Zap } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { formatNPR } from "../utils/formatNPR";
import RecommendedSection from "../components/home/RecommendedSection";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SORT_OPTIONS = [
  { value: "newest", label: "Recently added" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

export default function Wishlist() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();

  const [selectedIds, setSelectedIds] = useState([]);
  const [sortBy, setSortBy] = useState("newest");

  const sortedWishlist = useMemo(() => {
    const items = [...wishlist];
    if (sortBy === "price-low") {
      return items.sort((a, b) => (a.priceNPR ?? 0) - (b.priceNPR ?? 0));
    }
    if (sortBy === "price-high") {
      return items.sort((a, b) => (b.priceNPR ?? 0) - (a.priceNPR ?? 0));
    }
    // newest first; items without a timestamp (added before this feature existed) sort last
    return items.sort((a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0));
  }, [wishlist, sortBy]);

  const totalValue = wishlist.reduce(
    (sum, item) => sum + (Number.isFinite(item.priceNPR) ? item.priceNPR : 0),
    0
  );

  const totalSavings = wishlist.reduce((sum, item) => {
    if (Number.isFinite(item.mrp) && item.mrp > item.priceNPR) {
      return sum + (item.mrp - item.priceNPR);
    }
    return sum;
  }, 0);

  if (wishlist.length === 0) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-16">
        <div className="mx-auto flex max-w-md flex-col items-center rounded-lg bg-gray-50 px-6 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
            <Heart className="h-7 w-7 text-gray-300" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Your wishlist is empty</h2>
          <p className="mt-2 text-sm text-gray-500">
            Tap the heart icon on any product to save it here for later.
          </p>
          <Link
            to="/home"
            className="mt-6 inline-block rounded-md bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
          >
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  const buildCartItem = (item) => ({
    id: item.id,
    name: item.name || item.title || "Untitled product",
    image: item.image,
    priceNPR: Number.isFinite(item.priceNPR) ? item.priceNPR : 0,
    mrp: item.mrp,
    discountPercent: item.discountPercent,
    stock: Number.isFinite(item.stock) ? item.stock : 50,
  });

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const allSelected = selectedIds.length > 0 && selectedIds.length === wishlist.length;

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : wishlist.map((item) => item.id));
  };

  const handleMoveAllToCart = () => {
    wishlist.forEach((item) => {
      if (!isInCart(item.id)) addToCart(buildCartItem(item));
    });
  };

  const handleAddSelectedToCart = () => {
    wishlist
      .filter((item) => selectedIds.includes(item.id))
      .forEach((item) => {
        if (!isInCart(item.id)) addToCart(buildCartItem(item));
      });
    setSelectedIds([]);
  };

  const handleRemoveSelected = () => {
    selectedIds.forEach((id) => removeFromWishlist(id));
    setSelectedIds([]);
  };

  const handleBuyNow = (item) => {
    addToCart(buildCartItem(item));
    navigate("/checkout");
  };

  const allInCart = wishlist.every((item) => isInCart(item.id));
  const hasSelection = selectedIds.length > 0;

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
          <p className="mt-1 text-sm text-gray-500">
            {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Sort by</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger size="sm" className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleMoveAllToCart} disabled={allInCart}>
            <ShoppingCart />
            Move all to cart
          </Button>
          <Button variant="outline" onClick={clearWishlist}>
            <Trash2 />
            Clear all
          </Button>
        </div>
      </div>

      {/* Bulk selection bar */}
      <div className="mb-4 flex flex-wrap  items-center justify-between gap-3 rounded-lg bg-gray-50 px-4 py-2.5">
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
          <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} />
          {hasSelection ? `${selectedIds.length} selected` : "Select all"}
        </label>

        {hasSelection && (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleAddSelectedToCart}>
              Add selected to cart
            </Button>
            <Button size="sm" variant="outline" onClick={handleRemoveSelected}>
              Remove selected
            </Button>
          </div>
        )}
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* List of items */}
        <div className="flex flex-col divide-y divide-gray-100 rounded-lg border border-gray-100 bg-white shadow-sm">
          {sortedWishlist.map((item) => {
            const inCart = isInCart(item.id);
            const selected = selectedIds.includes(item.id);
            const hasDiscount = Number.isFinite(item.mrp) && item.mrp > item.priceNPR;

            return (
              <div
                key={item.id}
                className={`group flex items-start gap-4 p-4 transition sm:gap-5 sm:p-5 ${
                  selected ? "bg-gray-50" : ""
                }`}
              >
                {/* Select checkbox */}
                <div className="mt-9 shrink-0 sm:mt-11">
                  <Checkbox
                    checked={selected}
                    onCheckedChange={() => toggleSelect(item.id)}
                    aria-label={selected ? "Deselect item" : "Select item"}
                  />
                </div>

                {/* Image */}
                <Link
                  to={`/product/${item.id}`}
                  className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-50 p-2 sm:h-28 sm:w-28"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  {item.brand && (
                    <span className="block truncate text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {item.brand}
                    </span>
                  )}
                  <Link
                    to={`/product/${item.id}`}
                    className="mt-1 block text-sm font-semibold text-gray-800 line-clamp-2 hover:underline sm:text-base"
                  >
                    {item.name || item.title || "Untitled product"}
                  </Link>

                  {Number.isFinite(item.rating) && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-yellow-500">
                      {"★".repeat(Math.round(item.rating))}
                      {"☆".repeat(5 - Math.round(item.rating))}
                      <span className="ml-1 text-gray-400">{item.rating}</span>
                    </div>
                  )}

                  <div className="mt-2 flex flex-wrap items-baseline gap-2">
                    <span className="text-base font-bold text-gray-900 sm:text-lg">
                      {Number.isFinite(item.priceNPR)
                        ? `Rs. ${formatNPR(item.priceNPR)}`
                        : "Price unavailable"}
                    </span>
                    {hasDiscount && (
                      <>
                        <span className="text-xs text-gray-400 line-through">
                          Rs. {formatNPR(item.mrp)}
                        </span>
                        {Number.isFinite(item.discountPercent) && item.discountPercent > 0 && (
                          <span className="text-xs font-semibold text-orange-600">
                            {item.discountPercent}% OFF
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <span className="mt-1 block text-xs font-medium text-green-600">In stock</span>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(item.id)}
                    aria-label={`Remove ${item.name} from wishlist`}
                    className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <Button
                    size="sm"
                    variant={inCart ? "secondary" : "default"}
                    className="w-32 sm:w-36"
                    onClick={() => addToCart(buildCartItem(item))}
                  >
                    {inCart ? "In Cart" : "Add to Cart"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-32 sm:w-36"
                    onClick={() => handleBuyNow(item)}
                  >
                    <Zap />
                    Buy Now
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block lg:sticky lg:top-6 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Wishlist Summary
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Total items</span>
                <span className="font-medium">{wishlist.length}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Total value</span>
                <span className="font-medium">
                  Rs. {formatNPR(totalValue)}
                </span>
              </div>

              {totalSavings > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">You'd save</span>
                  <span className="font-medium text-green-600">
                    Rs. {formatNPR(totalSavings)}
                  </span>
                </div>
              )}
            </div>

            <div className="my-5 border-t border-gray-200" />

            <Button
              onClick={handleMoveAllToCart}
              disabled={allInCart}
              className="w-full"
            >
              <ShoppingCart />
              Move all to cart
            </Button>
          </div>

  
        </aside>
      </div>

      {/* Full-width recommendations on smaller screens */}
      {/* Keep browsing */}
      <div className="mt-10">
        <RecommendedSection />
      </div>
    </div>
  );
}