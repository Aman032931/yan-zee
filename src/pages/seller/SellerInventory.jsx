import { useState } from "react"
import {
  Boxes,
  Search,
  RefreshCw,
  Package,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { useOutletContext } from "react-router-dom"
import { useInventoryStock } from "../../hooks/useInventory"

const PAGE_SIZE = 20

function getInventoryItems(response) {
  const data = response?.data

  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.stock)) return data.stock
  if (Array.isArray(data?.inventory)) return data.inventory
  if (Array.isArray(data?.stocks)) return data.stocks

  return []
}

function getPagination(response, itemCount, page) {
  const data = response?.data
  const pagination = data?.pagination ?? data?.meta ?? {}

  return {
    total: Number(pagination.total ?? pagination.totalItems ?? itemCount),
    totalPages: Number(
      pagination.totalPages ??
        pagination.pages ??
        (itemCount < PAGE_SIZE ? page : page + 1)
    ),
  }
}

function getProductName(item) {
  return (
    item?.product?.name ??
    item?.productName ??
    item?.name ??
    "Unnamed product"
  )
}

function getQuantity(item) {
  const value =
    item?.quantity ??
    item?.totalQuantity ??
    item?.stock ??
    item?.availableQuantity

  return value == null ? "—" : value
}

function getStatus(item) {
  const quantity = Number(getQuantity(item))
  const status = item?.status ?? item?.stockStatus

  if (status) return String(status).replaceAll("_", " ")
  if (Number.isFinite(quantity)) {
    if (quantity <= 0) return "OUT OF STOCK"
    if (quantity <= 5) return "LOW STOCK"
    return "IN STOCK"
  }

  return "UNKNOWN"
}

function statusClasses(status) {
  const value = status.toUpperCase()

  if (value.includes("OUT") || value.includes("EXPIRED")) {
    return "bg-red-50 text-red-700"
  }

  if (value.includes("LOW") || value.includes("EXPIRING")) {
    return "bg-amber-50 text-amber-700"
  }

  if (value.includes("IN STOCK") || value === "AVAILABLE") {
    return "bg-emerald-50 text-emerald-700"
  }

  return "bg-gray-100 text-gray-600"
}

export default function SellerInventory() {
  const outletContext = useOutletContext() ?? {}
  const { shop } = outletContext

  const storeId =
    shop?.id ??
    shop?._id ??
    localStorage.getItem("yanzee_store_id")

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)

  const {
    data: response,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useInventoryStock({
    storeId,
    page,
    limit: PAGE_SIZE,
    search,
    status,
  })

  const items = getInventoryItems(response)
  const pagination = getPagination(response, items.length, page)

  const changeSearch = (value) => {
    setSearch(value)
    setPage(1)
  }

  const changeStatus = (value) => {
    setStatus(value)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-red-600/10 text-brand-red-600">
            <Boxes size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Inventory
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Monitor stock levels for your selected store.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching || !storeId}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-yz-border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        >
          <RefreshCw
            size={16}
            className={isFetching ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-yz-border bg-yz-bg p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Inventory records
            </p>
            <Package size={19} className="text-muted-foreground" />
          </div>

          <p className="mt-3 text-2xl font-semibold text-foreground">
            {isLoading ? "—" : pagination.total}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Records matching your filters
          </p>
        </div>

        <div className="rounded-xl border border-yz-border bg-yz-bg p-5">
          <p className="text-sm text-muted-foreground">Current page</p>
          <p className="mt-3 text-2xl font-semibold text-foreground">
            {page}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {pagination.totalPages} page
            {pagination.totalPages === 1 ? "" : "s"} available
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-yz-border bg-yz-bg">
        <div className="flex flex-col gap-3 border-b border-yz-border p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => changeSearch(event.target.value)}
              placeholder="Search inventory..."
              className="h-10 w-full rounded-lg border border-yz-border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-brand-red-600"
            />
          </div>

          <select
            value={status}
            onChange={(event) => changeStatus(event.target.value)}
            className="h-10 rounded-lg border border-yz-border bg-background px-3 text-sm outline-none focus:border-brand-red-600"
          >
            <option value="">All status</option>
            <option value="IN_STOCK">In stock</option>
            <option value="LOW_STOCK">Low stock</option>
            <option value="OUT_OF_STOCK">Out of stock</option>
          </select>
        </div>

        {!storeId ? (
          <div className="p-10 text-center">
            <AlertCircle
              size={30}
              className="mx-auto mb-3 text-amber-600"
            />
            <p className="font-medium text-foreground">
              No store selected
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Select a store before viewing its inventory.
            </p>
          </div>
        ) : isLoading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Loading inventory...
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <AlertCircle
              size={30}
              className="mx-auto mb-3 text-red-600"
            />
            <p className="font-medium text-foreground">
              Could not load inventory
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {error?.message || "Something went wrong. Please try again."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-red-700"
            >
              Try again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center">
            <Boxes
              size={34}
              className="mx-auto mb-3 text-muted-foreground"
            />
            <p className="font-medium text-foreground">
              No inventory records found
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try another search or status filter, or check whether stock
              has been added for this store.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Product</th>
                    <th className="px-5 py-3 font-medium">Product Code</th>
                    <th className="px-5 py-3 font-medium">Quantity</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-yz-border">
                  {items.map((item, index) => {
                    const itemId =
                      item?.id ??
                      item?._id ??
                      item?.productId ??
                      item?.product?.id ??
                      `${getProductName(item)}-${index}`

                    const currentStatus = getStatus(item)

                    return (
                      <tr
                        key={itemId}
                        className="transition hover:bg-muted/30"
                      >
                        <td className="px-5 py-4 font-medium text-foreground">
                          {getProductName(item)}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {item?.sku ??
                            item?.product?.sku ??
                            item?.variant?.sku ??
                            "—"}
                        </td>
                        <td className="px-5 py-4 text-foreground">
                          {getQuantity(item)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(currentStatus)}`}
                          >
                            {currentStatus}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-yz-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page}
                {pagination.total > 0
                  ? ` · ${pagination.total} total records`
                  : ""}
              </p>

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
                  disabled={
                    isFetching ||
                    (pagination.totalPages > 0 &&
                      page >= pagination.totalPages) ||
                    (pagination.totalPages === 0 &&
                      items.length < PAGE_SIZE)
                  }
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
    </div>
  )
}