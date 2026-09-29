import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  ChevronDown,
  Loader2,
  Lock,
  Tag,
  Truck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNPR } from "@/utils/formatNPR";

/**
 * OrderSummary
 *
 * items:   [{ id, name, image, price, mrp, quantity }]
 * onApplyPromo(code) -> Promise<{ ok: boolean, error?: string }>
 *          (parent validates the code and updates discountNPR / appliedCode)
 * children: optional slot for the primary action, e.g. a "Place order" button
 */
export default function OrderSummary({
  items = [],
  subtotalNPR = 0,
  shippingNPR = 0,
  discountNPR = 0,
  totalNPR = 0,
  freeShippingThresholdNPR = 3000,
  appliedCode = null,
  suggestedCode = "YANZEE10",
  onApplyPromo,
  onRemovePromo,
  editHref = "/cart",
  children,
}) {
  const [itemsOpen, setItemsOpen] = useState(false); // mobile only
  const [promoOpen, setPromoOpen] = useState(false);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [error, setError] = useState("");

  const itemCount = items.reduce((n, i) => n + Number(i.quantity ?? 1), 0);

  const itemSavings = items.reduce((sum, item) => {
    const price = Number(item.price ?? 0);
    const mrp = Number(item.mrp ?? 0);
    const qty = Number(item.quantity ?? 1);
    return Number.isFinite(mrp) && mrp > price ? sum + (mrp - price) * qty : sum;
  }, 0);

  const totalSavings = itemSavings + discountNPR;

  const isFreeShipping = shippingNPR === 0;
  const remainingForFree = Math.max(0, freeShippingThresholdNPR - subtotalNPR);
  const shippingProgress = Math.min(
    100,
    (subtotalNPR / freeShippingThresholdNPR) * 100
  );

  const submitPromo = async (e) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed || status === "loading") return;

    setStatus("loading");
    setError("");

    try {
      const result = await onApplyPromo?.(trimmed);
      if (result?.ok) {
        setCode("");
        setPromoOpen(false);
        setStatus("idle");
      } else {
        setError(result?.error || "That code isn't valid. Check it and try again.");
        setStatus("error");
      }
    } catch {
      setError("Couldn't check the code. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      {/* Heading (tap to expand items on mobile) */}
      <button
        type="button"
        onClick={() => setItemsOpen((o) => !o)}
        aria-expanded={itemsOpen}
        className="flex w-full items-center justify-between text-left lg:pointer-events-none"
      >
        <span>
          <span className="block text-lg font-semibold text-gray-900">
            Order summary
          </span>
          <span className="block text-xs text-gray-500">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        </span>

        <span className="flex items-center gap-2 lg:hidden">
          <span className="text-sm font-semibold text-gray-900">
            Rs. {formatNPR(totalNPR)}
          </span>
          <ChevronDown
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-gray-500"
            style={{
              transform: itemsOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 200ms ease",
            }}
          />
        </span>
      </button>

      {/* Items */}
      <div className={`${itemsOpen ? "block" : "hidden"} lg:block`}>
        <ul className="mt-4 max-h-72 space-y-4 overflow-y-auto pr-1 pt-2">
          {items.map((item) => {
            const price = Number(item.price ?? 0);
            const mrp = Number(item.mrp ?? 0);
            const qty = Number(item.quantity ?? 1);
            const hasDiscount = Number.isFinite(mrp) && mrp > price;
            const pct = hasDiscount
              ? Math.round(((mrp - price) / mrp) * 100)
              : 0;

            return (
              <li key={item.id} className="flex gap-3">
                <div className="relative h-16 w-16 shrink-0 rounded-md bg-gray-50 p-1.5">
                  <img
                    src={item.image}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                  {/* Quantity badge */}
                  <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-gray-900 px-1 text-[10px] font-semibold text-white">
                    {qty}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium text-gray-900">
                    {item.name}
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Qty {qty} · Rs. {formatNPR(price)}
                    {qty > 1 ? " each" : ""}
                  </p>

                  {hasDiscount && (
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs">
                      <span className="text-gray-400 line-through">
                        Rs. {formatNPR(mrp * qty)}
                      </span>
                      <span className="font-semibold text-orange-600">
                        {pct}% OFF
                      </span>
                    </p>
                  )}
                </div>

                <span className="shrink-0 text-sm font-semibold text-gray-900">
                  Rs. {formatNPR(price * qty)}
                </span>
              </li>
            );
          })}
        </ul>

        <Link
          to={editHref}
          className="mt-3 inline-block text-xs font-medium text-gray-600 underline underline-offset-4 hover:text-black"
        >
          Edit bag
        </Link>
      </div>

      <div className="my-5 border-t border-gray-200" />

      {/* Promo code */}
      {appliedCode ? (
        <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2.5 text-sm">
          <span className="flex items-center gap-2 font-medium text-green-700">
            <Check className="h-4 w-4" />
            <span>
              <span className="font-semibold">{appliedCode}</span> applied
            </span>
          </span>

          <button
            type="button"
            onClick={onRemovePromo}
            className="flex items-center gap-1 text-xs font-medium text-green-700 hover:underline"
          >
            <X className="h-3.5 w-3.5" />
            Remove
          </button>
        </div>
      ) : !promoOpen ? (
        <button
          type="button"
          onClick={() => setPromoOpen(true)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black"
        >
          <Tag className="h-4 w-4" />
          Have a promo code?
        </button>
      ) : (
        <form onSubmit={submitPromo} noValidate>
          <label
            htmlFor="promo-code"
            className="mb-1.5 block text-xs font-medium text-gray-600"
          >
            Promo code
          </label>

          <div className="flex gap-2">
            <input
              id="promo-code"
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                if (status === "error") {
                  setStatus("idle");
                  setError("");
                }
              }}
              autoFocus
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="Enter code"
              aria-invalid={status === "error"}
              aria-describedby={status === "error" ? "promo-error" : undefined}
              className={`h-10 min-w-0 flex-1 rounded-md border bg-white px-3 text-sm uppercase tracking-wide outline-none transition placeholder:normal-case placeholder:tracking-normal placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/10 ${
                status === "error"
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-300 focus:border-gray-900"
              }`}
            />

            <Button
              type="submit"
              disabled={!code.trim() || status === "loading"}
              className="h-10 px-5"
            >
              {status === "loading" ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Apply"
              )}
            </Button>
          </div>

          {status === "error" && (
            <p id="promo-error" role="alert" className="mt-1.5 text-xs text-red-600">
              {error}
            </p>
          )}

          {suggestedCode && !code && (
            <button
              type="button"
              onClick={() => setCode(suggestedCode)}
              className="mt-2 rounded-full border border-dashed border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:border-gray-900 hover:text-black"
            >
              Use {suggestedCode}
            </button>
          )}
        </form>
      )}

      <div className="my-5 border-t border-gray-200" />

      {/* Totals */}
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-500">Subtotal</dt>
          <dd className="font-medium text-gray-900">
            Rs. {formatNPR(subtotalNPR)}
          </dd>
        </div>

        {discountNPR > 0 && (
          <div className="flex justify-between">
            <dt className="text-gray-500">
              Promo discount{appliedCode ? ` (${appliedCode})` : ""}
            </dt>
            <dd className="font-medium text-green-600">
              − Rs. {formatNPR(discountNPR)}
            </dd>
          </div>
        )}

        <div className="flex justify-between">
          <dt className="text-gray-500">Shipping</dt>
          <dd
            className={`font-medium ${
              isFreeShipping ? "text-green-600" : "text-gray-900"
            }`}
          >
            {isFreeShipping ? "FREE" : `Rs. ${formatNPR(shippingNPR)}`}
          </dd>
        </div>
      </dl>

      {/* Free-shipping progress */}
      {isFreeShipping ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
          <Truck className="h-4 w-4" />
          You've unlocked free shipping.
        </div>
      ) : (
        <div className="mt-4 rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-600">
            Add <strong>Rs. {formatNPR(remainingForFree)}</strong> more to get
            free shipping.
          </p>
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(shippingProgress)}
            aria-label="Progress towards free shipping"
          >
            <div
              className="h-full rounded-full bg-gray-900 transition-all"
              style={{ width: `${shippingProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="my-5 border-t border-gray-200" />

      {/* Grand total */}
      <div className="flex items-end justify-between">
        <span className="text-base font-medium text-gray-900">Total</span>
        <span className="text-2xl font-semibold text-gray-900">
          Rs. {formatNPR(totalNPR)}
        </span>
      </div>

      {totalSavings > 0 && (
        <p className="mt-1.5 text-right text-xs font-medium text-green-600">
          You're saving Rs. {formatNPR(totalSavings)} on this order
        </p>
      )}

      {children && <div className="mt-5">{children}</div>}

      <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
        <Lock className="h-3 w-3" />
        Secure checkout
      </p>
    </div>
  );
}