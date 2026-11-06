import { useMemo } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

// ASSUMPTION: the movements hook is named useInventoryMovements.
// If yours has a different name, change it here and in the call below.
import {
  useInventoryStock,
  useInventoryMovements,
} from "../../hooks/useInventory"
import { useOutlets } from "../../hooks/useOutlets"

/* ---------- Look and feel ---------- */
const BLUE = "#2a78d6"
const STATUS_COLORS = {
  "In stock": "#0ca30c",
  "Low stock": "#fab219",
  "Out of stock": "#d03b3b",
}
const TICK = { fontSize: 11, fill: "#71717a" }
const TOOLTIP_STYLE = {
  fontSize: 12,
  borderRadius: 8,
  border: "1px solid #e4e4e7",
}
const CHART_HEIGHT = 220
const WEEKS = 8

/* ---------- Data adapters ----------
   If a chart shows no data, these are the lines to adjust. */
const num = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0)

function getList(response, keys) {
  const data = response?.data

  if (Array.isArray(data)) return data

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key]
  }

  return []
}

const getName = (item) =>
  item?.product?.name ?? item?.productName ?? item?.name ?? "Unnamed product"

const getQuantity = (item) =>
  num(
    item?.quantity ??
      item?.totalQuantity ??
      item?.stock ??
      item?.availableQuantity
  )

function getStatusLabel(item) {
  const raw = String(item?.status ?? item?.stockStatus ?? "").toUpperCase()

  if (raw.includes("OUT")) return "Out of stock"
  if (raw.includes("LOW")) return "Low stock"
  if (raw.includes("IN")) return "In stock"

  const quantity = getQuantity(item)
  if (quantity <= 0) return "Out of stock"
  if (quantity <= 5) return "Low stock"
  return "In stock"
}

// ASSUMPTION: cost value is either a ready-made field or quantity x unit cost.
function getStockValue(item) {
  const direct =
    item?.stockValue ?? item?.costValue ?? item?.totalCost ?? item?.totalValue

  if (direct != null) return num(direct)

  const unit =
    item?.unitCost ?? item?.costPrice ?? item?.averageCost ?? item?.cost

  return getQuantity(item) * num(unit)
}

// ASSUMPTION: each stock item has an `outlets` array with per-outlet quantity.
const getOutletQuantity = (entry) =>
  num(entry?.quantity ?? entry?.totalQuantity ?? entry?.stock)

// ASSUMPTION: movement rows carry a date, a type and a quantity.
const getMoveDate = (move) =>
  move?.createdAt ?? move?.date ?? move?.movementDate
const getMoveQuantity = (move) => num(move?.totalQuantity ?? move?.quantity)
const isStockIn = (move) =>
  String(move?.type ?? move?.movementType ?? "STOCK_IN")
    .toUpperCase()
    .includes("IN")

function startOfWeek(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}

function buildWeeks(movements) {
  const current = startOfWeek(new Date())
  const buckets = []

  for (let i = WEEKS - 1; i >= 0; i -= 1) {
    const start = new Date(current)
    start.setDate(start.getDate() - i * 7)

    buckets.push({
      key: start.getTime(),
      label: start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      units: 0,
    })
  }

  const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]))

  movements.filter(isStockIn).forEach((move) => {
    const date = getMoveDate(move)
    if (!date || Number.isNaN(new Date(date).getTime())) return

    const bucket = byKey.get(startOfWeek(date).getTime())
    if (bucket) bucket.units += getMoveQuantity(move)
  })

  return buckets
}

const shorten = (text, max = 16) =>
  text.length > max ? `${text.slice(0, max - 1)}…` : text

const compact = (value) => (value >= 1000 ? `${value / 1000}k` : value)

