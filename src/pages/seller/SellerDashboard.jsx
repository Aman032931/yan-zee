
import { useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import {
  Package,
  CheckCircle2,
  PackageX,
  Plus,
  ArrowUpRight,
  Store,
  ShoppingBag,
  Boxes,
  ClipboardList,
  MapPin,
  AlertTriangle,
  RefreshCw,
  Clock,
  Settings,
} from "lucide-react"


import { useDashboardMetrics } from "../../hooks/useDashboardMetrics"
import { useOrders } from "../../hooks/useOrders"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../components/ui/alert"
import { Skeleton } from "../../components/ui/skeleton"

const LOW_STOCK_THRESHOLD = 5

function getProductStatus(product) {
  return String(product?.status || "")
    .toUpperCase()
    .replaceAll(" ", "_")
}




function getStockStatus(product) {
  const stockStatus = String(product.stockStatus || "")
    .toUpperCase()
    .replaceAll(" ", "_")

  const quantity = Number(product.quantity)

  if (
    ["OUT_OF_STOCK", "OUTOFSTOCK"].includes(stockStatus) ||
    (Number.isFinite(quantity) && product.quantity != null && quantity <= 0) ||
    ["OUT_OF_STOCK", "OUTOFSTOCK"].includes(getProductStatus(product))
  ) {
    return "Out of Stock"
  }

  if (
    ["LOW_STOCK", "LOWSTOCK"].includes(stockStatus) ||
    (
      Number.isFinite(quantity) &&
      product.quantity != null &&
      quantity > 0 &&
      quantity <= LOW_STOCK_THRESHOLD
    )
  ) {
    return "Low Stock"
  }

  return "In Stock"
}

function isProductOutOfStock(product) {
  return getStockStatus(product) === "Out of Stock"
}

function isProductLowStock(product) {
  return getStockStatus(product) === "Low Stock"
}

function getOrdersFromResponse(response) {
  const source = response?.data ?? response

  if (Array.isArray(source)) return source

  return (
    source?.orders ??
    source?.items ??
    source?.results ??
    []
  )
}

function getOrderCount(response, orders) {
  const source = response?.data ?? response

  const count =
    source?.pagination?.total ??
    source?.total ??
    source?.totalItems

  return count != null ? Number(count) : orders.length
}

function getOrderTotal(order) {
  return Number(
    order.total ??
    order.grandTotal ??
    order.amount ??
    0
  )
}

function formatMoney(value) {
  if (value == null || value === "") return "—"

  const amount = Number(value)

  if (!Number.isFinite(amount)) return "—"

  return `Rs. ${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`
}

function formatDate(value) {
  if (!value) return "—"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "—"

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatLabel(value) {
  return String(value || "Unknown")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function getOrderStatusVariant(status) {
  switch (String(status || "").toUpperCase()) {
    case "DELIVERED":
      return "success"

    case "PROCESSING":
      return "processing"

    case "CANCELLED":
      return "destructive"

    case "RETURNED":
      return "returned"

    default:
      return "secondary"
  }
}

function StatusBadge({ status }) {
  const variant = getOrderStatusVariant(status)

  const customStyles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    processing: "border-blue-200 bg-blue-50 text-blue-700",
    returned: "border-purple-200 bg-purple-50 text-purple-700",
  }

  return (
    <Badge
      variant={
        ["success", "processing", "returned"].includes(variant)
          ? "outline"
          : variant
      }
      className={customStyles[variant] || ""}
    >
      {formatLabel(status)}
    </Badge>
  )
}


function StatCard({
  title,
  value,
  description,
  icon: Icon,
  loading,
  tone,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-red-600 focus-visible:ring-offset-2"
    >
      <Card className="h-full rounded-xl border-yz-border shadow-sm transition-all duration-200 hover:shadow-md">
        <CardContent className="flex items-start justify-between gap-3 p-5">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>

            {loading ? (
              <Skeleton className="mt-3 h-9 w-20" />
            ) : (
              <p className="mt-3 text-3xl font-bold tracking-tight text-zinc-950">
                {value}
              </p>
            )}

            <p className="mt-2 text-xs text-muted-foreground">
              {description}
            </p>

            <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-brand-red-600">
              View details
              <ArrowUpRight className="h-3 w-3" />
            </p>
          </div>

          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </button>
  )
}

function QuickAction({ icon: Icon, title, description, onClick }) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className="group h-auto w-full justify-start gap-4 rounded-xl border-yz-border bg-white p-4 text-left hover:border-brand-red-600 hover:bg-red-50/30"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50 text-brand-red-600 transition-colors group-hover:bg-brand-red-600 group-hover:text-white">
        <Icon className="h-5 w-5" />
      </span>

      <span className="min-w-0 flex-1 whitespace-normal">
        <span className="block font-bold text-zinc-900">
          {title}
        </span>

        <span className="mt-1 block text-xs font-normal text-muted-foreground">
          {description}
        </span>
      </span>

      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-brand-red-600" />
    </Button>
  )
}

