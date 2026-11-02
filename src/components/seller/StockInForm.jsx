import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"

import { useOutlets } from "../../hooks/useOutlets"
import { useInventoryStock, useStockIn } from "../../hooks/useInventory"
import {
  ErrorBanner,
  FormModal,
  PrimaryButton,
  SecondaryButton,
  inputClass,
  labelClass,
} from "./SellerUI"

const emptyRow = () => ({
  itemKey: "",
  quantity: "",
  unitCost: "",
  supplierLot: "",
  manufactureDate: "",
  expiryDate: "",
})

const itemKeyOf = (item) => `${item.productId}:${item.variantId ?? ""}`

export default function StockInForm({ storeId, onDone }) {
  const stockIn = useStockIn(storeId)
  const saving = stockIn.isPending

  const { data: outlets = [], isLoading: loadingOutlets } = useOutlets(storeId)

  // Items you can add stock to come from the inventory list.
  const { data: stockResponse, isLoading: loadingItems } = useInventoryStock({
    storeId,
    page: 1,
    limit: 100,
  })

  const stockItems = stockResponse?.data?.items ?? []
  const itemsByKey = Object.fromEntries(
    stockItems.map((item) => [itemKeyOf(item), item]),
  )

  const activeOutlets = outlets.filter((outlet) => outlet.isActive !== false)

  const [outletId, setOutletId] = useState("")
  const [referenceNumber, setReferenceNumber] = useState("")
  const [supplierName, setSupplierName] = useState("")
  const [note, setNote] = useState("")
  const [rows, setRows] = useState([emptyRow()])
  const [error, setError] = useState("")

  // With only one active outlet there is nothing to choose.
  const selectedOutletId =
    outletId || (activeOutlets.length === 1 ? activeOutlets[0].id : "")

  const setRow = (index, field, value) =>
    setRows((previous) =>
      previous.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    )

  const addRow = () => setRows((previous) => [...previous, emptyRow()])

  const removeRow = (index) =>
    setRows((previous) => previous.filter((_, i) => i !== index))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")

    if (!selectedOutletId) {
      setError("Please choose an outlet.")
      return
    }

    const items = []

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i]
      const label = `Item ${i + 1}`
      const source = itemsByKey[row.itemKey]
      const quantity = Number(row.quantity)
      const unitCost = Number(row.unitCost)

      if (!source) {
        setError(`${label}: choose a product.`)
        return
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        setError(`${label}: quantity must be a whole number greater than 0.`)
        return
      }

      if (row.unitCost === "" || !Number.isFinite(unitCost) || unitCost < 0) {
        setError(`${label}: unit cost must be 0 or greater.`)
        return
      }

      if (
        row.manufactureDate &&
        row.expiryDate &&
        row.expiryDate < row.manufactureDate
      ) {
        setError(`${label}: expiry date can't be before the manufacture date.`)
        return
      }

      items.push({
        productId: source.productId,
        ...(source.variantId && { variantId: source.variantId }),
        quantity,
        unitCost,
        ...(row.supplierLot.trim() && { supplierLot: row.supplierLot.trim() }),
        ...(row.manufactureDate && { manufactureDate: row.manufactureDate }),
        ...(row.expiryDate && { expiryDate: row.expiryDate }),
      })
    }

    const payload = {
      outletId: selectedOutletId,
      ...(referenceNumber.trim() && { referenceNumber: referenceNumber.trim() }),
      ...(supplierName.trim() && { supplierName: supplierName.trim() }),
      ...(note.trim() && { note: note.trim() }),
      items,
    }

    try {
      await stockIn.mutateAsync(payload)
      onDone()
    } catch (err) {
      setError(err.message || "Unable to add stock.")
    }
  }

  return (
    <FormModal
      title="Add stock"
      onClose={onDone}
      busy={saving}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorBanner>{error}</ErrorBanner>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Outlet *</label>
            <select
              value={selectedOutletId}
              onChange={(e) => setOutletId(e.target.value)}
              className={inputClass}
            >
              <option value="">
                {loadingOutlets
                  ? "Loading outlets..."
                  : activeOutlets.length === 0
                    ? "No active outlets"
                    : "Select outlet"}
              </option>

              {activeOutlets.map((outlet) => (
                <option key={outlet.id} value={outlet.id}>
                  {outlet.name}
                  {outlet.isMain ? " (Main)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Reference number</label>
            <input
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className={inputClass}
              placeholder="e.g. STOCK-IN-2026-004"
            />
          </div>

          <div>
            <label className={labelClass}>Supplier</label>
            <input
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              className={inputClass}
              placeholder="e.g. XYZ Garment Suppliers"
            />
          </div>

          <div>
            <label className={labelClass}>Note</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={inputClass}
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold tracking-wide text-zinc-500 uppercase">
            Items *
          </p>

          {!loadingItems && stockItems.length === 0 && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              No products with stock records were found, so there's nothing to
              add stock to yet.
            </p>
          )}

          {rows.map((row, index) => (
            <div
              key={index}
              className="space-y-3 rounded-xl border border-yz-border bg-yz-bg p-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-zinc-700">
                  Item {index + 1}
                </p>

                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    aria-label={`Remove item ${index + 1}`}
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Product *</label>
                  <select
                    value={row.itemKey}
                    onChange={(e) => setRow(index, "itemKey", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">
                      {loadingItems ? "Loading products..." : "Select product"}
                    </option>

                    {stockItems.map((item) => (
                      <option key={itemKeyOf(item)} value={itemKeyOf(item)}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={row.quantity}
                    onChange={(e) => setRow(index, "quantity", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Unit cost (Nrs) *</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={row.unitCost}
                    onChange={(e) => setRow(index, "unitCost", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Supplier lot</label>
                  <input
                    value={row.supplierLot}
                    onChange={(e) =>
                      setRow(index, "supplierLot", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Manufacture date</label>
                  <input
                    type="date"
                    value={row.manufactureDate}
                    onChange={(e) =>
                      setRow(index, "manufactureDate", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Expiry date</label>
                  <input
                    type="date"
                    value={row.expiryDate}
                    onChange={(e) =>
                      setRow(index, "expiryDate", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addRow}
            className="inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-brand-red-600 hover:underline"
          >
            <Plus size={15} />
            Add another item
          </button>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <SecondaryButton onClick={onDone} disabled={saving}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={saving}>
            {saving ? "Saving..." : "Add stock"}
          </PrimaryButton>
        </div>
      </form>
    </FormModal>
  )
}