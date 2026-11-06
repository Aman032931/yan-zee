import { useState } from "react"
import { Boxes, Plus } from "lucide-react"
import { useOutletContext } from "react-router-dom"

import { InventoryOverview } from "../../components/seller/InventoryExtras"
import InventoryCharts from "../../components/seller/InventoryCharts"
import StockInForm from "../../components/seller/StockInForm"
import OutletFilter from "../../components/seller/OutletFilter"

export default function SellerInventoryOverview() {
  const { shop } = useOutletContext() ?? {}
  const storeId =
    shop?.id ?? shop?._id ?? localStorage.getItem("yanzee_store_id")

  const [outletId, setOutletId] = useState("")
  const [showStockIn, setShowStockIn] = useState(false)

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

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <OutletFilter
            storeId={storeId}
            value={outletId}
            onChange={setOutletId}
          />

          <button
            type="button"
            onClick={() => setShowStockIn(true)}
            disabled={!storeId}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} />
            Add stock
          </button>
        </div>
      </div>

      <InventoryOverview storeId={storeId} outletId={outletId} />

      <InventoryCharts storeId={storeId} outletId={outletId} />

      {showStockIn && (
        <StockInForm storeId={storeId} onDone={() => setShowStockIn(false)} />
      )}
    </div>
  )
}