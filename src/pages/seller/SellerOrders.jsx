
import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ShoppingBag, RefreshCw } from "lucide-react";

import {
  DataCard,
  EmptyState,
  PageHeader,
  PageShell,
} from "../../components/seller/SellerUI";

import { useOrders } from "../../hooks/useOrders";

export default function SellerOrders() {
  const { shop } = useOutletContext();

  const [query, setQuery] = useState("");

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useOrders({
    storeId: shop?.id,
    page: 1,
    limit: 20,
    search: query,
  });

  // API responses can wrap the order list in different objects.
  // Keep this mapping defensive until we confirm the actual response.
  const responseData = data?.data ?? data;

  const orders = Array.isArray(responseData)
    ? responseData
    : responseData?.orders ??
      responseData?.items ??
      responseData?.results ??
      [];

  const total =
    responseData?.total ??
    responseData?.totalItems ??
    responseData?.pagination?.total ??
    orders.length;

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
        {!shop?.id ? (
          <EmptyState
            icon={ShoppingBag}
            title="No store selected"
            text="Select a store from the sidebar to view its orders."
          />
        ) : isLoading ? (
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
                className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title={query ? "No matching orders" : "No orders yet"}
            text={
              query
                ? "Try another search term."
                : "Orders will appear here when customers place orders."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead>
                <tr className="border-b border-yz-border text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order, index) => {
                  const orderId =
                    order.id ??
                    order._id ??
                    order.orderId ??
                    `order-${index}`;

                  const customer =
                    order.customer?.fullName ??
                    order.customer?.name ??
                    order.customerName ??
                    order.shippingAddress?.fullName ??
                    "—";

                  const status =
                    order.status ??
                    order.orderStatus ??
                    "Unknown";

                  const totalAmount =
                    order.totalAmount ??
                    order.total ??
                    order.grandTotal;

                  return (
                    <tr
                      key={orderId}
                      className="border-b border-yz-border last:border-0"
                    >
                      <td className="px-4 py-4 font-medium">
                        #{String(order.orderNumber ?? orderId).slice(-12)}
                      </td>

                      <td className="px-4 py-4">{customer}</td>

                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full bg-yz-bg px-2.5 py-1 text-xs font-medium">
                          {String(status).replaceAll("_", " ")}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right font-medium">
                        {totalAmount != null
                          ? Number(totalAmount).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </DataCard>
    </PageShell>
  );
}
