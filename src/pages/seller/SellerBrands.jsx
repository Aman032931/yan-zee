import { useEffect, useRef, useState } from "react"
import { useOutletContext } from "react-router-dom"
import { Plus, Tag, Trash2, Pencil } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import {
  useBrands,
  useCreateBrand,
  useUpdateBrand,
  useDeleteBrand,
  useToggleBrandAvailability,
} from "../../hooks/useBrands"

const inputClass =
  "w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-black bg-white"

/* ---------------- Add / Edit form ---------------- */
function BrandForm({ storeId, brand, onDone }) {
  const isEdit = Boolean(brand)
  const create = useCreateBrand(storeId)
  const update = useUpdateBrand(storeId)
  const saving = create.isPending || update.isPending

  const [name, setName] = useState(brand?.name ?? "")
  const [isAvailable, setIsAvailable] = useState(brand?.isAvailable ?? true)
  const [logoFile, setLogoFile] = useState(null)
  const [preview, setPreview] = useState("")
  const [error, setError] = useState("")

  const fileInputRef = useRef(null)
  const previewRef = useRef("")

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    }
  }, [])

  const setLogo = (file) => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    const url = file ? URL.createObjectURL(file) : ""
    previewRef.current = url
    setPreview(url)
    setLogoFile(file)
  }

  const clearLogo = () => {
    setLogo(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // show the new file if chosen, otherwise the brand's current logo
  const shownLogo = preview || brand?.logo || ""

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    const trimmed = name.trim()
    if (!trimmed) {
      setError("Brand name is required.")
      return
    }

    try {
      if (isEdit) {
        await update.mutateAsync({
          brandId: brand.id,
          name: trimmed,
          isAvailable,
          logoFile,
        })
      } else {
        await create.mutateAsync({ name: trimmed, isAvailable, logoFile })
      }
      onDone()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {isEdit ? `Edit ${brand.name}` : "Add a brand"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              ⚠ {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Brand name *
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="e.g. Nike"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Logo (optional)
            </label>

            <input
              ref={fileInputRef}
              id="brand-logo"
              type="file"
              accept="image/*"
              onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
              className="hidden"
            />

            {shownLogo ? (
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <img
                  src={shownLogo}
                  alt="Logo preview"
                  className="h-14 w-14 rounded-md border border-gray-200 bg-white object-contain"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {logoFile ? logoFile.name : "Current logo"}
                  </p>
                  {logoFile && (
                    <p className="text-xs text-gray-500">
                      {(logoFile.size / 1024).toFixed(0)} KB
                    </p>
                  )}
                </div>
                <label
                  htmlFor="brand-logo"
                  className="cursor-pointer text-xs font-medium text-blue-600 hover:underline"
                >
                  Change
                </label>
                {logoFile && (
                  <button
                    type="button"
                    onClick={clearLogo}
                    className="cursor-pointer text-xs font-medium text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            ) : (
              <label
                htmlFor="brand-logo"
                className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-6 text-center transition hover:border-black hover:bg-gray-50"
              >
                <span className="rounded bg-black px-3 py-1.5 text-xs font-semibold text-white">
                  Upload logo
                </span>
                <span className="text-xs text-gray-500">
                  PNG, JPG or WebP. Click to browse.
                </span>
              </label>
            )}
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="h-4 w-4"
            />
            Available to use on products
          </label>

          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Save changes" : "Create brand"}
            </Button>
            <Button type="button" variant="outline" onClick={onDone} disabled={saving}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

/* ---------------- Page ---------------- */
export default function SellerBrands() {
  const { shop } = useOutletContext()

  const { data: brands = [], isLoading, error } = useBrands(shop.id)
  const toggle = useToggleBrandAvailability(shop.id)
  const remove = useDeleteBrand(shop.id)

  // null = form closed, {} = add, brand object = edit
  const [formBrand, setFormBrand] = useState(null)
  const [actionError, setActionError] = useState("")
  const [busyId, setBusyId] = useState(null)

  const run = async (id, fn) => {
    setActionError("")
    setBusyId(id)
    try {
      await fn()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleToggle = (brand) =>
    run(brand.id, () => toggle.mutateAsync(brand.id))

  const handleDelete = (brand) => {
    if (!window.confirm(`Delete "${brand.name}"?`)) return
    run(brand.id, () => remove.mutateAsync(brand.id))
  }

  const displayedError = actionError || error?.message

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Brands</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage brands for {shop.name}.
          </p>
        </div>
        {!formBrand && (
          <Button onClick={() => setFormBrand({})} className="self-start">
            <Plus className="mr-2 h-4 w-4" />
            Add brand
          </Button>
        )}
      </div>

      {displayedError && (
        <div
          role="alert"
          className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          ⚠ {displayedError}
        </div>
      )}

      {formBrand && (
        <BrandForm
          key={formBrand.id ?? "new"}
          storeId={shop.id}
          brand={formBrand.id ? formBrand : null}
          onDone={() => setFormBrand(null)}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tag className="h-5 w-5" />
            All brands
            {!isLoading && (
              <span className="text-sm font-normal text-muted-foreground">
                ({brands.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : brands.length === 0 ? (
            <div className="py-8 text-center">
              <Tag className="mx-auto h-9 w-9 text-muted-foreground" />
              <h3 className="mt-3 font-medium">No brands yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Add your first brand to use it on products.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="text-xs uppercase text-gray-500">
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left">Brand</th>
                    <th className="px-3 py-2 text-left">Products</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((brand) => {
                    const busy = busyId === brand.id
                    return (
                      <tr key={brand.id} className="border-b last:border-0">
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            {brand.logo ? (
                              <img
                                src={brand.logo}
                                alt={brand.name}
                                className="h-10 w-10 rounded border bg-white object-contain"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded border bg-gray-50">
                                <Tag className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="truncate font-medium">{brand.name}</p>
                              <p className="truncate text-xs text-gray-400">
                                {brand.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-gray-600">
                          {brand._count?.products ?? 0}
                        </td>
                        <td className="px-3 py-3">
                          <Badge variant={brand.isAvailable ? "secondary" : "outline"}>
                            {brand.isAvailable ? "Available" : "Unavailable"}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={busy}
                            onClick={() => handleToggle(brand)}
                          >
                            {brand.isAvailable ? "Disable" : "Enable"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={busy}
                            onClick={() => setFormBrand(brand)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={busy}
                            onClick={() => handleDelete(brand)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}