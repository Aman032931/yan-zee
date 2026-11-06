
import { useState } from "react"
import { useOutletContext } from "react-router-dom"
import { Pencil, Plus, Tag, Trash2 } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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

/* ---------------- Add / Edit form (popup) ---------------- */
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const imageField = z
  .instanceof(File)
  .refine((file) => file.type.startsWith("image/"), "File must be an image")
  .refine((file) => file.size <= MAX_IMAGE_SIZE, "Image must be under 5 MB")
  .nullable()
  .optional()

const brandSchema = z.object({
  name: z.string().trim().min(1, "Brand name is required"),
  isAvailable: z.boolean(),
  logoFile: imageField,
  seoImageFile: imageField,
})

function FieldError({ error }) {
  if (!error) return null
  return <p className="mt-1.5 text-xs text-red-600">{error.message}</p>
}

function BrandForm({ storeId, brand, onDone }) {
  const isEdit = Boolean(brand)
  const create = useCreateBrand(storeId)
  const update = useUpdateBrand(storeId)
  const saving = create.isPending || update.isPending

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(brandSchema),
    // The popup is remounted per brand (key on <BrandForm />),
    // so defaultValues is enough and no reset() is needed.
    defaultValues: {
      name: brand?.name ?? "",
      isAvailable: brand?.isAvailable ?? true,
      logoFile: null,
      seoImageFile: null,
    },
  })

  const onSubmit = async (values) => {
    try {
      if (isEdit) {
        await update.mutateAsync({ brandId: brand.id, ...values })
      } else {
        await create.mutateAsync(values)
      }

      onDone()
    } catch (err) {
      setError("root.server", {
        message: err.message || "Unable to save brand.",
      })
    }
  }

  return (
    <FormModal
      title={isEdit ? `Edit ${brand.name}` : "Add a brand"}
      onClose={onDone}
      busy={saving}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <ErrorBanner>{errors.root?.server?.message}</ErrorBanner>

        <div>
          <label className={labelClass}>
            Brand name <Req />
          </label>

          <input
            {...register("name")}
            className={inputClass}
            placeholder="e.g. Nike"
            aria-invalid={!!errors.name}
          />
          <FieldError error={errors.name} />
        </div>

        <div>
          <Controller
            control={control}
            name="logoFile"
            render={({ field }) => (
              <ImageUploadField
                id="brand-logo"
                label="Logo (optional)"
                file={field.value}
                currentUrl={brand?.logo}
                onChange={field.onChange}
                uploadText="Upload logo"
                fit="contain"
              />
            )}
          />
          <FieldError error={errors.logoFile} />
        </div>

        <div>
          <Controller
            control={control}
            name="seoImageFile"
            render={({ field }) => (
              <ImageUploadField
                id="brand-seo-image"
                label="SEO image (optional)"
                file={field.value}
                currentUrl={brand?.seoImage}
                onChange={field.onChange}
                uploadText="Upload SEO image"
                fit="contain"
              />
            )}
          />
          <FieldError error={errors.seoImageFile} />
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            {...register("isAvailable")}
            className="h-4 w-4 accent-brand-red-600"
          />
          Available to use on products
        </label>

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


/* ---------------- Page ---------------- */
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
