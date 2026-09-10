import { Link } from "react-router-dom";
import { ArrowLeft, Heart, Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import { useCart } from "../context/CartContext";

export const formatNPR = (amount) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount);

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

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex min-h-[500px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 px-6 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-white shadow-sm"><ShoppingBag className="h-7 w-7" /></div>
          <h1 className="mt-5 text-2xl font-semibold">Your bag is empty</h1>
          <p className="mt-2 max-w-md text-sm text-gray-500">Discover new styles and home essentials from the Yanzee collection.</p>
          <Link to="/all" className="mt-6 inline-flex items-center gap-2 rounded-md bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-2 border-b border-gray-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-950">Shopping Bag</h1>
            <p className="mt-1 text-sm text-gray-500">{cart.length} product{cart.length !== 1 ? "s" : ""} · {totalItems} item{totalItems !== 1 ? "s" : ""}</p>
          </div>
          <Link to="/all" className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black"><ArrowLeft className="h-4 w-4" /> Continue shopping</Link>
        </div>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_370px]">
          <div className="space-y-4">
            {cart.map((item) => (
              <article key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 transition hover:border-gray-300 sm:p-5">
                <div className="flex gap-4 sm:gap-5">
                  <Link to={`/product/${item.id}`} className="h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-50 sm:h-36 sm:w-32">
                    <img src={item.image} alt={item.name} className="h-full w-full object-contain p-3 transition duration-300 hover:scale-105" />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link to={`/product/${item.id}`} className="line-clamp-2 text-sm font-semibold text-gray-900 hover:underline sm:text-base">{item.name}</Link>
                        <p className="mt-1 text-sm text-gray-500">Rs. {formatNPR(item.priceNPR)}</p>
                        {item.size && <p className="mt-1 text-xs text-gray-500">Size: {item.size}</p>}
                        {item.color && <p className="text-xs text-gray-500">Color: {item.color}</p>}
                      </div>
                      <button type="button" onClick={() => removeFromCart(item.id)} className="shrink-0 text-gray-400 hover:text-red-500" aria-label={`Remove ${item.name}`}><Trash2 className="h-4 w-4" /></button>
                    </div>

                    <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                      <div>
                        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Quantity</span>
                        <div className="flex h-9 w-fit items-center rounded-md border border-gray-300">
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="grid h-full w-9 place-items-center hover:bg-gray-50" aria-label="Decrease quantity"><Minus className="h-3.5 w-3.5" /></button>
                          <span className="w-9 text-center text-sm font-medium">{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock} className="grid h-full w-9 place-items-center hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30" aria-label="Increase quantity"><Plus className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                      <div className="text-right"><span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Item total</span><span className="text-base font-semibold">Rs. {formatNPR(item.priceNPR * item.quantity)}</span></div>
                    </div>

                    <div className="mt-4 flex gap-4 text-xs text-gray-500"><button type="button" className="inline-flex items-center gap-1 hover:text-black"><Heart className="h-3.5 w-3.5" /> Save for later</button><button type="button" onClick={() => removeFromCart(item.id)} className="hover:text-red-600">Remove</button></div>
                  </div>
                </div>
              </article>
            ))}

            <button type="button" onClick={clearCart} className="text-xs font-medium text-gray-500 underline underline-offset-4 hover:text-red-600">Clear bag</button>
          </div>

          <aside className="lg:sticky lg:top-6">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold">Order summary</h2>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-medium">Rs. {formatNPR(subtotalNPR)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className={`font-medium ${isFreeShipping ? "text-green-600" : "text-gray-900"}`}>{shippingNPR === 0 ? "FREE" : `Rs. ${formatNPR(shippingNPR)}`}</span></div>
              </div>

              {!isFreeShipping && <div className="mt-5 rounded-lg bg-gray-50 p-3 text-xs leading-5 text-gray-600">Add <strong>Rs. {formatNPR(3000 - subtotalNPR)}</strong> more to unlock free shipping.</div>}
              {isFreeShipping && <div className="mt-5 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-xs font-medium text-green-700"><Truck className="h-4 w-4" /> You unlocked free shipping.</div>}

              <div className="my-6 border-t border-gray-200" />
              <div className="flex items-end justify-between"><span className="text-base font-medium">Total</span><span className="text-xl font-semibold">Rs. {formatNPR(grandTotalNPR)}</span></div>

              <Link to="/checkout" className="mt-6 flex h-12 items-center justify-center rounded-md bg-black px-5 text-sm font-semibold text-white hover:bg-gray-800">Proceed to Checkout</Link>
              <p className="mt-3 text-center text-[11px] text-gray-500">Secure checkout · Free shipping over Rs. 3,000</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
