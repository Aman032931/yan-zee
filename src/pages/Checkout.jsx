import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import {
  ArrowLeft,
  Banknote,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Lock,
  MapPin,
  Package,
  ShoppingBag,
  Smartphone,
  Truck,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import { formatNPR } from "./Cart";

import {
  countryHasDistricts,
  getProvincesForCountry,
  getDistrictsForProvince,
  getCitiesForDistrict,
  getCitiesForProvince,
} from "../data/locationData";

import visaIcon from "../assets/visa.svg";
import mastercardIcon from "../assets/mastercard.svg";
import amexIcon from "../assets/amex.svg";
import madaIcon from "../assets/mada.svg";

// =====================================================
// CONSTANTS
// =====================================================

const STEPS = ["shipping", "payment", "review"];
const STEP_LABELS = { shipping: "Shipping", payment: "Payment", review: "Review" };

const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", desc: "Pay when your order arrives", icon: Banknote },
  { id: "card", label: "Credit / Debit Card", desc: "Visa, Mastercard, Amex, Mada", icon: CreditCard },
  { id: "esewa", label: "eSewa", desc: "Pay with your eSewa wallet", icon: Smartphone },
  { id: "khalti", label: "Khalti", desc: "Pay with your Khalti wallet", icon: Smartphone },
];

// Nepal only for shipping (YanZee currently ships within Nepal)
const COUNTRY_OPTION = { value: "NP", label: "Nepal" };

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "46px",
    border: state.isFocused ? "1px solid #111827" : "1px solid #d1d5db",
    borderRadius: "8px",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(17,24,39,0.08)" : "none",
    backgroundColor: "#ffffff",
    fontSize: "14px",
    cursor: "pointer",
  }),
  valueContainer: (base) => ({ ...base, padding: "2px 12px" }),
  placeholder: (base) => ({ ...base, color: "#9ca3af" }),
  indicatorSeparator: () => ({ display: "none" }),
  menu: (base) => ({ ...base, fontSize: "14px", zIndex: 60 }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? "#111827" : state.isFocused ? "#f3f4f6" : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#111827",
    cursor: "pointer",
  }),
};

const genOrderNumber = () => {
  const y = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `YNZ-${y}-${rand}`;
};

// =====================================================
// SMALL HELPERS
// =====================================================

