import { useEffect, useState } from "react"
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"

import {
  useInventoryOverview,
  useInventoryMovements,
  useProductBatches,
} from "../../hooks/useInventory"

// Money values come from the API as text, e.g. "459960.65".
const money = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? `Nrs ${number.toLocaleString()}` : "—"
}

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString() : "—"

const cardClass = "rounded-xl border border-yz-border bg-yz-bg p-5"

/* ---------------- Overview cards ---------------- */
export function InventoryOverview({ storeId, outletId = "" }) {
  const { data: response, isLoading, isError, error } = useInventoryOverview({
    storeId,
    outletId,
  })

  if (!storeId) return null

  if (isError) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <AlertCircle size={16} />
        {error?.message || "Could not load the inventory overview."}
      </div>
    )
  }

  const data = response?.data
  const value = data?.inventoryValue ?? {}

  const show = (text) => (isLoading ? "—" : text)

  const cards = [
    {
      label: "Selling value",
      value: show(money(value.sellingValue)),
      hint: `${value.totalProducts ?? 0} items in stock`,
    },
    {
      label: "Cost value",
      value: show(money(value.costValue)),
      hint: "What your current stock cost",
    },
    {
      label: "Potential profit",
      value: show(money(value.potentialProfit)),
      hint: "Selling value minus cost",
    },
    {
      label: "Units in stock",
      value: show(Number(value.totalQuantity ?? 0).toLocaleString()),
      hint: outletId ? "In the selected outlet" : "Across all active outlets",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className={cardClass}>
          <p className="text-sm text-muted-foreground">{card.label}</p>
          <p className="mt-3 text-2xl font-semibold text-foreground">
            {card.value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
        </div>
      ))}
    </div>
  )
}

/* ---------------- Batches (opens under a stock row) ---------------- */
export function BatchesRow({
  storeId,
  productId,
  variantId,
  outletId = "",
  colSpan = 4,
}) {
  const { data: response, isLoading, isError, error } = useProductBatches({
    storeId,
    productId,
  })

  const data = response?.data
  const variants = Array.isArray(data?.variants) ? data.variants : []

  // Products with variants group batches per variant; show just this variant's.
  // (Assumes products without variants return a flat `batches` list.)
  const allBatches =
    variants.length > 0
      ? variantId
        ? (variants.find((v) => v.variantId === variantId)?.batches ?? [])
        : variants.flatMap((v) => v.batches ?? [])
      : Array.isArray(data?.batches)
        ? data.batches
        : []

  // The batches endpoint returns every outlet, so filter by the selected one.
  const batches = outletId
    ? allBatches.filter(
        (batch) => (batch.outlet?.id ?? batch.outletId) === outletId
      )
    : allBatches

  return (
    <tr className="bg-muted/20">
      <td colSpan={colSpan} className="px-5 py-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading batches...</p>
        ) : isError ? (
          <p className="text-sm text-red-600">
            {error?.message || "Could not load batches."}
          </p>
        ) : batches.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No batches found for this item.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4 font-medium">Batch</th>
                  <th className="py-2 pr-4 font-medium">Outlet</th>
                  <th className="py-2 pr-4 font-medium">Received</th>
                  <th className="py-2 pr-4 font-medium">Remaining</th>
                  <th className="py-2 pr-4 font-medium">Unit cost</th>
                  <th className="py-2 pr-4 font-medium">Total cost</th>
                  <th className="py-2 pr-4 font-medium">Expiry</th>
                  <th className="py-2 font-medium">Added</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-yz-border">
                {batches.map((batch) => (
                  <tr key={batch.id}>
                    <td className="py-2 pr-4 font-medium text-foreground">
                      {batch.batchLabel ?? batch.batchNumber ?? "—"}
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {batch.outlet?.name ?? "—"}
                    </td>
                    <td className="py-2 pr-4">{batch.stock?.received ?? "—"}</td>
                    <td className="py-2 pr-4">
                      {batch.stock?.remaining ?? "—"}
                    </td>
                    <td className="py-2 pr-4">{money(batch.unitCost)}</td>
                    <td className="py-2 pr-4">{money(batch.totalCost)}</td>
                    <td className="py-2 pr-4">{formatDate(batch.expiryDate)}</td>
                    <td className="py-2">{formatDate(batch.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </td>
    </tr>
  )
}

/* ---------------- Stock movements ---------------- */
const MOVEMENTS_PAGE_SIZE = 10

export function InventoryMovements({ storeId, outletId = "" }) {
  const [page, setPage] = useState(1)

  // Go back to page 1 when the outlet changes, so we never land on a page
  // that doesn't exist for the new filter.
  useEffect(() => {
    setPage(1)
  }, [outletId])

  const {
    data: response,
    isLoading,
    isError,
    error,
    isFetching,
  } = useInventoryMovements({
    storeId,
    outletId,
    page,
    limit: MOVEMENTS_PAGE_SIZE,
  })

  if (!storeId) return null

  const movements = response?.data?.movements ?? []
  const pagination = response?.data?.pagination ?? {}
  const totalPages = Number(pagination.totalPages) || 1

  return (
    <div className="rounded-xl border border-yz-border bg-yz-bg">
      <div className="border-b border-yz-border p-4">
        <h2 className="text-base font-semibold text-foreground">
          Stock movements
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Stock received and moved for this store.
        </p>
      </div>

      {isLoading ? (
        <div className="p-10 text-center text-sm text-muted-foreground">
          Loading movements...
        </div>
      ) : isError ? (
        <div className="p-8 text-center text-sm text-red-600">
          {error?.message || "Could not load stock movements."}
        </div>
      ) : movements.length === 0 ? (
        <div className="p-10 text-center text-sm text-muted-foreground">
          No stock movements yet.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Reference</th>
                  <th className="px-5 py-3 font-medium">Outlet</th>
                  <th className="px-5 py-3 font-medium">Products</th>
                  <th className="px-5 py-3 font-medium">Quantity</th>
                  <th className="px-5 py-3 font-medium">Value</th>
                  <th className="px-5 py-3 font-medium">By</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-yz-border">
                {movements.map((movement) => (
                  <tr key={movement.id} className="transition hover:bg-muted/30">
                    <td className="px-5 py-4 text-muted-foreground">
                      {formatDate(movement.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          movement.type === "STOCK_IN"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {String(movement.type ?? "").replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {movement.referenceNumber ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-foreground">
                      {movement.outlet?.name ?? "—"}
                      {movement.otherOutlet?.name && (
                        <span className="text-muted-foreground">
                          {" → "}
                          {movement.otherOutlet.name}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">{movement.totalProducts ?? "—"}</td>
                    <td className="px-5 py-4">{movement.totalQuantity ?? "—"}</td>
                    <td className="px-5 py-4">{money(movement.totalValue)}</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {movement.performedBy?.fullName ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-yz-border px-4 py-3">
            <p className="text-sm text-muted-foreground">Page {page}</p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((current) => current - 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-yz-border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <button
                type="button"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((current) => current + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-yz-border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}