function AttentionItem({
  icon: Icon,
  title,
  description,
  action,
  onClick,
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-yz-border bg-white p-4 sm:flex-row sm:items-center">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-zinc-900">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onClick}
        className="shrink-0 border-brand-red-200 text-brand-red-600 hover:bg-red-50 hover:text-brand-red-700"
      >
        {action}
        <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
      </Button>
    </div>
  )
}


export default function SellerDashboard() {
  const navigate = useNavigate()
  const { shop, shopError } = useOutletContext()

  const storeId = shop?.id

  const {
    products = [],
    loading: productsLoading,
    error: productsError,
  } = useDashboardMetrics(storeId)

  // Fetch only the latest five orders for the dashboard.
  const ordersQuery = useOrders({
    storeId,
    page: 1,
    limit: 5,
  })

  // Separate query gives the processing count from the API.
  const processingOrdersQuery = useOrders({
    storeId,
    page: 1,
    limit: 1,
    status: "PROCESSING",
  })

  const orders = getOrdersFromResponse(ordersQuery.data)
  const recentOrders = orders.slice(0, 5)

  const totalOrders = getOrderCount(ordersQuery.data, orders)

  const processingOrders = getOrdersFromResponse(
    processingOrdersQuery.data
  )

  const processingCount = getOrderCount(
    processingOrdersQuery.data,
    processingOrders
  )


  const outOfStockProducts = products.filter(isProductOutOfStock)
  const lowStockProducts = products.filter(isProductLowStock)

  const outOfStockCount = outOfStockProducts.length
  const lowStockCount = lowStockProducts.length

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })


  const hasAttention =
    outOfStockCount > 0 ||
    lowStockCount > 0 ||
    processingCount > 0 ||
    (shop && !shop.isPublished)

  return (
    <div className="min-h-full space-y-8 bg-yz-bg p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <header className="relative overflow-hidden rounded-2xl bg-brand-red-600 p-6 text-white shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full border-[30px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-24 right-36 h-48 w-48 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/75">
              <Store className="h-4 w-4" />
              Seller Dashboard
            </div>

            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Welcome back{shop?.name ? `, ${shop.name}` : ""}
            </h1>

            <p className="mt-1.5 text-sm text-white/80">
              Here's what's happening with your shop today.
            </p>

            <p className="mt-3 text-xs font-medium text-white/70">
              {today}
            </p>
          </div>

          <Button
            onClick={() => navigate("/seller/products")}
            className="relative z-10 w-full bg-white font-bold text-brand-red-600 shadow-sm hover:bg-red-50 sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </header>

      {/* Overview Cards */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-950">
            Business Overview
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            A quick overview of your store.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Products"
            value={products.length}
            description="Products currently loaded"
            icon={Package}
            loading={productsLoading}
            tone="bg-red-50 text-brand-red-600"
            onClick={() => navigate("/seller/products")}
          />

          <StatCard
            title="Orders"
            value={totalOrders.toLocaleString("en-IN")}
            description="API total when available; otherwise latest 5"
            icon={ShoppingBag}
            loading={ordersQuery.isLoading}
            tone="bg-blue-50 text-blue-600"
            onClick={() => navigate("/seller/orders")}
          />

          <StatCard
            title="Processing Orders"
            value={processingCount.toLocaleString("en-IN")}
            description="Orders awaiting processing"
            icon={ShoppingBag}
            loading={processingOrdersQuery.isLoading}
            tone="bg-blue-50 text-blue-600"
            onClick={() => navigate("/seller/orders")}
          />

          <StatCard
            title="Out of Stock"
            value={outOfStockCount}
            description="Products needing restock"
            icon={PackageX}
            loading={productsLoading}
            tone="bg-orange-50 text-orange-600"
            onClick={() => navigate("/seller/inventory")}
          />
        </div>

        {productsError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Product information unavailable</AlertTitle>
            <AlertDescription>{productsError}</AlertDescription>
          </Alert>
        )}

        {ordersQuery.isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Order information unavailable</AlertTitle>
            <AlertDescription>
              {ordersQuery.error?.message || "Could not load recent orders."}
            </AlertDescription>
          </Alert>
        )}
      </section>

      {/* Needs Attention */}
      <section className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg font-bold tracking-tight text-zinc-950">
              Needs Attention
            </h2>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Important things that may need your attention.
          </p>
        </div>

        <div className="space-y-3">
          {!storeId ? (
            <Alert>
              <Store className="h-4 w-4" />
              <AlertTitle>No store selected</AlertTitle>
              <AlertDescription>
                Select a store to see its updates.
              </AlertDescription>
            </Alert>
          ) : productsLoading || ordersQuery.isLoading ? (
            <Card>
              <CardContent className="space-y-3 p-5">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-72 max-w-full" />
              </CardContent>
            </Card>
          ) : !hasAttention ? (
            <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <AlertTitle>You're all caught up!</AlertTitle>
              <AlertDescription className="text-emerald-700">
                No stock, order or store publishing issues found.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {outOfStockCount > 0 && (
                <AttentionItem
                  icon={PackageX}
                  title={`${outOfStockCount} product${outOfStockCount === 1 ? "" : "s"} out of stock`}
                  description="Review your inventory and update available quantities."
                  action="Manage Inventory"
                  onClick={() => navigate("/seller/inventory")}
                />
              )}

              {lowStockCount > 0 && (
                <AttentionItem
                  icon={AlertTriangle}
                  title={`${lowStockCount} product${lowStockCount === 1 ? "" : "s"} running low`}
                  description={`Products with ${LOW_STOCK_THRESHOLD} or fewer units remaining.`}
                  action="Manage Inventory"
                  onClick={() => navigate("/seller/inventory")}
                />
              )}

              {processingCount > 0 && (
                <AttentionItem
                  icon={ShoppingBag}
                  title={`${processingCount} order${processingCount === 1 ? "" : "s"} processing`}
                  description="Review orders that are currently being processed."
                  action="View Orders"
                  onClick={() => navigate("/seller/orders")}
                />
              )}

              {shop && !shop.isPublished && (
                <AttentionItem
                  icon={Store}
                  title="Your store is unpublished"
                  description="Your store is currently not published."
                  action="Store Settings"
                  onClick={() => navigate("/seller/settings")}
                />
              )}
            </>
          )}
        </div>
      </section>

      {/* Recent Orders */}
      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-zinc-950">
              Recent Orders
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              The latest orders placed in your store.
            </p>
          </div>

          <Button
            type="button"
            variant="link"
            onClick={() => navigate("/seller/orders")}
            className="h-auto justify-start p-0 font-bold text-brand-red-600 hover:text-brand-red-700 sm:justify-end"
          >
            View all orders
            <ArrowUpRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        <Card className="overflow-hidden rounded-xl border-yz-border shadow-sm">
          {ordersQuery.isLoading ? (
            <CardContent className="space-y-4 p-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48 max-w-full" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </CardContent>
          ) : ordersQuery.isError ? (
            <CardContent className="p-6 text-center">
              <p className="text-sm text-destructive">
                {ordersQuery.error?.message ||
                  "Failed to load recent orders."}
              </p>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => ordersQuery.refetch()}
                className="mt-3"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
            </CardContent>
          ) : recentOrders.length === 0 ? (
            <CardContent className="flex flex-col items-center justify-center p-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-50 text-brand-red-600">
                <ShoppingBag className="h-7 w-7" />
              </div>

              <h3 className="mt-4 font-bold text-zinc-900">
                No orders yet
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Your latest customer orders will appear here.
              </p>
            </CardContent>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {recentOrders.map((order, index) => {
                      const orderId =
                        order.id ??
                        order._id ??
                        order.orderId ??
                        `order-${index}`

                      const customerName =
                        order.customerName ??
                        order.customer?.name ??
                        order.customer?.fullName ??
                        "Unknown customer"

                      const orderNumber =
                        order.orderNumber ??
                        String(orderId).slice(-8)

                      return (
                        <TableRow key={orderId}>
                          <TableCell className="font-semibold">
                            #{orderNumber}
                          </TableCell>

                          <TableCell>{customerName}</TableCell>

                          <TableCell className="text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </TableCell>

                          <TableCell>
                            <StatusBadge status={order.status} />
                          </TableCell>

                          <TableCell className="text-right font-semibold">
                            {formatMoney(getOrderTotal(order))}
                          </TableCell>

                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate("/seller/orders")}
                              aria-label="View orders"
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile order layout */}
              <div className="divide-y divide-yz-border md:hidden">
                {recentOrders.map((order, index) => {
                  const orderId =
                    order.id ??
                    order._id ??
                    order.orderId ??
                    `order-${index}`

                  const customerName =
                    order.customerName ??
                    order.customer?.name ??
                    order.customer?.fullName ??
                    "Unknown customer"

                  const orderNumber =
                    order.orderNumber ??
                    String(orderId).slice(-8)

                  return (
                    <div
                      key={orderId}
                      className="flex items-center gap-3 p-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-brand-red-600">
                        <ShoppingBag className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-zinc-900">
                          Order #{orderNumber}
                        </p>

                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {customerName}
                        </p>

                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="font-semibold text-zinc-900">
                          {formatMoney(getOrderTotal(order))}
                        </p>

                        <div className="mt-1">
                          <StatusBadge status={order.status} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>


              <div className="border-t border-yz-border p-3 text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate("/seller/orders")}
                  className="font-semibold text-brand-red-600 hover:bg-red-50 hover:text-brand-red-700"
                >
                  Manage all orders
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </Card>
      </section>

      {/* My Shop */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-950">
            My Shop
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Your currently selected store.
          </p>
        </div>

        <Card className="rounded-xl border-yz-border shadow-sm">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-red-50 text-brand-red-600">
              <Store className="h-7 w-7" />
            </div>

            <div className="min-w-0 flex-1">
              {shopError ? (
                <p className="text-sm font-medium text-destructive">
                  {shopError}
                </p>
              ) : (
                <>
                  <h3 className="truncate font-bold text-zinc-950">
                    {shop?.name || "No shop selected"}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {shop
                      ? "Your store is ready to manage."
                      : "Select or create a shop to get started."}
                  </p>
                </>
              )}
            </div>

            {shop && (
              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  variant="outline"
                  className={
                    shop.isPublished
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }
                >
                  <span
                    className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                      shop.isPublished ? "bg-emerald-500" : "bg-red-500"
                    }`}
                  />
                  {shop.isPublished ? "Published" : "Unpublished"}
                </Badge>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/seller/settings")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Quick Actions */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-950">
            Manage Your Shop
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Quickly access your store management pages.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <QuickAction
            icon={Package}
            title="Products"
            description="Add, edit, and manage your products."
            onClick={() => navigate("/seller/products")}
          />

          <QuickAction
            icon={Boxes}
            title="Inventory"
            description="Manage stock and product quantities."
            onClick={() => navigate("/seller/inventory")}
          />

          <QuickAction
            icon={ClipboardList}
            title="Orders"
            description="View and manage customer orders."
            onClick={() => navigate("/seller/orders")}
          />

          <QuickAction
            icon={MapPin}
            title="Outlets"
            description="Manage your store locations."
            onClick={() => navigate("/seller/outlets")}
          />
        </div>
      </section>
    </div>
  )
}
