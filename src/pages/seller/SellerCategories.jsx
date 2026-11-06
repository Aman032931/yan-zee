
import { useState } from "react"
import { useOutletContext } from "react-router-dom"
import { Eye, Layers, Pencil, Plus, Trash2 } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useToggleCategoryAvailability,
} from "../../hooks/useCategories"
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
  PageShell,
  PrimaryButton,
  Req,
  RowButton,
  RowLink,
  SecondaryButton,
  StatusPill,
  TableFooter,
  TableRow,
  Td,
  inputClass,
  labelClass,
} from "../../components/seller/SellerUI"
import { PageHeader } from "../../components/seller/SellerUI"

const COLUMNS = [
  { label: "Category" },
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

const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required"),
  description: z.string().trim(),
  isAvailable: z.boolean(),
  imageFile: imageField,
  seoImageFile: imageField,
})

function FieldError({ error }) {
  if (!error) return null
  return <p className="mt-1.5 text-xs text-red-600">{error.message}</p>
}

function CategoryForm({ storeId, category, onDone }) {
  const isEdit = Boolean(category)
  const create = useCreateCategory(storeId)
  const update = useUpdateCategory(storeId)
  const saving = create.isPending || update.isPending

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    // The popup is remounted per category (key on <CategoryForm />),
    // so defaultValues is enough and no reset() is needed.
    defaultValues: {
      name: category?.name ?? "",
      description: category?.description ?? "",
      isAvailable: category?.isAvailable ?? true,
      imageFile: null,
      seoImageFile: null,
    },
  })

  const onSubmit = async ({ description, ...values }) => {
    // same behavior as before: only send description when it has a value
    const payload = {
      ...values,
      ...(description ? { description } : {}),
    }

    try {
      if (isEdit) {
        await update.mutateAsync({ categoryId: category.id, ...payload })
      } else {
        await create.mutateAsync(payload)
      }

      onDone()
    } catch (err) {
      setError("root.server", {
        message: err.message || "Unable to save category.",
      })
    }
  }

  return (
    <FormModal
      title={isEdit ? `Edit ${category.name}` : "Add a category"}
      onClose={onDone}
      busy={saving}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <ErrorBanner>{errors.root?.server?.message}</ErrorBanner>

        <div>
          <label className={labelClass}>
            Category name <Req />
          </label>

          <input
            {...register("name")}
            className={inputClass}
            placeholder="e.g. Running shoes"
            aria-invalid={!!errors.name}
          />
          <FieldError error={errors.name} />
        </div>

        <div>
          <label className={labelClass}>
            Description (optional)
          </label>

          <textarea
            rows={3}
            {...register("description")}
            className={`${inputClass} resize-none`}
            placeholder="Short description of this category"
          />
          <FieldError error={errors.description} />
        </div>

        <div>
          <Controller
            control={control}
            name="imageFile"
            render={({ field }) => (
              <ImageUploadField
                id="category-image"
                label="Image (optional)"
                file={field.value}
                currentUrl={category?.image}
                onChange={field.onChange}
                uploadText="Upload image"
              />
            )}
          />
          <FieldError error={errors.imageFile} />
        </div>

        <div>
          <Controller
            control={control}
            name="seoImageFile"
            render={({ field }) => (
              <ImageUploadField
                id="category-seo-image"
                label="SEO image (optional)"
                file={field.value}
                currentUrl={category?.seoImage}
                onChange={field.onChange}
                uploadText="Upload SEO image"
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
                : "Create category"}
          </PrimaryButton>
        </div>
      </form>
    </FormModal>
  )
}

/* ---------------- Categories page ---------------- */

export default function SellerCategories() {
  const { shop } = useOutletContext()

  const {
    data: categories = [],
    isLoading,
    error,
  } = useCategories(shop.id)

  const toggle = useToggleCategoryAvailability(shop.id)
  const remove = useDeleteCategory(shop.id)

  const list = useListControls(
    categories,
    (category) =>
      `${category.name} ${category.slug ?? ""}`
  )

  // null = closed, {} = add, category object = edit
  const [formCategory, setFormCategory] = useState(null)
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

  const handleToggle = (category) => {
    run(category.id, () =>
      toggle.mutateAsync(category.id)
    )
  }

  const handleDelete = (category) => {
    if (!window.confirm(`Delete "${category.name}"?`)) return

    run(category.id, () =>
      remove.mutateAsync(category.id)
    )
  }

  return (
    <PageShell>
      <PageHeader
        title="Categories"
        subtitle={`Manage categories for ${shop.name}.`}
        action={
          <PrimaryButton onClick={() => setFormCategory({})}>
            <Plus className="h-4 w-4" />
            Add category
          </PrimaryButton>
        }
      />

      <ErrorBanner>
        {actionError || error?.message}
      </ErrorBanner>

      {/* Category list */}
      <DataCard
        icon={Layers}
        title="All categories"
        count={isLoading ? undefined : categories.length}
        search={{
          value: list.query,
          onChange: list.setQuery,
          placeholder: "Search name or slug",
        }}
      >
        {isLoading ? (
          <LoadingRows />
        ) : categories.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No categories yet"
            text="Add your first category to organise your products."
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
              {list.pageItems.map((category) => {
                const busy = busyId === category.id
                const detailUrl = `/seller/categories/${category.id}`

                return (
                  <TableRow key={category.id}>
                    <Td>
                      <EntityCell
                        image={category.image}
                        icon={Layers}
                        name={category.name}
                        sub={category.slug || "No slug"}
                        to={detailUrl}
                        linkState={{ category }}
                        extra={
                          category.description && (
                            <p className="line-clamp-1 text-xs text-zinc-400">
                              {category.description}
                            </p>
                          )
                        }
                      />
                    </Td>

                    <Td className="text-zinc-600">
                      {category._count?.products ?? 0}
                    </Td>

                    <Td>
                      <StatusPill
                        tone={category.isAvailable ? "green" : "gray"}
                      >
                        {category.isAvailable
                          ? "Available"
                          : "Unavailable"}
                      </StatusPill>
                    </Td>

                    <Td align="right" className="whitespace-nowrap">
                      <RowLink
                        to={detailUrl}
                        state={{ category }}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </RowLink>

                      <RowButton
                        disabled={busy}
                        onClick={() => handleToggle(category)}
                      >
                        {category.isAvailable ? "Disable" : "Enable"}
                      </RowButton>

                      <RowButton
                        disabled={busy}
                        onClick={() => setFormCategory(category)}
                        aria-label={`Edit ${category.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </RowButton>

                      <RowButton
                        danger
                        disabled={busy}
                        onClick={() => handleDelete(category)}
                        aria-label={`Delete ${category.name}`}
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
      {formCategory && (
        <CategoryForm
          key={formCategory.id ?? "new"}
          storeId={shop.id}
          category={formCategory.id ? formCategory : null}
          onDone={() => setFormCategory(null)}
        />
      )}
    </PageShell>
  )
}
