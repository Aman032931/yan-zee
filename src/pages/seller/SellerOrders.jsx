
import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import {
  ShoppingBag,
  RefreshCw,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Package,
  User,
  MapPin,
  Phone,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Store,
  Plus,
  Trash2,
} from "lucide-react";

import {
  DataCard,
  EmptyState,
  PageHeader,
  PageShell,
} from "../../components/seller/SellerUI";

import {
  useOrders,
  useOrder,
  useUpdateOrderStatus,
  useCreateOrder,
} from "../../hooks/useOrders";

import { useCustomers } from "../../hooks/useCustomers";
import { useManagedProducts } from "../../hooks/useManagedProducts";
import { getOutlets } from "../../services/outletService";

const LIMIT = 20;

const STATUS_OPTIONS = [
  "PROCESSING",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

const formatMoney = (value) => {
  if (value == null || value === "") return "—";

  const amount = Number(value);

  if (Number.isNaN(amount)) return value;

  return `Rs. ${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString();
};

const formatLabel = (value) =>
  String(value || "Unknown")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getStatusStyle = (status) => {
  switch (status) {
    case "DELIVERED":
      return "bg-green-50 text-green-700";
    case "PROCESSING":
      return "bg-blue-50 text-blue-700";
    case "CANCELLED":
      return "bg-red-50 text-red-700";
    case "RETURNED":
      return "bg-purple-50 text-purple-700";
    default:
      return "bg-yz-bg text-muted-foreground";
  }
};

const getOrderFromResponse = (response) =>
  response?.data?.order ??
  response?.order ??
  response?.data ??
  null;

const getList = (response, keys) => {
  const source = response?.data ?? response;

  if (Array.isArray(source)) return source;

  for (const key of keys) {
    if (Array.isArray(source?.[key])) return source[key];
  }

  return [];
};

const getCustomerId = (customer) =>
  customer?.id ?? customer?._id ?? customer?.customerId ?? "";

const getCustomerName = (customer) =>
  customer?.fullName ??
  customer?.name ??
  customer?.customerName ??
  "Unnamed customer";

const getProductId = (product) =>
  product?.id ?? product?._id ?? product?.productId ?? "";

const getProductName = (product) =>
  product?.name ?? product?.productName ?? "Unnamed product";

const getProductPrice = (product) =>
  Number(
    product?.sellingPrice ??
      product?.price ??
      product?.discountPrice ??
      0
  );

const getProductStock = (product) =>
  Number(
    product?.totalStock ??
      product?.quantity ??
      product?.stock ??
      0
  );

const getVariants = (product) =>
  Array.isArray(product?.variants) ? product.variants : [];

const getVariantId = (variant) =>
  variant?.id ?? variant?._id ?? variant?.variantId ?? null;

const getVariantName = (variant) =>
  variant?.name ??
  variant?.variantName ??
  variant?.title ??
  variant?.sku ??
  "Variant";

const getVariantPrice = (variant, product) =>
  Number(
    variant?.sellingPrice ??
      variant?.price ??
      getProductPrice(product)
  );

const getVariantStock = (variant, product) =>
  Number(
    variant?.quantity ??
      variant?.stock ??
      variant?.totalStock ??
      getProductStock(product)
  );

const inputClass =
  "w-full rounded-lg border border-yz-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-red-600";

const labelClass = "mb-1.5 block text-sm font-medium";

const initialOrderForm = {
  customerId: "",
  province: "",
  district: "",
  city: "",
  address: "",
  landmark: "",
  orderNote: "",
  deliveryFee: "0",
  discountType: "PERCENT",
  discountValue: "0",
  paymentMethod: "COD",
  paymentStatus: "UNPAID",
  paymentReference: "",
};

function SelectionSearch({
  value,
  onChange,
  results,
  onSelect,
  getLabel,
  getDescription,
  placeholder,
  loading = false,
  emptyMessage = "No results found.",
}) {
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <input
        value={value}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        placeholder={placeholder}
        autoComplete="off"
        className={inputClass}
      />

      {open && (
        <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-xl border border-yz-border bg-white p-1 shadow-xl">
          {loading ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              Loading results...
            </p>
          ) : results.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </p>
          ) : (
            results.map((item, index) => (
              <button
                key={
                  getCustomerId(item) ||
                  getProductId(item) ||
                  index
                }
                type="button"
                onClick={() => {
                  onSelect(item);
                  setOpen(false);
                }}
                className="flex w-full flex-col rounded-lg px-3 py-2.5 text-left transition hover:bg-yz-bg"
              >
                <span className="text-sm font-medium text-zinc-900">
                  {getLabel(item)}
                </span>

                {getDescription?.(item) && (
                  <span className="mt-0.5 text-xs text-muted-foreground">
                    {getDescription(item)}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function CreateOrderModal({ storeId, onClose, onCreated }) {
  const [form, setForm] = useState(initialOrderForm);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerData, setSelectedCustomerData] = useState(null);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [items, setItems] = useState([]);
  const [formError, setFormError] = useState("");
  

  const customersQuery = useCustomers(
    {
      page: 1,
      limit: 100,
      search: customerSearch,
    },
    storeId
  );

  const productsQuery = useManagedProducts(storeId);
  const createOrder = useCreateOrder();

  const customers = getList(customersQuery.data, [
    "customers",
    "items",
    "results",
  ]);

  const filteredCustomers = useMemo(() => {
  const search = customerSearch.trim().toLowerCase();

  if (!search) return customers;

  return customers.filter((customer) => {
    const name = getCustomerName(customer).toLowerCase();
    const phone = String(customer.phone || "").toLowerCase();
    const email = String(customer.email || "").toLowerCase();

    return (
      name.includes(search) ||
      phone.includes(search) ||
      email.includes(search)
    );
  });
}, [customers, customerSearch]);

  // FIX: Find the currently selected customer.
  const selectedCustomer =
    customers.find(
      (customer) =>
        String(getCustomerId(customer)) === String(form.customerId)
    ) || selectedCustomerData;

  const products = Array.isArray(productsQuery.products)
    ? productsQuery.products
    : getList(productsQuery.data, ["products", "items", "results"]);

  const selectedProduct = products.find(
    (product) => String(getProductId(product)) === selectedProductId
  );

  const variants = selectedProduct ? getVariants(selectedProduct) : [];

  const selectedVariant = variants.find(
    (variant) => String(getVariantId(variant)) === selectedVariantId
  );

  const filteredProducts = useMemo(() => {
    const search = productSearch.trim().toLowerCase();

    if (!search) return products;

    return products.filter((product) =>
      getProductName(product).toLowerCase().includes(search)
    );
  }, [products, productSearch]);

  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const deliveryFee = Math.max(0, Number(form.deliveryFee) || 0);
  const discountValue = Math.max(0, Number(form.discountValue) || 0);

  const discountAmount =
    form.discountType === "PERCENT"
      ? Math.min(subtotal, (subtotal * discountValue) / 100)
      : Math.min(subtotal, discountValue);

  const total = Math.max(
    0,
    subtotal - discountAmount + deliveryFee
  );

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const addProduct = () => {
    setFormError("");

    if (!selectedProduct) {
      setFormError("Please select a product.");
      return;
    }

    if (variants.length > 0 && !selectedVariant) {
      setFormError("Please select a product variant.");
      return;
    }

    const productId = getProductId(selectedProduct);
    const requestedQuantity = Number(quantity);

    if (!productId) {
      setFormError("Invalid product selected.");
      return;
    }

    if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
      setFormError("Quantity must be at least 1.");
      return;
    }

    const variantId = selectedVariant
      ? getVariantId(selectedVariant)
      : null;

    const stock = selectedVariant
      ? getVariantStock(selectedVariant, selectedProduct)
      : getProductStock(selectedProduct);

    const unitPrice = selectedVariant
      ? getVariantPrice(selectedVariant, selectedProduct)
      : getProductPrice(selectedProduct);

    const existingItem = items.find(
      (item) =>
        item.productId === productId &&
        item.variantId === variantId
    );

    const finalQuantity =
      requestedQuantity + (existingItem?.quantity ?? 0);

    if (finalQuantity > stock) {
      setFormError(`Only ${stock} units are available.`);
      return;
    }

    if (unitPrice < 0) {
      setFormError("Invalid product price.");
      return;
    }

    const newItem = {
      productId,
      variantId,
      name: getProductName(selectedProduct),
      variantName: selectedVariant
        ? getVariantName(selectedVariant)
        : "",
      unitPrice,
      quantity: requestedQuantity,
    };

    setItems((current) => {
      if (!existingItem) return [...current, newItem];

      return current.map((item) =>
        item.productId === productId &&
        item.variantId === variantId
          ? { ...item, quantity: finalQuantity }
          : item
      );
    });

    setSelectedProductId("");
    setSelectedVariantId("");
    setQuantity("1");
    setProductSearch("");
  };

  const removeProduct = (productId, variantId) => {
    setItems((current) =>
      current.filter(
        (item) =>
          !(
            item.productId === productId &&
            item.variantId === variantId
          )
      )
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!form.customerId) {
      setFormError("Please select a customer.");
      return;
    }

    if (items.length === 0) {
      setFormError("Please add at least one product.");
      return;
    }

    if (
      !form.province.trim() ||
      !form.district.trim() ||
      !form.city.trim() ||
      !form.address.trim()
    ) {
      setFormError("Please complete the delivery address.");
      return;
    }

    if (discountValue < 0) {
      setFormError("Discount cannot be negative.");
      return;
    }

    if (
      form.discountType === "PERCENT" &&
      discountValue > 100
    ) {
      setFormError("Percentage discount cannot exceed 100%.");
      return;
    }

    const body = {
      channel: "ADMIN",
      customerId: form.customerId,
      province: form.province.trim(),
      district: form.district.trim(),
      city: form.city.trim(),
      address: form.address.trim(),
      landmark: form.landmark.trim(),
      orderNote: form.orderNote.trim(),
      deliveryFee,
      discount: {
        type: form.discountType,
        value: discountValue,
      },
      paymentMethod: form.paymentMethod,
      paymentStatus: form.paymentStatus,
      paymentReference: form.paymentReference.trim() || null,
      items: items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    };

    try {
      await createOrder.mutateAsync({
        storeId,
        body,
      });

      window.alert("Order created successfully.");
      onCreated();
    } catch (error) {
      setFormError(
        error?.message || "Failed to create order."
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !createOrder.isPending
        ) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-yz-border px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">Create Order</h2>
            <p className="text-sm text-muted-foreground">
              Create a new order for this store.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={createOrder.isPending}
            className="rounded-lg p-2 hover:bg-yz-bg disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-5">
          <div className="space-y-6">
            {/* Customer */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <User className="h-4 w-4" />
                Customer
              </h3>

              <SelectionSearch
                value={customerSearch}
                onChange={setCustomerSearch}
                results={filteredCustomers}
                loading={customersQuery.isLoading}
                placeholder="Search customer by name, phone or email"
                emptyMessage="No customers found."
                getLabel={(customer) => getCustomerName(customer)}
                getDescription={(customer) =>
                  [customer.phone, customer.email].filter(Boolean).join(" · ")
                }
                onSelect={(customer) => {
                  const customerId = getCustomerId(customer);

                  updateField("customerId", String(customerId));
                  setSelectedCustomerData(customer);
                  setCustomerSearch(getCustomerName(customer));
                }}
              />

              {customersQuery.isLoading && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Loading customers...
                </p>
              )}

              {customersQuery.isError && (
                <p className="mt-2 text-xs text-red-600">
                  Could not load customers.
                </p>
              )}

              {selectedCustomer && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {selectedCustomer.phone || ""}
                  {selectedCustomer.email
                    ? ` · ${selectedCustomer.email}`
                    : ""}
                </p>
              )}
            </section>

            {/* Products */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <Package className="h-4 w-4" />
                Products
              </h3>

                <SelectionSearch
                  value={productSearch}
                  onChange={setProductSearch}
                  results={filteredProducts}
                  loading={productsQuery.loading}
                  placeholder="Search products"
                  emptyMessage="No products found."
                  getLabel={(product) =>
                    `${getProductName(product)} — ${formatMoney(getProductPrice(product))}`
                  }
                  getDescription={(product) =>
                    `Available stock: ${getProductStock(product)}`
                  }
                  onSelect={(product) => {
                    setSelectedProductId(String(getProductId(product)));
                    setSelectedVariantId("");
                    setProductSearch(getProductName(product));
                  }}
                />

                  {selectedProduct && variants.length > 0 && (
                    <select
                      value={selectedVariantId}
                      onChange={(event) =>
                        setSelectedVariantId(event.target.value)
                      }
                      className={`${inputClass} mt-2`}
                    >
                      <option value="">Select variant</option>

                      {variants.map((variant, index) => {
                        const id = getVariantId(variant);

                        return (
                          <option
                            key={id ?? index}
                            value={id}
                          >
                            {getVariantName(variant)} —{" "}
                            {formatMoney(
                              getVariantPrice(variant, selectedProduct)
                            )}
                          </option>
                        );
                      })}
                    </select>
                  )}

                  {selectedProduct && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Available stock:{" "}
                      {selectedVariant
                        ? getVariantStock(selectedVariant, selectedProduct)
                        : getProductStock(selectedProduct)}
                    </p>
                  )}

                  <div className="mt-2 flex gap-2">
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(event) => setQuantity(event.target.value)}
                      placeholder="Quantity"
                      className={`${inputClass} max-w-32`}
                    />

                    <button
                      type="button"
                      onClick={addProduct}
                      className="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-red-700"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </button>
                  </div>
  
              {items.length > 0 && (
                <div className="mt-4 overflow-hidden rounded-xl border border-yz-border">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId ?? "none"}`}
                      className="flex items-center gap-3 border-b border-yz-border p-3 last:border-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          {item.name}
                        </p>

                        {item.variantName && (
                          <p className="text-xs text-muted-foreground">
                            {item.variantName}
                          </p>
                        )}

                        <p className="text-xs text-muted-foreground">
                          {item.quantity} × {formatMoney(item.unitPrice)}
                        </p>
                      </div>

                      <p className="text-sm font-semibold">
                        {formatMoney(item.quantity * item.unitPrice)}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          removeProduct(item.productId, item.variantId)
                        }
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        aria-label="Remove product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Delivery */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <MapPin className="h-4 w-4" />
                Delivery details
              </h3>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Province *</label>
                  <input
                    required
                    value={form.province}
                    onChange={(event) =>
                      updateField("province", event.target.value)
                    }
                    className={inputClass}
                    placeholder="Province"
                  />
                </div>

                <div>
                  <label className={labelClass}>District *</label>
                  <input
                    required
                    value={form.district}
                    onChange={(event) =>
                      updateField("district", event.target.value)
                    }
                    className={inputClass}
                    placeholder="District"
                  />
                </div>

                <div>
                  <label className={labelClass}>City *</label>
                  <input
                    required
                    value={form.city}
                    onChange={(event) =>
                      updateField("city", event.target.value)
                    }
                    className={inputClass}
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className={labelClass}>Address *</label>
                  <input
                    required
                    value={form.address}
                    onChange={(event) =>
                      updateField("address", event.target.value)
                    }
                    className={inputClass}
                    placeholder="Street, house number..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Landmark</label>
                  <input
                    value={form.landmark}
                    onChange={(event) =>
                      updateField("landmark", event.target.value)
                    }
                    className={inputClass}
                    placeholder="Nearby landmark"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Order note</label>
                  <textarea
                    rows={2}
                    value={form.orderNote}
                    onChange={(event) =>
                      updateField("orderNote", event.target.value)
                    }
                    className={inputClass}
                    placeholder="Additional delivery instructions..."
                  />
                </div>
              </div>
            </section>

            {/* Payment */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <CreditCard className="h-4 w-4" />
                Payment
              </h3>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Payment method</label>
                  <select
                    value={form.paymentMethod}
                    onChange={(event) =>
                      updateField("paymentMethod", event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="COD">Cash on Delivery</option>
                    <option value="CASH">Cash</option>
                    <option value="ONLINE">Online</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Payment status</label>
                  <select
                    value={form.paymentStatus}
                    onChange={(event) =>
                      updateField("paymentStatus", event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="UNPAID">Unpaid</option>
                    <option value="PAID">Paid</option>
                    <option value="PARTIALLY_PAID">Partially Paid</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>
                    Payment reference
                  </label>
                  <input
                    value={form.paymentReference}
                    onChange={(event) =>
                      updateField("paymentReference", event.target.value)
                    }
                    className={inputClass}
                    placeholder="Optional transaction reference"
                  />
                </div>
              </div>
            </section>

            {/* Discount and delivery fee */}
            <section>
              <h3 className="mb-3 font-semibold">
                Discount and delivery fee
              </h3>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Discount type</label>
                  <select
                    value={form.discountType}
                    onChange={(event) =>
                      updateField("discountType", event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="FIXED">Fixed amount</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Discount value</label>
                  <input
                    type="number"
                    min="0"
                    value={form.discountValue}
                    onChange={(event) =>
                      updateField("discountValue", event.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Delivery fee</label>
                  <input
                    type="number"
                    min="0"
                    value={form.deliveryFee}
                    onChange={(event) =>
                      updateField("deliveryFee", event.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {/* Summary */}
            <section className="rounded-xl border border-yz-border p-4">
              <h3 className="mb-3 font-semibold">Order summary</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span>{formatMoney(discountAmount)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery fee</span>
                  <span>{formatMoney(deliveryFee)}</span>
                </div>

                <div className="flex justify-between border-t border-yz-border pt-3 text-base font-semibold">
                  <span>Total</span>
                  <span>{formatMoney(total)}</span>
                </div>
              </div>
            </section>

            {formError && (
              <p className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {formError}
              </p>
            )}

            <div className="flex flex-col-reverse gap-2 border-t border-yz-border pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={createOrder.isPending}
                className="rounded-lg border border-yz-border px-4 py-2.5 text-sm font-medium hover:bg-yz-bg disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={createOrder.isPending || items.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createOrder.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Create Order
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SellerOrders() {
  const { shop } = useOutletContext();
  const storeId = shop?.id;

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showCreateOrder, setShowCreateOrder] = useState(false);

  const [nextStatus, setNextStatus] = useState("");
  const [reason, setReason] = useState("");
  const [markAsPaid, setMarkAsPaid] = useState(false);
  const [restoreStock, setRestoreStock] = useState(true);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useOrders({
    storeId,
    page,
    limit: LIMIT,
    search: query,
    status: statusFilter,
    channel: channelFilter,
  });

  const {
    data: orderResponse,
    isLoading: isOrderLoading,
    isError: isOrderError,
    error: orderError,
    refetch: refetchOrder,
  } = useOrder(storeId, selectedOrderId);

  const {
    data: outlets = [],
    isLoading: isOutletsLoading,
    isError: isOutletsError,
  } = useQuery({
    queryKey: ["outlets", storeId],
    queryFn: () => getOutlets(storeId),
    enabled: Boolean(storeId),
    staleTime: 5 * 60 * 1000,
  });

  const updateStatus = useUpdateOrderStatus();

  const responseData = data?.data ?? data;

  const orders = Array.isArray(responseData)
    ? responseData
    : responseData?.orders ??
      responseData?.items ??
      responseData?.results ??
      [];

  const pagination = responseData?.pagination ?? {};

  const total =
    Number(
      pagination.total ??
        responseData?.total ??
        responseData?.totalItems
    ) || orders.length;

  const totalPages =
    Number(pagination.totalPages) ||
    Math.max(1, Math.ceil(total / LIMIT));

  const order = getOrderFromResponse(orderResponse);

  const summary = order?.summary ?? {};
  const customer = order?.customer ?? {};
  const items = summary?.items ?? [];
  const activities = order?.activities ?? [];
  const stockMovements = order?.stockMovements ?? [];

  const orderOutlet = outlets.find(
    (outlet) => outlet.id === order?.placedAt?.id
  );

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, channelFilter]);

  useEffect(() => {
    setNextStatus("");
    setReason("");
    setMarkAsPaid(false);
    setRestoreStock(true);
    updateStatus.reset();
  }, [selectedOrderId]);

  const closeDetails = () => {
    setSelectedOrderId(null);
    setNextStatus("");
    setReason("");
    updateStatus.reset();
  };

  const handleStatusUpdate = async (event) => {
    event.preventDefault();

    if (!selectedOrderId || !nextStatus) return;

    const body = {
      status: nextStatus,
    };

    if (nextStatus === "DELIVERED" && markAsPaid) {
      body.markAsPaid = true;
    }

    if (
      nextStatus === "CANCELLED" ||
      nextStatus === "RETURNED"
    ) {
      if (!reason.trim()) return;
      body.reason = reason.trim();
    }

    if (nextStatus === "RETURNED") {
      body.restoreStock = restoreStock;
    }

    try {
      const result = await updateStatus.mutateAsync({
        storeId,
        orderId: selectedOrderId,
        body,
      });

      const resultData = result?.data ?? result;

      if (
        resultData?.stockRestored != null ||
        resultData?.stockSkipped != null
      ) {
        window.alert(
          `Order updated successfully.\nStock restored: ${
            resultData.stockRestored ?? 0
          }\nStock skipped: ${resultData.stockSkipped ?? 0}`
        );
      } else {
        window.alert("Order status updated successfully.");
      }

      setNextStatus("");
      setReason("");
      setMarkAsPaid(false);
      refetchOrder();
    } catch {
      // Mutation error is displayed in the details popup.
    }
  };

  const handleOrderCreated = () => {
    setShowCreateOrder(false);
    setPage(1);
    refetch();
  };

  return (
    <PageShell>
      <PageHeader
        title="Orders"
        subtitle="View and manage orders for your selected store."
      />

      <DataCard
        icon={ShoppingBag}
        title="All orders"
        count={total}
        search={{
          value: query,
          onChange: setQuery,
          placeholder: "Search orders",
        }}
      >
        {!storeId ? (
          <EmptyState
            icon={ShoppingBag}
            title="No store selected"
            text="Select a store from the sidebar to view its orders."
          />
        ) : (
          <>
            <div className="flex flex-col gap-3 border-b border-yz-border px-4 py-4 sm:flex-row sm:items-center">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="rounded-lg border border-yz-border bg-white px-3 py-2 text-sm outline-none focus:border-brand-red-600"
              >
                <option value="">All statuses</option>

                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {formatLabel(status)}
                  </option>
                ))}
              </select>

              <select
                value={channelFilter}
                onChange={(event) =>
                  setChannelFilter(event.target.value)
                }
                className="rounded-lg border border-yz-border bg-white px-3 py-2 text-sm outline-none focus:border-brand-red-600"
              >
                <option value="ALL">All channels</option>
                <option value="POS">POS</option>
                <option value="WEB">Website</option>
                <option value="ADMIN">Admin</option>
              </select>

              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-yz-border px-3 py-2 text-sm font-medium transition hover:bg-yz-bg disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    isFetching ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => setShowCreateOrder(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-red-700 sm:ml-auto"
              >
                <Plus className="h-4 w-4" />
                Create Order
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading orders...
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <p className="text-sm text-red-600">
                  {error?.message || "Failed to load orders."}
                </p>

                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="inline-flex items-center gap-2 rounded-lg border border-yz-border px-4 py-2 text-sm font-medium transition hover:bg-yz-bg disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try again
                </button>
              </div>
            ) : orders.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title={
                  query || statusFilter || channelFilter !== "ALL"
                    ? "No matching orders"
                    : "No orders yet"
                }
                text="Try changing your search or filters, or create a new order."
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[750px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-yz-border text-muted-foreground">
                        <th className="px-4 py-3 font-medium">Order</th>
                        <th className="px-4 py-3 font-medium">Customer</th>
                        <th className="px-4 py-3 font-medium">Channel</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 text-right font-medium">Total</th>
                        <th className="px-4 py-3 text-right font-medium">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.map((item, index) => {
                        const orderId =
                          item.id ??
                          item._id ??
                          item.orderId ??
                          `order-${index}`;

                        const customerName =
                          item.customerName ??
                          item.customer?.name ??
                          item.customer?.fullName ??
                          "—";

                        return (
                          <tr
                            key={orderId}
                            className="border-b border-yz-border last:border-0 hover:bg-yz-bg/50"
                          >
                            <td className="px-4 py-4 font-medium">
                              #{item.orderNumber ?? orderId.slice(-8)}
                            </td>

                            <td className="px-4 py-4">{customerName}</td>

                            <td className="px-4 py-4">
                              {formatLabel(item.channel)}
                            </td>

                            <td className="px-4 py-4 text-muted-foreground">
                              {formatDate(item.createdAt)}
                            </td>

                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                                  item.status
                                )}`}
                              >
                                {formatLabel(item.status)}
                              </span>
                            </td>

                            <td className="px-4 py-4 text-right font-medium">
                              {formatMoney(item.total)}
                            </td>

                            <td className="px-4 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedOrderId(orderId)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-yz-border px-3 py-2 text-xs font-medium transition hover:bg-yz-bg"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-3 border-t border-yz-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing{" "}
                    {Math.min((page - 1) * LIMIT + 1, total)}–
                    {Math.min(page * LIMIT, total)} of {total} orders
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPage((current) => Math.max(1, current - 1))
                      }
                      disabled={page <= 1 || isFetching}
                      className="rounded-lg border border-yz-border p-2 transition hover:bg-yz-bg disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <span className="text-sm">
                      Page {page} of {totalPages}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setPage((current) =>
                          Math.min(totalPages, current + 1)
                        )
                      }
                      disabled={page >= totalPages || isFetching}
                      className="rounded-lg border border-yz-border p-2 transition hover:bg-yz-bg disabled:opacity-40"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </DataCard>

      {showCreateOrder && storeId && (
        <CreateOrderModal
          storeId={storeId}
          onClose={() => setShowCreateOrder(false)}
          onCreated={handleOrderCreated}
        />
      )}

      {/* Order details popup */}
      {selectedOrderId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDetails();
            }
          }}
        >
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-yz-border px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold">Order Details</h2>
                <p className="text-sm text-muted-foreground">
                  View order information and manage its status.
                </p>
              </div>

              <button
                type="button"
                onClick={closeDetails}
                className="rounded-lg p-2 transition hover:bg-yz-bg"
                aria-label="Close order details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-5">
              {isOrderLoading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading order details...
                </div>
              ) : isOrderError ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-red-600">
                    {orderError?.message || "Failed to load order details."}
                  </p>

                  <button
                    type="button"
                    onClick={() => refetchOrder()}
                    className="mt-3 rounded-lg border border-yz-border px-4 py-2 text-sm hover:bg-yz-bg"
                  >
                    Try again
                  </button>
                </div>
              ) : order ? (
                <div className="space-y-6">
                  <section className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Order number
                      </p>

                      <h3 className="mt-1 text-2xl font-semibold">
                        #{order.orderNumber}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-2">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-medium ${getStatusStyle(
                          order.status
                        )}`}
                      >
                        {formatLabel(order.status)}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {formatLabel(order.channel)}
                      </span>
                    </div>
                  </section>

                  <div className="grid gap-4 md:grid-cols-2">
                    <section className="rounded-xl border border-yz-border p-4">
                      <div className="mb-3 flex items-center gap-2 font-semibold">
                        <User className="h-4 w-4" />
                        Customer
                      </div>

                      <p className="font-medium">{customer.name || "—"}</p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {customer.phone || "—"}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {customer.email || "—"}
                      </p>

                      <div className="mt-3 border-t border-yz-border pt-3 text-sm">
                        <p>
                          {[
                            customer.address,
                            customer.landmark,
                            customer.city,
                            customer.district,
                            customer.province,
                          ]
                            .filter(Boolean)
                            .join(", ") || "No address provided"}
                        </p>

                        {customer.orderNote && (
                          <p className="mt-2 text-muted-foreground">
                            Order note: {customer.orderNote}
                          </p>
                        )}

                        {customer.customerNote && (
                          <p className="mt-1 text-muted-foreground">
                            Customer note: {customer.customerNote}
                          </p>
                        )}
                      </div>
                    </section>

                    <section className="rounded-xl border border-yz-border p-4">
                      <div className="mb-3 flex items-center gap-2 font-semibold">
                        <CreditCard className="h-4 w-4" />
                        Payment
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">Method</span>
                          <span className="font-medium">
                            {formatLabel(order.paymentMethod)}
                          </span>
                        </div>

                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">
                            Payment status
                          </span>
                          <span className="font-medium">
                            {formatLabel(order.paymentStatus)}
                          </span>
                        </div>

                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">
                            Paid amount
                          </span>
                          <span className="font-medium">
                            {formatMoney(summary.paidAmount)}
                          </span>
                        </div>

                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">
                            Refunded amount
                          </span>
                          <span className="font-medium">
                            {formatMoney(summary.refundedAmount)}
                          </span>
                        </div>

                        <div className="flex justify-between gap-3 border-t border-yz-border pt-2">
                          <span className="font-medium">Order total</span>
                          <span className="font-semibold">
                            {formatMoney(summary.total ?? order.total)}
                          </span>
                        </div>
                      </div>
                    </section>
                  </div>

                  <section>
                    <div className="mb-3 flex items-center gap-2 font-semibold">
                      <Package className="h-4 w-4" />
                      Ordered products ({items.length})
                    </div>

                    <div className="overflow-hidden rounded-xl border border-yz-border">
                      {items.length === 0 ? (
                        <p className="p-4 text-sm text-muted-foreground">
                          No product details available.
                        </p>
                      ) : (
                        items.map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-wrap items-center gap-3 border-b border-yz-border p-3 last:border-0"
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name || item.productName}
                                className="h-14 w-14 rounded-lg border border-yz-border object-cover"
                              />
                            ) : (
                              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-yz-bg">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <p className="font-medium">
                                {item.name || item.productName}
                              </p>

                              {item.variantName && (
                                <p className="text-xs text-muted-foreground">
                                  {item.variantName}
                                </p>
                              )}

                              <p className="text-xs text-muted-foreground">
                                Qty: {item.quantity} ×{" "}
                                {formatMoney(item.unitPrice)}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="font-semibold">
                                {formatMoney(
                                  item.lineTotal ?? item.totalPrice
                                )}
                              </p>

                              {Number(item.discount?.amount) > 0 && (
                                <p className="text-xs text-green-700">
                                  Discount: {formatMoney(item.discount.amount)}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>

                  <section className="rounded-xl border border-yz-border p-4">
                    <h4 className="mb-3 font-semibold">Price summary</h4>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatMoney(summary.subtotal)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Item discount
                        </span>
                        <span>{formatMoney(summary.itemDiscount)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Order discount
                        </span>
                        <span>
                          {formatMoney(summary.orderDiscount?.amount)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Coupon discount
                        </span>
                        <span>
                          {formatMoney(summary.coupon?.discountAmount ?? 0)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Delivery fee
                        </span>
                        <span>{formatMoney(summary.deliveryFee)}</span>
                      </div>

                      <div className="flex justify-between border-t border-yz-border pt-3 text-base font-semibold">
                        <span>Total</span>
                        <span>
                          {formatMoney(summary.total ?? order.total)}
                        </span>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-xl border border-yz-border p-4">
                    <div className="mb-3 flex items-center gap-2 font-semibold">
                      <Store className="h-4 w-4" />
                      Order Outlet
                    </div>

                    {isOutletsLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading outlet details...
                      </div>
                    ) : orderOutlet ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{orderOutlet.name}</p>

                          {orderOutlet.isMain && (
                            <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                              Main Outlet
                            </span>
                          )}
                        </div>

                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>
                            {orderOutlet.address || "Address not available"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 shrink-0" />
                          <span>
                            {orderOutlet.contactPhone ||
                              "Phone number not available"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="font-medium">
                          {order.placedAt?.name ||
                            "Outlet information unavailable"}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {isOutletsError
                            ? "Could not load outlet address and contact details."
                            : "Additional outlet details are not available."}
                        </p>
                      </div>
                    )}

                    <div className="mt-3 border-t border-yz-border pt-3 text-xs text-muted-foreground">
                      Created by: {order.createdBy?.fullName || "—"}
                    </div>
                  </section>

                  {stockMovements.length > 0 && (
                    <section>
                      <h4 className="mb-3 font-semibold">Stock movements</h4>

                      <div className="space-y-3">
                        {stockMovements.map((movement) => (
                          <div
                            key={movement.id}
                            className="rounded-xl border border-yz-border p-4"
                          >
                            <div className="flex flex-wrap justify-between gap-2">
                              <span className="text-sm font-medium">
                                {formatLabel(movement.type)}
                              </span>

                              <span className="text-xs text-muted-foreground">
                                {formatDate(movement.createdAt)}
                              </span>
                            </div>

                            <p className="mt-1 text-sm text-muted-foreground">
                              {movement.outlet?.name || "—"} ·{" "}
                              {movement.totalQuantity ?? 0} units
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {activities.length > 0 && (
                    <section>
                      <div className="mb-3 flex items-center gap-2 font-semibold">
                        <Clock className="h-4 w-4" />
                        Order activity
                      </div>

                      <div className="space-y-4 border-l-2 border-yz-border pl-4">
                        {activities.map((activity) => (
                          <div key={activity.id} className="relative">
                            <span className="absolute -left-[22px] top-1 h-2.5 w-2.5 rounded-full bg-brand-red-600" />

                            <p className="text-sm font-medium">
                              {activity.title ||
                                formatLabel(activity.action)}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {activity.actorName || "System"} ·{" "}
                              {formatDate(activity.createdAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  <section className="rounded-xl border border-yz-border p-4">
                    <h4 className="mb-3 font-semibold">
                      Manage order status
                    </h4>

                    {["CANCELLED", "RETURNED"].includes(order.status) ? (
                      <p className="text-sm text-muted-foreground">
                        This order is already{" "}
                        {formatLabel(order.status).toLowerCase()}.
                      </p>
                    ) : (
                      <form
                        onSubmit={handleStatusUpdate}
                        className="space-y-3"
                      >
                        <select
                          value={nextStatus}
                          onChange={(event) =>
                            setNextStatus(event.target.value)
                          }
                          className="w-full rounded-lg border border-yz-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-red-600"
                        >
                          <option value="">Choose a new status</option>

                          {STATUS_OPTIONS.filter(
                            (status) => status !== order.status
                          ).map((status) => (
                            <option key={status} value={status}>
                              {formatLabel(status)}
                            </option>
                          ))}
                        </select>

                        {nextStatus === "DELIVERED" && (
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={markAsPaid}
                              onChange={(event) =>
                                setMarkAsPaid(event.target.checked)
                              }
                              className="h-4 w-4 accent-brand-red-600"
                            />
                            Mark payment as paid
                          </label>
                        )}

                        {(nextStatus === "CANCELLED" ||
                          nextStatus === "RETURNED") && (
                          <div>
                            <label className="mb-1.5 block text-sm font-medium">
                              {nextStatus === "RETURNED"
                                ? "Return reason"
                                : "Cancellation reason"}
                            </label>

                            <textarea
                              value={reason}
                              onChange={(event) =>
                                setReason(event.target.value)
                              }
                              rows={2}
                              placeholder={
                                nextStatus === "RETURNED"
                                  ? "Enter the reason for return"
                                  : "Enter the reason for cancellation"
                              }
                              className="w-full rounded-lg border border-yz-border px-3 py-2 text-sm outline-none focus:border-brand-red-600"
                            />
                          </div>
                        )}

                        {nextStatus === "RETURNED" && (
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={restoreStock}
                              onChange={(event) =>
                                setRestoreStock(event.target.checked)
                              }
                              className="h-4 w-4 accent-brand-red-600"
                            />
                            Restore returned items to stock
                          </label>
                        )}

                        {updateStatus.isError && (
                          <p className="flex items-center gap-2 text-sm text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            {updateStatus.error?.message ||
                              "Failed to update order status."}
                          </p>
                        )}

                        {updateStatus.isSuccess && (
                          <p className="flex items-center gap-2 text-sm text-green-700">
                            <CheckCircle2 className="h-4 w-4" />
                            Status update completed.
                          </p>
                        )}

                        <button
                          type="submit"
                          disabled={
                            !nextStatus ||
                            updateStatus.isPending ||
                            ((nextStatus === "CANCELLED" ||
                              nextStatus === "RETURNED") &&
                              !reason.trim())
                          }
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {updateStatus.isPending && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                          Update status
                        </button>
                      </form>
                    )}
                  </section>
                </div>
              ) : (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  Order details are unavailable.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