/* ---------- Card wrapper ---------- */
function ChartCard({ title, subtitle, loading, empty, emptyText, children }) {
  return (
    <div className="rounded-xl border border-yz-border bg-yz-bg p-5">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>

      <div className="mt-4">
        {loading ? (
          <div
            className="animate-pulse rounded-lg bg-muted/40"
            style={{ height: CHART_HEIGHT }}
          />
        ) : empty ? (
          <div
            className="flex items-center justify-center text-sm text-muted-foreground"
            style={{ height: CHART_HEIGHT }}
          >
            {emptyText}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

/* ---------- Main component ---------- */
export default function InventoryCharts({ storeId, outletId }) {
  const { data: stockResponse, isLoading: loadingStock } = useInventoryStock({
    storeId,
    page: 1,
    limit: 100,
    outletId,
  })

  const { data: movementsResponse, isLoading: loadingMoves } =
    useInventoryMovements({
      storeId,
      page: 1,
      limit: 100,
      outletId,
    })

  const { data: outlets } = useOutlets(storeId)

  const items = useMemo(
    () => getList(stockResponse, ["items", "stock", "inventory", "stocks"]),
    [stockResponse]
  )

  const movements = useMemo(
    () => getList(movementsResponse, ["items", "movements"]),
    [movementsResponse]
  )

  const weeklyData = useMemo(() => buildWeeks(movements), [movements])

  const outletData = useMemo(() => {
    const totals = {}

    items.forEach((item) => {
      ;(item?.outlets ?? []).forEach((entry) => {
        if (outletId && entry.outletId !== outletId) return

        totals[entry.outletId] =
          (totals[entry.outletId] ?? 0) + getOutletQuantity(entry)
      })
    })

    const names = Object.fromEntries(
      (outlets ?? []).map((outlet) => [outlet.id, outlet.name])
    )

    return Object.entries(totals)
      .map(([id, units]) => ({ name: names[id] ?? "Unknown outlet", units }))
      .sort((a, b) => b.units - a.units)
  }, [items, outlets, outletId])

  const topProducts = useMemo(
    () =>
      items
        .map((item) => ({ name: getName(item), value: getStockValue(item) }))
        .filter((row) => row.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
    [items]
  )

  const statusData = useMemo(() => {
    const counts = { "In stock": 0, "Low stock": 0, "Out of stock": 0 }

    items.forEach((item) => {
      counts[getStatusLabel(item)] += 1
    })

    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [items])

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Row 1, left: stock received */}
      <ChartCard
        title="Stock received"
        subtitle="Units added per week"
        loading={loadingMoves}
        empty={!weeklyData.some((week) => week.units > 0)}
        emptyText="No stock received in the last 8 weeks."
      >
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <AreaChart
            data={weeklyData}
            margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="#e4e4e7" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={TICK}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={TICK}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value) => [value.toLocaleString(), "Units received"]}
              labelFormatter={(label) => `Week of ${label}`}
            />
            <Area
              type="monotone"
              dataKey="units"
              stroke={BLUE}
              strokeWidth={2}
              fill={BLUE}
              fillOpacity={0.1}
              dot={{ r: 3, fill: BLUE, stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Row 1, right: stock by outlet */}
      <ChartCard
        title="Stock by outlet"
        subtitle="Units held at each outlet"
        loading={loadingStock}
        empty={outletData.length === 0}
        emptyText="No outlet stock to show yet."
      >
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <BarChart
            data={outletData}
            margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="#e4e4e7" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={TICK}
              tickFormatter={(name) => shorten(name, 12)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={TICK}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              contentStyle={TOOLTIP_STYLE}
              formatter={(value) => [value.toLocaleString(), "Units"]}
            />
            <Bar
              dataKey="units"
              fill={BLUE}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Row 2, left: top products by stock value */}
      <ChartCard
        title="Top products by stock value"
        subtitle="Where your money is tied up (Nrs)"
        loading={loadingStock}
        empty={topProducts.length === 0}
        emptyText="No stock value to show yet."
      >
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <BarChart
            data={topProducts}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} stroke="#e4e4e7" />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={TICK}
              tickFormatter={compact}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tickLine={false}
              axisLine={false}
              tick={TICK}
              tickFormatter={(name) => shorten(name, 16)}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              contentStyle={TOOLTIP_STYLE}
              formatter={(value) => [
                `Nrs ${value.toLocaleString()}`,
                "Stock value",
              ]}
            />
            <Bar
              dataKey="value"
              fill={BLUE}
              radius={[0, 4, 4, 0]}
              barSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Row 2, right: stock status donut */}
      <ChartCard
        title="Stock status"
        subtitle="Products by availability"
        loading={loadingStock}
        empty={items.length === 0}
        emptyText="No inventory records yet."
      >
        <div className="mb-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
          {statusData.map((entry) => (
            <span key={entry.name} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: STATUS_COLORS[entry.name] }}
              />
              {entry.name} {entry.value}
            </span>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={CHART_HEIGHT - 28}>
          <PieChart>
            <Pie
              data={statusData.filter((entry) => entry.value > 0)}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="88%"
              paddingAngle={2}
              stroke="none"
            >
              {statusData
                .filter((entry) => entry.value > 0)
                .map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                ))}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value, name) => [value, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
