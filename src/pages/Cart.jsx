import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { formatNPR } from "../utils/formatNPR";
import PageNavigation from "../components/shared/PageNavigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

// Keep in sync with the rule in CartContext (ideally export it from there).
const FREE_SHIPPING_THRESHOLD_NPR = 3000;

export default function Cart() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    subtotalNPR,
    shippingNPR,
    grandTotalNPR,
    isFreeShipping,
  } = useCart();

  const { saveForLater } = useWishlist();

  const [selectedIds, setSelectedIds] = useState([]);

  const getPrice = (item) => Number(item.price ?? item.priceNPR ?? 0);

  // Ignore ids of items that were removed by other means
  const validSelected = selectedIds.filter((id) =>
    cart.some((item) => item.id === id)
  );
  const allSelected = cart.length > 0 && validSelected.length === cart.length;
  const hasSelection = validSelected.length > 0;

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : cart.map((item) => item.id));
  };

  const handleRemoveSelected = () => {
    validSelected.forEach((id) => removeFromCart(id));
    setSelectedIds([]);
  };

  const handleSaveSelectedForLater = () => {
    cart
      .filter((item) => validSelected.includes(item.id))
      .forEach((item) => {
        saveForLater(item);
        removeFromCart(item.id);
      });
    setSelectedIds([]);
  };

  // Move product from Cart -> Wishlist
  const handleSaveForLater = (item) => {
    saveForLater(item);
    removeFromCart(item.id);
  };

  const totalSavingsNPR = cart.reduce((sum, item) => {
    const price = getPrice(item);
    const mrp = Number(item.mrp ?? 0);
    const quantity = Number(item.quantity ?? 1);

    if (Number.isFinite(mrp) && mrp > price) {
      return sum + (mrp - price) * quantity;
    }

    return sum;
  }, 0);

  /* ---------------------------------- Empty --------------------------------- */
  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-16">
        <div className="mx-auto flex max-w-md flex-col items-center rounded-lg bg-gray-50 px-6 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
            <ShoppingBag className="h-7 w-7 text-gray-300" />
          </div>

          <h2 className="text-xl font-semibold text-gray-900">
            Your bag is empty
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Discover new styles and home essentials from the YanZee collection.
          </p>

          <Link
            to="/home"
            className="mt-6 inline-block rounded-md bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  /* ---------------------------------- Page ---------------------------------- */
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8">
      <PageNavigation />

      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shopping Bag</h1>

          <p className="mt-1 text-sm text-gray-500">
            {cart.length} {cart.length === 1 ? "product" : "products"} ·{" "}
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" asChild>
            <Link to="/home">Continue shopping</Link>
          </Button>

          <Button variant="outline" onClick={clearCart}>
            <Trash2 />
            Clear all
          </Button>
        </div>
      </div>

      {/* Bulk selection bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-gray-50 px-4 py-2.5">
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
          <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} />

          {hasSelection ? `${validSelected.length} selected` : "Select all"}
        </label>

        {hasSelection && (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleSaveSelectedForLater}>
              <Heart />
              Save selected for later
            </Button>

            <Button size="sm" variant="outline" onClick={handleRemoveSelected}>
              Remove selected
            </Button>
          </div>
        )}
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* List */}
        <div className="flex flex-col divide-y divide-gray-100 rounded-lg border border-gray-100 bg-white shadow-sm">
          {cart.map((item) => {
            const selected = validSelected.includes(item.id);

            const price = getPrice(item);
            const quantity = Number(item.quantity ?? 1);
            const mrp = Number(item.mrp ?? 0);
            const title = item.name || item.title || "Untitled product";
            const stock = Number.isFinite(item.stock) ? item.stock : null;

            const hasDiscount = Number.isFinite(mrp) && mrp > price;

            const discount =
              Number.isFinite(item.discountPercent) && item.discountPercent > 0
                ? item.discountPercent
                : hasDiscount
                  ? Math.round(((mrp - price) / mrp) * 100)
                  : 0;

            return (
              <div
                key={item.id}
                className={`group flex items-start gap-4 p-4 transition sm:gap-5 sm:p-5 ${
                  selected ? "bg-gray-50" : ""
                }`}
              >
                {/* Checkbox */}
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
                    alt={title}
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
                    className="mt-1 block line-clamp-2 text-sm font-semibold text-gray-800 hover:underline sm:text-base"
                  >
                    {title}
                  </Link>

                  {(item.size || item.color) && (
                    <p className="mt-1 text-xs text-gray-500">
                      {item.size && <>Size: {item.size}</>}
                      {item.size && item.color && " · "}
                      {item.color && <>Color: {item.color}</>}
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap items-baseline gap-2">
                    <span className="text-base font-bold text-gray-900 sm:text-lg">
                      Rs. {formatNPR(price)}
                    </span>

                    {hasDiscount && (
                      <>
                        <span className="text-xs text-gray-400 line-through">
                          Rs. {formatNPR(mrp)}
                        </span>

                        {discount > 0 && (
                          <span className="text-xs font-semibold text-orange-600">
                            {discount}% OFF
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {stock !== null && stock <= 5 ? (
                    <span className="mt-1 block text-xs font-medium text-orange-600">
                      Only {stock} left
                    </span>
                  ) : (
                    <span className="mt-1 block text-xs font-medium text-green-600">
                      In stock
                    </span>
                  )}

                  {/* Quantity */}
                  <div className="mt-3 flex h-9 w-fit items-center rounded-md border border-gray-300 bg-white">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, quantity - 1)}
                      className="grid h-full w-9 place-items-center hover:bg-gray-50"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>

                    <span className="w-9 text-center text-sm font-medium">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, quantity + 1)}
                      disabled={quantity >= (item.stock ?? 999)}
                      className="grid h-full w-9 place-items-center hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Remove ${title} from bag`}
                    className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="text-right">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Item total
                    </span>

                    <span className="text-base font-bold text-gray-900">
                      Rs. {formatNPR(price * quantity)}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-32 sm:w-36"
                    onClick={() => handleSaveForLater(item)}
                  >
                    <Heart />
                    Save for later
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Order Summary
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>

                <span className="font-medium">
                  Rs. {formatNPR(subtotalNPR)}
                </span>
              </div>

              {totalSavingsNPR > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">You save</span>

                  <span className="font-medium text-green-600">
                    Rs. {formatNPR(totalSavingsNPR)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>

                <span
                  className={`font-medium ${
                    isFreeShipping ? "text-green-600" : "text-gray-900"
                  }`}
                >
                  {shippingNPR === 0 ? "FREE" : `Rs. ${formatNPR(shippingNPR)}`}
                </span>
              </div>
            </div>

            {isFreeShipping ? (
              <div className="mt-5 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-xs font-medium text-green-700">
                <Truck className="h-4 w-4" />
                You unlocked free shipping.
              </div>
            ) : (
              <div className="mt-5 rounded-lg bg-gray-50 p-3 text-xs leading-5 text-gray-600">
                Add{" "}
                <strong>
                  Rs.{" "}
                  {formatNPR(
                    Math.max(0, FREE_SHIPPING_THRESHOLD_NPR - subtotalNPR)
                  )}
                </strong>{" "}
                more to unlock free shipping.
              </div>
            )}

            <div className="my-5 border-t border-gray-200" />

            <div className="flex items-end justify-between">
              <span className="text-base font-medium">Total</span>

              <span className="text-xl font-semibold">
                Rs. {formatNPR(grandTotalNPR)}
              </span>
            </div>

            <Button asChild className="mt-5 w-full">
              <Link to="/checkout">
                <ShoppingCart />
                Proceed to Checkout
              </Link>
            </Button>

            <p className="mt-3 text-center text-[11px] text-gray-500">
              Secure checkout · Free shipping over Rs.{" "}
              {formatNPR(FREE_SHIPPING_THRESHOLD_NPR)}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}