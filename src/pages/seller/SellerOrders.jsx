
import { useEffect, useState } from "react";
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
} from "../../hooks/useOrders";

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

export default function SellerOrders() {
  const { shop } = useOutletContext();
  const storeId = shop?.id;

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [nextStatus, setNextStatus] = useState("");
  const [reason, setReason] = useState("");
  const [markAsPaid, setMarkAsPaid] = useState(false);
  const [restoreStock, setRestoreStock] = useState(true);

  // Fetch orders
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

  // Fetch selected order details
  const {
    data: orderResponse,
    isLoading: isOrderLoading,
    isError: isOrderError,
    error: orderError,
    refetch: refetchOrder,
  } = useOrder(storeId, selectedOrderId);

  // Fetch outlets for the selected store
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

  // Extract order list
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

  // Extract selected order
  const order = getOrderFromResponse(orderResponse);

  const summary = order?.summary ?? {};
  const customer = order?.customer ?? {};
  const items = summary?.items ?? [];
  const activities = order?.activities ?? [];
  const stockMovements = order?.stockMovements ?? [];

  // Match the order outlet with the outlet list
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
            {/* Filters */}
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
              </select>

              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-yz-border px-3 py-2 text-sm font-medium transition hover:bg-yz-bg disabled:opacity-50 sm:ml-auto"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    isFetching ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>
            </div>

            {/* Orders loading */}
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
                  <RefreshCw
                    className={`h-4 w-4 ${
                      isFetching ? "animate-spin" : ""
                    }`}
                  />
                  Try again
                </button>
              </div>
            ) : orders.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title={
                  query ||
                  statusFilter ||
                  channelFilter !== "ALL"
                    ? "No matching orders"
                    : "No orders yet"
                }
                text="Try changing your search or filters."
              />
            ) : (
              <>
                {/* Orders table */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[750px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-yz-border text-muted-foreground">
                        <th className="px-4 py-3 font-medium">
                          Order
                        </th>
                        <th className="px-4 py-3 font-medium">
                          Customer
                        </th>
                        <th className="px-4 py-3 font-medium">
                          Channel
                        </th>
                        <th className="px-4 py-3 font-medium">
                          Date
                        </th>
                        <th className="px-4 py-3 font-medium">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right font-medium">
                          Total
                        </th>
                        <th className="px-4 py-3 text-right font-medium">
                          Action
                        </th>
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

                            <td className="px-4 py-4">
                              {customerName}
                            </td>

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
                                onClick={() =>
                                  setSelectedOrderId(orderId)
                                }
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

                {/* Pagination */}
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
            {/* Popup header */}
            <div className="flex items-center justify-between border-b border-yz-border px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold">
                  Order Details
                </h2>
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
                    {orderError?.message ||
                      "Failed to load order details."}
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
                  {/* Order heading */}
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

                  {/* Customer and payment */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <section className="rounded-xl border border-yz-border p-4">
                      <div className="mb-3 flex items-center gap-2 font-semibold">
                        <User className="h-4 w-4" />
                        Customer
                      </div>

                      <p className="font-medium">
                        {customer.name || "—"}
                      </p>

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
                          <span className="text-muted-foreground">
                            Method
                          </span>
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
                          <span className="font-medium">
                            Order total
                          </span>
                          <span className="font-semibold">
                            {formatMoney(summary.total ?? order.total)}
                          </span>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* Products */}
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
                                  Discount:{" "}
                                  {formatMoney(item.discount.amount)}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>

                  {/* Price breakdown */}
                  <section className="rounded-xl border border-yz-border p-4">
                    <h4 className="mb-3 font-semibold">
                      Price summary
                    </h4>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Subtotal
                        </span>
                        <span>{formatMoney(summary.subtotal)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Item discount
                        </span>
                        <span>
                          {formatMoney(summary.itemDiscount)}
                        </span>
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
                          {formatMoney(
                            summary.coupon?.discountAmount ?? 0
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Delivery fee
                        </span>
                        <span>
                          {formatMoney(summary.deliveryFee)}
                        </span>
                      </div>

                      <div className="flex justify-between border-t border-yz-border pt-3 text-base font-semibold">
                        <span>Total</span>
                        <span>
                          {formatMoney(summary.total ?? order.total)}
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Order outlet */}
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
                          <p className="font-medium">
                            {orderOutlet.name}
                          </p>

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
                          {order.placedAt?.name || "Outlet information unavailable"}
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

                  {/* Stock movements */}
                  {stockMovements.length > 0 && (
                    <section>
                      <h4 className="mb-3 font-semibold">
                        Stock movements
                      </h4>

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

                  {/* Activity */}
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

                  {/* Update status */}
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
                          <option value="">
                            Choose a new status
                          </option>

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
