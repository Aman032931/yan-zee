import { useMemo, useState } from "react"
import { useOutletContext } from "react-router-dom"
import { Boxes, BarChart3, TrendingUp, Store, AlertTriangle } from "lucide-react"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"

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
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"
import { Skeleton } from "../../components/ui/skeleton"

const LOW_STOCK_THRESHOLD = 5

function getProductStatus(product) {
  return String(product?.status || "")
    .toUpperCase()
    .replaceAll(" ", "_")
}
const CHART_COLORS = {
  red: "#dc2626",
  blue: "#3b82f6",
  green: "#10b981",
  orange: "#f59e0b",
  purple: "#8b5cf6",
  gray: "#94a3b8",
}
const STATUS_COLORS = {
  PENDING: "#f59e0b",
  PROCESSING: "#3b82f6",
  SHIPPED: "#8b5cf6",
  DELIVERED: "#10b981",
  CANCELLED: "#ef4444",
  RETURNED: "#64748b",
}
const INVENTORY_COLORS = {
  "In Stock": "#10b981",
  "Low Stock": "#f59e0b",
  "Out of Stock": "#ef4444",
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

function formatLabel(value) {
  return String(value || "Unknown")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function getLocalDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function getTrendData(orders, period) {
  const now = new Date()
  const buckets = []

  if (period === "daily") {
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)

      buckets.push({
        key: getLocalDateKey(date),
        label: date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        }),
        revenue: 0,
        orders: 0,
      })
    }
  } else if (period === "weekly") {
    for (let i = 7; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(now.getDate() - now.getDay() - i * 7)

      const endDate = new Date(date)
      endDate.setDate(date.getDate() + 6)

      buckets.push({
        key: getLocalDateKey(date),
        label: `${date.getDate()} ${date.toLocaleDateString("en-IN", {
          month: "short",
        })}`,
        endKey: getLocalDateKey(endDate),
        revenue: 0,
        orders: 0,
      })
    }
  } else {
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)

      buckets.push({
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
        label: date.toLocaleDateString("en-IN", {
          month: "short",
          year: "2-digit",
        }),
        revenue: 0,
        orders: 0,
      })
    }
  }

  orders.forEach((order) => {
    if (!order.createdAt) return

    const date = new Date(order.createdAt)

    if (Number.isNaN(date.getTime())) return

    let bucket

    if (period === "daily") {
      const key = getLocalDateKey(date)
      bucket = buckets.find((item) => item.key === key)
    } else if (period === "weekly") {
      const key = getLocalDateKey(date)

      bucket = buckets.find(
        (item) => key >= item.key && key <= item.endKey
      )
    } else {
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      bucket = buckets.find((item) => item.key === key)
    }

    if (!bucket) return

    bucket.orders += 1

    if (String(order.status || "").toUpperCase() === "DELIVERED") {
      bucket.revenue += getOrderTotal(order)
    }
  })

  return buckets
}

