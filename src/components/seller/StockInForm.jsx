import { useEffect, useMemo } from "react"
import { Plus, Trash2 } from "lucide-react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { useOutlets } from "../../hooks/useOutlets"
import { useInventoryStock, useStockIn } from "../../hooks/useInventory"
import {
  ErrorBanner,
  FieldError,
  FormModal,
  PrimaryButton,
  Req,
  SecondaryButton,
  inputClass,
  labelClass,
} from "./SellerUI"

const makeItemSchema = (validKeys) =>
  z
    .object({
      itemKey: z
        .string()
        .min(1, "Choose a product")
        .refine((key) => validKeys.has(key), "Choose a valid product"),
      quantity: z
        .string()
        .min(1, "Quantity is required")
        .refine(
          (value) => Number.isInteger(Number(value)) && Number(value) > 0,
          "Quantity must be a whole number greater than 0"
        ),
      unitCost: z
        .string()
        .min(1, "Unit cost is required")
        .refine(
          (value) => Number.isFinite(Number(value)) && Number(value) >= 0,
          "Unit cost must be 0 or greater"
        ),
      supplierLot: z.string().trim(),
      manufactureDate: z.string(),
      expiryDate: z.string(),
    })
    .refine(
      (row) =>
        !row.manufactureDate ||
        !row.expiryDate ||
        row.expiryDate >= row.manufactureDate,
      {
        message: "Expiry date can't be before the manufacture date",
        path: ["expiryDate"],
      }
    )

const makeStockInSchema = (validKeys) =>
  z.object({
    outletId: z.string().min(1, "Please choose an outlet"),
    referenceNumber: z.string().trim(),
    supplierName: z.string().trim(),
    note: z.string().trim(),
    items: z.array(makeItemSchema(validKeys)).min(1, "Add at least one item"),
  })

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

  const { data: outlets, isLoading: loadingOutlets } = useOutlets(storeId)

  // Items you can add stock to come from the inventory list.
  const { data: stockResponse, isLoading: loadingItems } = useInventoryStock({
    storeId,
    page: 1,
    limit: 100,
  })

  const stockItems = useMemo(
    () => stockResponse?.data?.items ?? [],
    [stockResponse]
  )

  const itemsByKey = useMemo(
    () =>
      Object.fromEntries(stockItems.map((item) => [itemKeyOf(item), item])),
    [stockItems]
  )

  const schema = useMemo(
  () => makeStockInSchema(new Set(Object.keys(itemsByKey))),
  [itemsByKey]
)

  const activeOutlets = useMemo(
    () => (outlets ?? []).filter((outlet) => outlet.isActive !== false),
    [outlets]
  )

  // With only one active outlet there is nothing to choose.
  const singleOutletId = activeOutlets.length === 1 ? activeOutlets[0].id : ""

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      outletId: "",
      referenceNumber: "",
      supplierName: "",
      note: "",
      items: [emptyRow()],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "items" })

  useEffect(() => {
    if (singleOutletId && !getValues("outletId")) {
      setValue("outletId", singleOutletId)
    }
  }, [singleOutletId, getValues, setValue])

  const onSubmit = async (values) => {
  const items = values.items.map((row) => {
    const source = itemsByKey[row.itemKey]

    return {
      productId: source.productId,
      ...(source.variantId && { variantId: source.variantId }),
      quantity: Number(row.quantity),
      unitCost: Number(row.unitCost),
      ...(row.supplierLot && { supplierLot: row.supplierLot }),
      ...(row.manufactureDate && { manufactureDate: row.manufactureDate }),
      ...(row.expiryDate && { expiryDate: row.expiryDate }),
    }
  })

  const payload = {
    outletId: values.outletId,
    ...(values.referenceNumber && { referenceNumber: values.referenceNumber }),
    ...(values.supplierName && { supplierName: values.supplierName }),
    ...(values.note && { note: values.note }),
    items,
  }

  try {
    await stockIn.mutateAsync(payload)
    onDone()
  } catch (err) {
    setError("root.server", {
      message: err.message || "Unable to add stock.",
    })
  }
}

  return (
    <FormModal
      title="Add stock"
      onClose={onDone}
      busy={saving}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <ErrorBanner>{errors.root?.server?.message}</ErrorBanner>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>
              Outlet <Req />
            </label>
            <select
              {...register("outletId")}
              className={inputClass}
              aria-invalid={!!errors.outletId}
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
            <FieldError error={errors.outletId} />
          </div>

          <div>
            <label className={labelClass}>Reference number</label>
            <input
              {...register("referenceNumber")}
              className={inputClass}
              placeholder="e.g. STOCK-IN-2026-004"
            />
          </div>

          <div>
            <label className={labelClass}>Supplier</label>
            <input
              {...register("supplierName")}
              className={inputClass}
              placeholder="e.g. XYZ Garment Suppliers"
            />
          </div>

          <div>
            <label className={labelClass}>Note</label>
            <input
              {...register("note")}
              className={inputClass}
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold tracking-wide text-zinc-500 uppercase">
            Items <Req />
          </p>

          {!loadingItems && stockItems.length === 0 && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              No products with stock records were found, so there's nothing to
              add stock to yet.
            </p>
          )}

          {fields.map((field, index) => {
            const rowErrors = errors.items?.[index]

            return (
              <div
                key={field.id}
                className="space-y-3 rounded-xl border border-yz-border bg-yz-bg p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-zinc-700">
                    Item {index + 1}
                  </p>

                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      aria-label={`Remove item ${index + 1}`}
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>
                      Product <Req />
                    </label>
                    <select
                      {...register(`items.${index}.itemKey`)}
                      className={inputClass}
                      aria-invalid={!!rowErrors?.itemKey}
                    >
                      <option value="">
                        {loadingItems
                          ? "Loading products..."
                          : "Select product"}
                      </option>

                      {stockItems.map((item) => (
                        <option key={itemKeyOf(item)} value={itemKeyOf(item)}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    <FieldError error={rowErrors?.itemKey} />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Quantity <Req />
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      {...register(`items.${index}.quantity`)}
                      className={inputClass}
                      aria-invalid={!!rowErrors?.quantity}
                    />
                    <FieldError error={rowErrors?.quantity} />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Unit cost (Nrs) <Req />
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      {...register(`items.${index}.unitCost`)}
                      className={inputClass}
                      aria-invalid={!!rowErrors?.unitCost}
                    />
                    <FieldError error={rowErrors?.unitCost} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className={labelClass}>Supplier lot</label>
                    <input
                      {...register(`items.${index}.supplierLot`)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Manufacture date</label>
                    <input
                      type="date"
                      {...register(`items.${index}.manufactureDate`)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Expiry date</label>
                    <input
                      type="date"
                      {...register(`items.${index}.expiryDate`)}
                      className={inputClass}
                      aria-invalid={!!rowErrors?.expiryDate}
                    />
                    <FieldError error={rowErrors?.expiryDate} />
                  </div>
                </div>
              </div>
            )
          })}

          <button
            type="button"
            onClick={() => append(emptyRow())}
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