function Field({ label, required, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-800">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "h-[46px] w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-gray-900 focus:ring-3 focus:ring-gray-900/8";

// =====================================================
// CHECKOUT
// =====================================================

export default function Checkout() {
  const navigate = useNavigate();
  const {
    cart,
    clearCart,
    totalItems,
    subtotalNPR,
    shippingNPR,
    grandTotalNPR,
    isFreeShipping,
  } = useCart();

  const [step, setStep] = useState("shipping");
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // ---------------- shipping form ----------------
  const [shipping, setShipping] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    landmark: "",
    province: null,
    district: null,
    city: null,
    zip: "",
  });

  const hasDistrictSelect = countryHasDistricts(COUNTRY_OPTION.value);

  const provinceOptions = useMemo(
    () =>
      (getProvincesForCountry(COUNTRY_OPTION.value) || []).map((p) => ({
        value: p,
        label: p,
      })),
    []
  );

  const districtOptions = useMemo(() => {
    if (!shipping.province) return [];
    const districts =
      getDistrictsForProvince(COUNTRY_OPTION.value, shipping.province.label) || [];
    return districts.map((d) => ({ value: d, label: d }));
  }, [shipping.province]);

  const cityOptions = useMemo(() => {
    if (!shipping.province) return [];
    if (hasDistrictSelect) {
      if (!shipping.district) return [];
      const cities =
        getCitiesForDistrict(
          COUNTRY_OPTION.value,
          shipping.province.label,
          shipping.district.label
        ) || [];
      return cities.map((c) => ({ value: c, label: c }));
    }
    const cities = getCitiesForProvince(COUNTRY_OPTION.value, shipping.province.label) || [];
    return cities.map((c) => ({ value: c, label: c }));
  }, [shipping.province, shipping.district, hasDistrictSelect]);

  const setField = (key) => (e) =>
    setShipping((prev) => ({ ...prev, [key]: e.target.value }));

  const isShippingValid =
    shipping.fullName.trim() &&
    /\S+@\S+\.\S+/.test(shipping.email) &&
    shipping.phone.trim().length >= 7 &&
    shipping.address.trim() &&
    shipping.province &&
    (!hasDistrictSelect || shipping.district) &&
    shipping.city;

  // ---------------- payment form ----------------
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const setCardField = (key) => (e) => setCard((prev) => ({ ...prev, [key]: e.target.value }));

  const isPaymentValid =
    paymentMethod !== "card" ||
    (card.number.replace(/\s/g, "").length >= 15 &&
      card.name.trim() &&
      /^\d{2}\s?\/\s?\d{2}$/.test(card.expiry) &&
      card.cvv.trim().length >= 3);

  // ---------------- promo ----------------
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const discountNPR = promoApplied ? Math.round(subtotalNPR * 0.1) : 0;
  const finalTotalNPR = grandTotalNPR - discountNPR;

  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === "YANZEE10") setPromoApplied(true);
  };

  // ---------------- navigation ----------------
  const stepIdx = STEPS.indexOf(step);

  const goNext = () => {
    if (step === "shipping" && isShippingValid) setStep("payment");
    else if (step === "payment" && isPaymentValid) setStep("review");
  };

  const goBack = () => {
    if (stepIdx > 0) setStep(STEPS[stepIdx - 1]);
  };

  const placeOrder = () => {
    setConfirmedOrder({
      number: genOrderNumber(),
      items: cart,
      total: finalTotalNPR,
      method: PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label,
      city: shipping.city?.label,
    });
    clearCart();
  };

  // =====================================================
  // EMPTY CART GUARD
  // =====================================================

  if (cart.length === 0 && !confirmedOrder) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex min-h-[500px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 px-6 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-white shadow-sm">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold">Your bag is empty</h1>
          <p className="mt-2 max-w-md text-sm text-gray-500">
            Add something to your bag before checking out.
          </p>
          <Link
            to="/all"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // =====================================================
  // ORDER CONFIRMED
  // =====================================================

  if (confirmedOrder) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-green-50">
          <CheckCircle2 className="h-10 w-10 text-green-600" strokeWidth={1.75} />
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-gray-950">
          Order Confirmed!
        </h1>
        <p className="mt-2 text-sm text-gray-500">Order #{confirmedOrder.number}</p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-gray-600">
          Thank you for shopping with YanZee. Your order is being prepared and will arrive
          in 3–5 business days
          {confirmedOrder.city ? ` in ${confirmedOrder.city}` : ""}.
        </p>

        <div className="mt-8 w-full rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm">
          <div className="space-y-2.5">
            {confirmedOrder.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="mr-4 flex-1 truncate text-gray-800">
                  {item.name} <span className="text-gray-400">× {item.quantity}</span>
                </span>
                <span className="text-gray-600">
                  Rs. {formatNPR(item.priceNPR * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="my-4 border-t border-gray-200" />
          <div className="flex justify-between text-sm text-gray-600">
            <span>Payment method</span>
            <span className="font-medium text-gray-900">{confirmedOrder.method}</span>
          </div>
          <div className="mt-2 flex justify-between text-base font-semibold text-gray-950">
            <span>Total paid</span>
            <span>Rs. {formatNPR(confirmedOrder.total)}</span>
          </div>
        </div>

        <div className="mt-8 flex w-full gap-3">
          <Link
            to="/all"
            className="flex h-12 flex-1 items-center justify-center rounded-md border border-gray-300 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            Continue Shopping
          </Link>
          <button
            type="button"
            onClick={() => navigate("/all")}
            className="flex h-12 flex-1 items-center justify-center rounded-md bg-black text-sm font-semibold text-white hover:bg-gray-800"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN CHECKOUT FLOW
  // =====================================================

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link to="/cart" className="inline-flex items-center gap-1.5 hover:text-black">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to bag
          </Link>
        </div>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950">Checkout</h1>

        {/* step indicator */}
        <div className="mt-6 flex max-w-md items-center">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center">
              <div className="flex flex-shrink-0 items-center gap-2">
                <div
                  className="grid h-7 w-7 place-items-center rounded-full text-xs font-semibold transition-colors"
                  style={{
                    background: i <= stepIdx ? "#111827" : "#e5e7eb",
                    color: i <= stepIdx ? "#ffffff" : "#9ca3af",
                  }}
                >
                  {i < stepIdx ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span
                  className="hidden text-xs font-medium sm:block"
                  style={{ color: i <= stepIdx ? "#111827" : "#9ca3af" }}
                >
                  {STEP_LABELS[s]}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="mx-2 h-px flex-1"
                  style={{ background: i < stepIdx ? "#111827" : "#e5e7eb" }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_370px]">
          {/* ===================== LEFT: FORM ===================== */}
          <div className="rounded-xl border border-gray-200 p-5 sm:p-6">
            {/* -------- SHIPPING -------- */}
            {step === "shipping" && (
              <>
                <div className="mb-5 flex items-center gap-2">
                  <MapPin className="h-4.5 w-4.5 text-gray-700" />
                  <h2 className="text-lg font-semibold text-gray-950">Shipping details</h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full Name" required>
                    <input
                      className={inputClass}
                      placeholder="Your full name"
                      value={shipping.fullName}
                      onChange={setField("fullName")}
                    />
                  </Field>
                  <Field label="Phone" required>
                    <input
                      className={inputClass}
                      placeholder="98XXXXXXXX"
                      value={shipping.phone}
                      onChange={setField("phone")}
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Email" required>
                      <input
                        type="email"
                        className={inputClass}
                        placeholder="you@example.com"
                        value={shipping.email}
                        onChange={setField("email")}
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Street Address" required>
                      <input
                        className={inputClass}
                        placeholder="House no., street, tole"
                        value={shipping.address}
                        onChange={setField("address")}
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Landmark (optional)">
                      <input
                        className={inputClass}
                        placeholder="Nearby landmark to help delivery"
                        value={shipping.landmark}
                        onChange={setField("landmark")}
                      />
                    </Field>
                  </div>

                  <Field label="Province" required>
                    <Select
                      styles={selectStyles}
                      options={provinceOptions}
                      value={shipping.province}
                      onChange={(sel) =>
                        setShipping((prev) => ({
                          ...prev,
                          province: sel,
                          district: null,
                          city: null,
                        }))
                      }
                      placeholder="Select province..."
                      isSearchable
                      isClearable
                      menuPortalTarget={document.body}
                    />
                  </Field>

                  {hasDistrictSelect && (
                    <Field label="District" required>
                      <Select
                        styles={selectStyles}
                        options={districtOptions}
                        value={shipping.district}
                        onChange={(sel) =>
                          setShipping((prev) => ({ ...prev, district: sel, city: null }))
                        }
                        isDisabled={!shipping.province}
                        placeholder={
                          shipping.province ? "Select district..." : "Select a province first"
                        }
                        isSearchable
                        isClearable
                        menuPortalTarget={document.body}
                      />
                    </Field>
                  )}

                  <Field label="City" required>
                    <Select
                      styles={selectStyles}
                      options={cityOptions}
                      value={shipping.city}
                      onChange={(sel) => setShipping((prev) => ({ ...prev, city: sel }))}
                      isDisabled={hasDistrictSelect ? !shipping.district : !shipping.province}
                      placeholder={
                        hasDistrictSelect
                          ? shipping.district
                            ? "Select city..."
                            : "Select a district first"
                          : shipping.province
                            ? "Select city..."
                            : "Select a province first"
                      }
                      isSearchable
                      isClearable
                      menuPortalTarget={document.body}
                    />
                  </Field>

                  <Field label="ZIP / Postal Code (optional)">
                    <input
                      className={inputClass}
                      placeholder="44600"
                      value={shipping.zip}
                      onChange={setField("zip")}
                    />
                  </Field>
                </div>
              </>
            )}

            {/* -------- PAYMENT -------- */}
            {step === "payment" && (
              <>
                <div className="mb-5 flex items-center gap-2">
                  <CreditCard className="h-4.5 w-4.5 text-gray-700" />
                  <h2 className="text-lg font-semibold text-gray-950">Payment method</h2>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {PAYMENT_METHODS.map((m) => {
                    const Icon = m.icon;
                    const active = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`flex items-start gap-3 rounded-lg border p-4 text-left transition ${
                          active
                            ? "border-gray-900 ring-1 ring-gray-900"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-full ${
                            active ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{m.label}</p>
                          <p className="mt-0.5 text-xs text-gray-500">{m.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {paymentMethod === "card" && (
                  <div className="mt-6 space-y-4 border-t border-gray-100 pt-6">
                    <div className="flex items-center gap-3">
                      {[visaIcon, mastercardIcon, amexIcon, madaIcon].map((src, i) => (
                        <img key={i} src={src} alt="" className="h-5 w-auto opacity-80" />
                      ))}
                    </div>
                    <Field label="Card Number" required>
                      <input
                        className={inputClass}
                        placeholder="1234 5678 9012 3456"
                        value={card.number}
                        onChange={setCardField("number")}
                      />
                    </Field>
                    <Field label="Name on Card" required>
                      <input
                        className={inputClass}
                        placeholder="As shown on card"
                        value={card.name}
                        onChange={setCardField("name")}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Expiry" required>
                        <input
                          className={inputClass}
                          placeholder="MM / YY"
                          value={card.expiry}
                          onChange={setCardField("expiry")}
                        />
                      </Field>
                      <Field label="CVV" required>
                        <input
                          className={inputClass}
                          placeholder="•••"
                          value={card.cvv}
                          onChange={setCardField("cvv")}
                        />
                      </Field>
                    </div>
                    <p className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Lock className="h-3.5 w-3.5" /> Your payment details are encrypted and
                      secure.
                    </p>
                  </div>
                )}

                {(paymentMethod === "esewa" || paymentMethod === "khalti") && (
                  <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                    You'll be redirected to {PAYMENT_METHODS.find((m) => m.id === paymentMethod).label}{" "}
                    to complete payment after you place your order.
                  </div>
                )}

                {paymentMethod === "cod" && (
                  <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                    Pay in cash when your order is delivered to your doorstep.
                  </div>
                )}
              </>
            )}

            {/* -------- REVIEW -------- */}
            {step === "review" && (
              <>
                <div className="mb-5 flex items-center gap-2">
                  <Package className="h-4.5 w-4.5 text-gray-700" />
                  <h2 className="text-lg font-semibold text-gray-950">Review your order</h2>
                </div>

                <div className="space-y-5">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Ship to
                      </p>
                      <button
                        type="button"
                        onClick={() => setStep("shipping")}
                        className="text-xs font-medium text-gray-600 underline hover:text-black"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      {shipping.fullName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {shipping.address}
                      {shipping.landmark ? `, ${shipping.landmark}` : ""}
                    </p>
                    <p className="text-sm text-gray-600">
                      {[shipping.city?.label, shipping.district?.label, shipping.province?.label]
                        .filter(Boolean)
                        .join(", ")}
                      {shipping.zip ? ` — ${shipping.zip}` : ""}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {shipping.phone} · {shipping.email}
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Payment
                      </p>
                      <button
                        type="button"
                        onClick={() => setStep("payment")}
                        className="text-xs font-medium text-gray-600 underline hover:text-black"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}
                      {paymentMethod === "card" && card.number
                        ? ` · •••• ${card.number.replace(/\s/g, "").slice(-4)}`
                        : ""}
                    </p>
                  </div>

                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Items ({totalItems})
                    </p>
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="h-14 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-50">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-contain p-1"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500">Qty {item.quantity}</p>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            Rs. {formatNPR(item.priceNPR * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* -------- FOOTER NAV -------- */}
            <div className="mt-8 flex gap-3 border-t border-gray-100 pt-6">
              {stepIdx > 0 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex h-12 items-center justify-center rounded-md border border-gray-300 px-5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                >
                  Back
                </button>
              )}
              {step !== "review" ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={step === "shipping" ? !isShippingValid : !isPaymentValid}
                  className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-md bg-black text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {step === "shipping" ? "Continue to Payment" : "Continue to Review"}
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={placeOrder}
                  className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-md bg-black text-sm font-semibold text-white hover:bg-gray-800"
                >
                  <Lock className="h-4 w-4" /> Place Order — Rs. {formatNPR(finalTotalNPR)}
                </button>
              )}
            </div>
          </div>

          {/* ===================== RIGHT: SUMMARY ===================== */}
          <aside className="lg:sticky lg:top-6">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold">Order summary</h2>

              <div className="mt-5 max-h-64 space-y-3 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative h-14 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-50">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain p-1"
                      />
                      <span className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full bg-gray-900 text-[10px] font-semibold text-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-gray-900">{item.name}</p>
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      Rs. {formatNPR(item.priceNPR * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex gap-2">
                <input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Promo code"
                  className="h-10 flex-1 rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-gray-900"
                />
                <button
                  type="button"
                  onClick={applyPromo}
                  className="rounded-md bg-gray-900 px-4 text-sm font-semibold text-white hover:bg-black"
                >
                  Apply
                </button>
              </div>
              {promoApplied && (
                <p className="mt-2 flex items-center gap-1 text-xs font-medium text-green-600">
                  <Check className="h-3.5 w-3.5" /> YANZEE10 — 10% discount applied
                </p>
              )}

              <div className="my-5 border-t border-gray-200" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">Rs. {formatNPR(subtotalNPR)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">−Rs. {formatNPR(discountNPR)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className={`font-medium ${isFreeShipping ? "text-green-600" : "text-gray-900"}`}>
                    {shippingNPR === 0 ? "FREE" : `Rs. ${formatNPR(shippingNPR)}`}
                  </span>
                </div>
              </div>

              {!isFreeShipping && (
                <div className="mt-5 flex items-center gap-2 rounded-lg bg-gray-50 p-3 text-xs leading-5 text-gray-600">
                  <Truck className="h-4 w-4 flex-shrink-0" />
                  Add <strong>Rs. {formatNPR(3000 - subtotalNPR)}</strong> more for free shipping.
                </div>
              )}

              <div className="my-5 border-t border-gray-200" />
              <div className="flex items-end justify-between">
                <span className="text-base font-medium">Total</span>
                <span className="text-xl font-semibold">Rs. {formatNPR(finalTotalNPR)}</span>
              </div>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
                <Lock className="h-3 w-3" /> Secure checkout · Try code YANZEE10
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}