function ChartEmptyState({ message = "No data available yet." }) {
  return (
    <div className="flex h-[260px] items-center justify-center text-center text-sm text-muted-foreground">
      {message}
    </div>
  )
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-yz-border bg-white p-3 shadow-lg">
      <p className="mb-2 text-sm font-semibold text-zinc-900">
        {label}
      </p>

      {payload.map((item) => (
        <p
          key={item.dataKey}
          className="text-sm"
          style={{ color: item.color }}
        >
          {item.name}:{" "}
          {item.dataKey === "revenue"
            ? formatMoney(item.value)
            : Number(item.value).toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  )
}

export default function SellerAnalytics() {
  const { shop } = useOutletContext()
  const [trendPeriod, setTrendPeriod] = useState("daily")
  const storeId = shop?.id

  const {
    products = [],
    loading: productsLoading,
    error: productsError,
  } = useDashboardMetrics(storeId)

  // Analytics data is fetched only while this page is mounted.
  // Current API limitation: charts use the latest 100 orders returned.
  const ordersQuery = useOrders({
    storeId,
    page: 1,
    limit: 100,
  })

  const orders = getOrdersFromResponse(ordersQuery.data)

  const trendData = useMemo(
    () => getTrendData(orders, trendPeriod),
    [orders, trendPeriod]
  )

  const orderStatusData = useMemo(() => {
    const counts = {}
    orders.forEach((order) => {
      const status = String(order.status || "UNKNOWN").toUpperCase()
      counts[status] = (counts[status] || 0) + 1
    })
    return Object.entries(counts).map(([status, count]) => ({
      name: formatLabel(status),
      value: count,
      color: STATUS_COLORS[status] || CHART_COLORS.gray,
    }))
  }, [orders])

  const inventoryData = useMemo(() => {
    const counts = { "In Stock": 0, "Low Stock": 0, "Out of Stock": 0 }
    products.forEach((product) => {
      counts[getStockStatus(product)] += 1
    })
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: INVENTORY_COLORS[name],
    }))
  }, [products])

  const channelData = useMemo(() => {
    const counts = {}
    orders.forEach((order) => {
      const channel = String(order.channel || "UNKNOWN").toUpperCase()
      if (!counts[channel]) counts[channel] = { channel, revenue: 0, orders: 0 }
      counts[channel].orders += 1
      if (String(order.status || "").toUpperCase() === "DELIVERED") {
        counts[channel].revenue += getOrderTotal(order)
      }
    })
    return Object.values(counts)
  }, [orders])

  const isLoading = ordersQuery.isLoading || productsLoading

  return (
    <div className="min-h-full space-y-6 bg-yz-bg">
      <header>
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-red-600">
          <BarChart3 className="h-4 w-4" />
          Seller workspace
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Explore your store's orders, revenue trends, sales channels, and inventory.
        </p>
        {shop?.name && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
            <Store className="h-3.5 w-3.5" />
            {shop.name}
          </p>
        )}
      </header>

      {!storeId ? (
        <Alert>
          <Store className="h-4 w-4" />
          <AlertTitle>No store selected</AlertTitle>
          <AlertDescription>Select a store to view its analytics.</AlertDescription>
        </Alert>
      ) : (
        <>
          {(productsError || ordersQuery.isError) && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Some analytics data could not be loaded</AlertTitle>
              <AlertDescription>
                {productsError || ordersQuery.error?.message || "Please try again."}
              </AlertDescription>
            </Alert>
          )}

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Order charts currently use the latest 100 orders returned by the API.
            Revenue is calculated from delivered orders in that loaded data, not guaranteed lifetime revenue.
          </div>

      {/* Revenue and Orders Trend */}
      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-zinc-950">
              <TrendingUp className="h-5 w-5 text-brand-red-600" />
              Revenue & Orders Trend
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Delivered revenue and orders received over time.
            </p>
          </div>

          <div className="flex gap-1 rounded-lg border border-yz-border bg-white p-1">
            {["daily", "weekly", "monthly"].map((period) => (
              <Button
                key={period}
                type="button"
                size="sm"
                variant={trendPeriod === period ? "default" : "ghost"}
                onClick={() => setTrendPeriod(period)}
                className={
                  trendPeriod === period
                    ? "bg-brand-red-600 text-white hover:bg-brand-red-700"
                    : "text-muted-foreground"
                }
              >
                {formatLabel(period)}
              </Button>
            ))}
          </div>
        </div>

        <Card className="rounded-xl border-yz-border shadow-sm">
          <CardContent className="p-4 pt-6 sm:p-6">
            {ordersQuery.isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : trendData.every((item) => item.orders === 0) ? (
              <ChartEmptyState message="No orders found for this period." />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={trendData}
                  margin={{ top: 10, right: 10, left: 5, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e7eb"
                  />

                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    yAxisId="revenue"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) =>
                      value >= 1000
                        ? `${(value / 1000).toFixed(0)}k`
                        : value
                    }
                  />

                  <YAxis
                    yAxisId="orders"
                    orientation="right"
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip content={<ChartTooltip />} />
                  <Legend />

                  <Line
                    yAxisId="revenue"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke={CHART_COLORS.red}
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />

                  <Line
                    yAxisId="orders"
                    type="monotone"
                    dataKey="orders"
                    name="Orders"
                    stroke={CHART_COLORS.blue}
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Order Status and Inventory */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">

        {/* Order Status */}
        <Card className="rounded-xl border-yz-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-5 w-5 text-brand-red-600" />
              Order Status Distribution
            </CardTitle>

            <CardDescription>
              Breakdown of your order statuses.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {ordersQuery.isLoading ? (
              <Skeleton className="h-[260px] w-full" />
            ) : orderStatusData.length === 0 ? (
              <ChartEmptyState message="No orders available to display." />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {orderStatusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Inventory Overview */}
        <Card className="rounded-xl border-yz-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Boxes className="h-5 w-5 text-brand-red-600" />
              Inventory Overview
            </CardTitle>

            <CardDescription>
              Stock availability across your products.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {productsLoading ? (
              <Skeleton className="h-[260px] w-full" />
            ) : products.length === 0 ? (
              <ChartEmptyState message="No products available to display." />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={inventoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {inventoryData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}

            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-yz-border pt-4 text-center">
              <div>
                <p className="text-xl font-bold text-emerald-600">
                  {inventoryData[0]?.value ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">In Stock</p>
              </div>

              <div>
                <p className="text-xl font-bold text-orange-600">
                  {inventoryData[1]?.value ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Low Stock</p>
              </div>

              <div>
                <p className="text-xl font-bold text-red-600">
                  {inventoryData[2]?.value ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Out of Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Sales by Channel */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-950">
            Sales by Channel
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Compare delivered revenue across your sales channels.
          </p>
        </div>

        <Card className="rounded-xl border-yz-border shadow-sm">
          <CardContent className="p-4 pt-6 sm:p-6">
            {ordersQuery.isLoading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : channelData.length === 0 ? (
              <ChartEmptyState message="No channel data available yet." />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={channelData}
                  margin={{ top: 10, right: 10, left: 5, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e7eb"
                  />

                  <XAxis
                    dataKey="channel"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) =>
                      value >= 1000
                        ? `${(value / 1000).toFixed(0)}k`
                        : value
                    }
                  />

                  <Tooltip
                    formatter={(value, name) =>
                      name === "Revenue"
                        ? formatMoney(value)
                        : Number(value).toLocaleString("en-IN")
                    }
                  />

                  <Legend />

                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill={CHART_COLORS.red}
                    radius={[6, 6, 0, 0]}
                  />

                  <Bar
                    dataKey="orders"
                    name="Orders"
                    fill={CHART_COLORS.blue}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </section>


        </>
      )}
    </div>
  )
}
