
import { useState } from "react"
import { useOutletContext } from "react-router-dom"
import {
  Pencil,
  Plus,
  Tag,
  Trash2,
  Package,
  Search,
} from "lucide-react"

import {
  useBrands,
  useCreateBrand,
  useUpdateBrand,
  useDeleteBrand,
  useToggleBrandAvailability,
} from "../../hooks/useBrands"
import { useListControls } from "../../hooks/useListControls"
import {
  DataCard,
  DataTable,
  EmptyState,
  EntityCell,
  ErrorBanner,
  FormModal,
  ImageUploadField,
  LoadingRows,
  PageHeader,
  PageShell,
  PrimaryButton,
  Req,
  RowButton,
  SecondaryButton,
  StatusPill,
  TableFooter,
  TableRow,
  Td,
  inputClass,
  labelClass,
} from "../../components/seller/SellerUI"

const COLUMNS = [
  { label: "Brand" },
  { label: "Products" },
  { label: "Status" },
  { label: "Actions", align: "right" },
]

/* ---------------- Add / Edit form ---------------- */

function BrandForm({ storeId, brand, onDone }) {
  const isEdit = Boolean(brand)
  const create = useCreateBrand(storeId)
  const update = useUpdateBrand(storeId)
  const saving = create.isPending || update.isPending

  const [name, setName] = useState(brand?.name ?? "")
  const [isAvailable, setIsAvailable] = useState(
    brand?.isAvailable ?? true
  )
  const [logoFile, setLogoFile] = useState(null)
  const [seoImageFile, setSeoImageFile] = useState(null)
  const [error, setError] = useState("")

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
          seoImageFile,
        })
      } else {
        await create.mutateAsync({
          name: trimmed,
          isAvailable,
          logoFile,
          seoImageFile,
        })
      }

      onDone()
    } catch (err) {
      setError(err.message || "Unable to save brand.")
    }
  }

  return (
    <FormModal
      title={isEdit ? `Edit ${brand.name}` : "Add a brand"}
      onClose={onDone}
      busy={saving}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <ErrorBanner>{error}</ErrorBanner>

        <div>
          <label className={labelClass}>
            Brand name <Req />
          </label>

          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="e.g. Nike"
          />
        </div>

        <ImageUploadField
          id="brand-logo"
          label="Brand logo (optional)"
          file={logoFile}
          currentUrl={brand?.logo}
          onChange={setLogoFile}
          uploadText="Upload logo"
          fit="contain"
        />

        <ImageUploadField
          id="brand-seo-image"
          label="SEO image (optional)"
          file={seoImageFile}
          currentUrl={brand?.seoImage}
          onChange={setSeoImageFile}
          uploadText="Upload SEO image"
          fit="contain"
        />

        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="h-4 w-4 accent-brand-red-600"
            />

            <span>
              <span className="block text-sm font-semibold text-zinc-900">
                Available to use on products
              </span>
              <span className="mt-0.5 block text-xs text-zinc-500">
                This brand can be selected when creating products.
              </span>
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
          <SecondaryButton onClick={onDone} disabled={saving}>
            Cancel
          </SecondaryButton>

          <PrimaryButton type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : isEdit
                ? "Save changes"
                : "Create brand"}
          </PrimaryButton>
        </div>
      </form>
    </FormModal>
  )
}

/* ---------------- Brands page ---------------- */

export default function SellerBrands() {
  const { shop } = useOutletContext()

  const {
    data: brands = [],
    isLoading,
    error,
  } = useBrands(shop.id)

  const toggle = useToggleBrandAvailability(shop.id)
  const remove = useDeleteBrand(shop.id)

  const list = useListControls(
    brands,
    (brand) => `${brand.name} ${brand.slug ?? ""}`
  )

  // null = closed, {} = add, brand object = edit
  const [formBrand, setFormBrand] = useState(null)
  const [actionError, setActionError] = useState("")
  const [busyId, setBusyId] = useState(null)

  const run = async (id, fn) => {
    setActionError("")
    setBusyId(id)

    try {
      await fn()
    } catch (err) {
      setActionError(
        err.message || "The action could not be completed."
      )
    } finally {
      setBusyId(null)
    }
  }

  const handleToggle = (brand) => {
    run(brand.id, () =>
      toggle.mutateAsync(brand.id)
    )
  }

  const handleDelete = (brand) => {
    if (!window.confirm(`Delete "${brand.name}"?`)) return

    run(brand.id, () =>
      remove.mutateAsync(brand.id)
    )
  }

  const availableCount = brands.filter(
    (brand) => brand.isAvailable
  ).length

  const productCount = brands.reduce(
    (total, brand) =>
      total + (brand._count?.products ?? 0),
    0
  )

  return (
    <PageShell>
      <PageHeader
        title="Brands"
        subtitle={`Manage brands for ${shop.name}.`}
        action={
          <PrimaryButton onClick={() => setFormBrand({})}>
            <Plus className="h-4 w-4" />
            Add brand
          </PrimaryButton>
        }
      />

      <ErrorBanner>
        {actionError || error?.message}
      </ErrorBanner>

      {/* Brand list */}
      <DataCard
        icon={Tag}
        title="All brands"
        count={isLoading ? undefined : brands.length}
        search={{
          value: list.query,
          onChange: list.setQuery,
          placeholder: "Search name or slug",
        }}
      >
        {isLoading ? (
          <LoadingRows />
        ) : brands.length === 0 ? (
          <EmptyState
            icon={Tag}
            title="No brands yet"
            text="Add your first brand to use it on products."
          />
        ) : list.total === 0 ? (
          <EmptyState
            icon={Search}
            title={`No results for "${list.query.trim()}"`}
            text="Try a different name or slug."
          />
        ) : (
          <>
            <DataTable columns={COLUMNS}>
              {list.pageItems.map((brand) => {
                const busy = busyId === brand.id

                return (
                  <TableRow key={brand.id}>
                    <Td>
                      <EntityCell
                        image={brand.logo}
                        icon={Tag}
                        name={brand.name}
                        sub={brand.slug || "No slug"}
                        fit="contain"
                      />
                    </Td>

                    <Td className="text-zinc-600">
                      {brand._count?.products ?? 0}
                    </Td>

                    <Td>
                      <StatusPill
                        tone={brand.isAvailable ? "green" : "gray"}
                      >
                        {brand.isAvailable
                          ? "Available"
                          : "Unavailable"}
                      </StatusPill>
                    </Td>

                    <Td align="right" className="whitespace-nowrap">
                      <RowButton
                        disabled={busy}
                        onClick={() => handleToggle(brand)}
                      >
                        {brand.isAvailable ? "Disable" : "Enable"}
                      </RowButton>

                      <RowButton
                        disabled={busy}
                        onClick={() => setFormBrand(brand)}
                        aria-label={`Edit ${brand.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </RowButton>

                      <RowButton
                        danger
                        disabled={busy}
                        onClick={() => handleDelete(brand)}
                        aria-label={`Delete ${brand.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </RowButton>
                    </Td>
                  </TableRow>
                )
              })}
            </DataTable>

            <TableFooter
              from={list.from}
              to={list.to}
              total={list.total}
              page={list.page}
              totalPages={list.totalPages}
              onPageChange={list.setPage}
            />
          </>
        )}
      </DataCard>

      {/* Add / Edit popup */}
      {formBrand && (
        <BrandForm
          key={formBrand.id ?? "new"}
          storeId={shop.id}
          brand={formBrand.id ? formBrand : null}
          onDone={() => setFormBrand(null)}
        />
      )}
    </PageShell>
  )
}
