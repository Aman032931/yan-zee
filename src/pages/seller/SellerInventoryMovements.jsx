import { useState } from "react"
import { ArrowLeftRight } from "lucide-react"
import { useOutletContext } from "react-router-dom"

import { InventoryMovements } from "../../components/seller/InventoryExtras"
import OutletFilter from "../../components/seller/OutletFilter"

export default function SellerInventoryMovements() {
  const { shop } = useOutletContext() ?? {}
  const storeId =
    shop?.id ?? shop?._id ?? localStorage.getItem("yanzee_store_id")

  const [outletId, setOutletId] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-red-600/10 text-brand-red-600">
            <ArrowLeftRight size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Stock movements
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Stock received and moved for this store.
            </p>
          </div>
        </div>

        <div className="self-start sm:self-auto">
          <OutletFilter
            storeId={storeId}
            value={outletId}
            onChange={setOutletId}
          />
        </div>
      </div>

      <InventoryMovements storeId={storeId} outletId={outletId} />
    </div>
  )
}