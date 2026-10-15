import { useState } from "react"
import { useOutletContext } from "react-router-dom"
import { Eye, Layers, Pencil, Plus, Trash2 } from "lucide-react"

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
  FormCard,
  ImageUploadField,
  LoadingRows,
  PageHeader,
  PageShell,
  PrimaryButton,
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

const COLUMNS = [
  { label: "Category" },
  { label: "Products" },
  { label: "Status" },
  { label: "Actions", align: "right" },
]

/* ---------------- Add / Edit form ---------------- */
function CategoryForm({ storeId, category, onDone }) {
  const isEdit = Boolean(category)
  const create = useCreateCategory(storeId)
  const update = useUpdateCategory(storeId)
  const saving = create.isPending || update.isPending

  const [name, setName] = useState(category?.name ?? "")
  const [description, setDescription] = useState(category?.description ?? "")
  const [isAvailable, setIsAvailable] = useState(category?.isAvailable ?? true)
  const [imageFile, setImageFile] = useState(null)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    const trimmed = name.trim()
    if (!trimmed) {
      setError("Category name is required.")
      return
    }

    try {
      const desc = description.trim()

      if (isEdit) {
        await update.mutateAsync({
          categoryId: category.id,
          name: trimmed,
          isAvailable,
          imageFile,
          ...(desc ? { description: desc } : {}),
        })
      } else {
        await create.mutateAsync({
          name: trimmed,
          isAvailable,
          imageFile,
          ...(desc ? { description: desc } : {}),
        })
      }

      onDone()
    } catch (err) {
      setError(err.message || "Unable to save category.")
    }
  }

  return (
    <FormCard title={isEdit ? `Edit ${category.name}` : "Add a category"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorBanner>{error}</ErrorBanner>

        <div>
          <label className={labelClass}>Category name *</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="e.g. Running shoes"
          />
        </div>

        <div>
          <label className={labelClass}>Description (optional)</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} resize-none`}
            placeholder="Short description of this category"
          />
        </div>

        <ImageUploadField
          id="category-image"
          label="Image (optional)"
          file={imageFile}
          currentUrl={category?.image}
          onChange={setImageFile}
          uploadText="Upload image"
        />

        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
            className="h-4 w-4 accent-brand-red-600"
          />
          Available to use on products
        </label>

        <div className="flex gap-2">
          <PrimaryButton type="submit" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save changes" : "Create category"}
          </PrimaryButton>
          <SecondaryButton onClick={onDone} disabled={saving}>
            Cancel
          </SecondaryButton>
        </div>
      </form>
    </FormCard>
  )
}

/* ---------------- Categories page ---------------- */
export default function SellerCategories() {
  const { shop } = useOutletContext()

  const { data: categories = [], isLoading, error } = useCategories(shop.id)

  const toggle = useToggleCategoryAvailability(shop.id)
  const remove = useDeleteCategory(shop.id)

  const list = useListControls(categories, (c) => `${c.name} ${c.slug ?? ""}`)

  // null = form closed, {} = add, category object = edit
  const [formCategory, setFormCategory] = useState(null)
  const [actionError, setActionError] = useState("")
  const [busyId, setBusyId] = useState(null)

  const run = async (id, fn) => {
    setActionError("")
    setBusyId(id)

    try {
      await fn()
    } catch (err) {
      setActionError(err.message || "The action could not be completed.")
    } finally {
      setBusyId(null)
    }
  }

  const handleToggle = (category) => {
    run(category.id, () => toggle.mutateAsync(category.id))
  }

  const handleDelete = (category) => {
    if (!window.confirm(`Delete "${category.name}"?`)) return
    run(category.id, () => remove.mutateAsync(category.id))
  }

  return (
    <PageShell>
      <PageHeader
        title="Categories"
        subtitle={`Manage categories for ${shop.name}.`}
        action={
          !formCategory && (
            <PrimaryButton onClick={() => setFormCategory({})}>
              <Plus className="h-4 w-4" />
              Add category
            </PrimaryButton>
          )
        }
      />

      <ErrorBanner>{actionError || error?.message}</ErrorBanner>

      {formCategory && (
        <CategoryForm
          key={formCategory.id ?? "new"}
          storeId={shop.id}
          category={formCategory.id ? formCategory : null}
          onDone={() => setFormCategory(null)}
        />
      )}

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
            icon={Layers}
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
                      <StatusPill tone={category.isAvailable ? "green" : "gray"}>
                        {category.isAvailable ? "Available" : "Unavailable"}
                      </StatusPill>
                    </Td>

                    <Td align="right" className="whitespace-nowrap">
                      <RowLink to={detailUrl} state={{ category }}>
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
    </PageShell>
  )
}