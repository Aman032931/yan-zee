import { useEffect, useRef, useState } from "react"
import { Link, useOutletContext } from "react-router-dom"
import { Plus, Layers, Trash2, Pencil, Eye } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useToggleCategoryAvailability,
} from "../../hooks/useCategories"

const inputClass =
  "w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-black bg-white"

/* ---------------- Add / Edit form ---------------- */

function CategoryForm({ storeId, category, onDone }) {
  const isEdit = Boolean(category)
  const create = useCreateCategory(storeId)
  const update = useUpdateCategory(storeId)
  const saving = create.isPending || update.isPending

  const [name, setName] = useState(category?.name ?? "")
  const [description, setDescription] = useState(category?.description ?? "")
  const [isAvailable, setIsAvailable] = useState(
    category?.isAvailable ?? true
  )
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState("")
  const [error, setError] = useState("")

  const fileInputRef = useRef(null)
  const previewRef = useRef("")

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current)
      }
    }
  }, [])

  const setImage = (file) => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current)
    }

    const url = file ? URL.createObjectURL(file) : ""

    previewRef.current = url
    setPreview(url)
    setImageFile(file)
  }

  const clearImage = () => {
    setImage(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const shownImage = preview || category?.image || ""

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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {isEdit ? `Edit ${category.name}` : "Add a category"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
            >
              ⚠ {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Category name *
            </label>

            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="e.g. Running shoes"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Description (optional)
            </label>

            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} resize-none`}
              placeholder="Short description of this category"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Image (optional)
            </label>

            <input
              ref={fileInputRef}
              id="category-image"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              className="hidden"
            />

            {shownImage ? (
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <img
                  src={shownImage}
                  alt="Category preview"
                  className="h-14 w-14 rounded-md border border-gray-200 bg-white object-cover"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {imageFile ? imageFile.name : "Current image"}
                  </p>

                  {imageFile && (
                    <p className="text-xs text-gray-500">
                      {(imageFile.size / 1024).toFixed(0)} KB
                    </p>
                  )}
                </div>

                <label
                  htmlFor="category-image"
                  className="cursor-pointer text-xs font-medium text-blue-600 hover:underline"
                >
                  Change
                </label>

                {imageFile && (
                  <button
                    type="button"
                    onClick={clearImage}
                    className="cursor-pointer text-xs font-medium text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            ) : (
              <label
                htmlFor="category-image"
                className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-6 text-center transition hover:border-black hover:bg-gray-50"
              >
                <span className="rounded bg-black px-3 py-1.5 text-xs font-semibold text-white">
                  Upload image
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
              {saving
                ? "Saving..."
                : isEdit
                  ? "Save changes"
                  : "Create category"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onDone}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
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
    if (!window.confirm(`Delete "${category.name}"?`)) {
      return
    }

    run(category.id, () => remove.mutateAsync(category.id))
  }

  const displayedError = actionError || error?.message

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage categories for {shop.name}.
          </p>
        </div>

        {!formCategory && (
          <Button
            onClick={() => setFormCategory({})}
            className="self-start"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add category
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

      {formCategory && (
        <CategoryForm
          key={formCategory.id ?? "new"}
          storeId={shop.id}
          category={formCategory.id ? formCategory : null}
          onDone={() => setFormCategory(null)}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Layers className="h-5 w-5" />
            All categories

            {!isLoading && (
              <span className="text-sm font-normal text-muted-foreground">
                ({categories.length})
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
          ) : categories.length === 0 ? (
            <div className="py-8 text-center">
              <Layers className="mx-auto h-9 w-9 text-muted-foreground" />

              <h3 className="mt-3 font-medium">No categories yet</h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Add your first category to organise your products.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="text-xs uppercase text-gray-500">
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left">Category</th>
                    <th className="px-3 py-2 text-left">Products</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((category) => {
                    const busy = busyId === category.id

                    return (
                      <tr
                        key={category.id}
                        className="border-b last:border-0"
                      >
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <Link
                              to={`/seller/categories/${category.id}`}
                              state={{ category }}
                              aria-label={`View ${category.name} details`}
                              className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded border bg-gray-50 transition hover:border-black"
                            >
                              {category.image ? (
                                <img
                                  src={category.image}
                                  alt={category.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Layers className="h-4 w-4 text-gray-400" />
                              )}
                            </Link>

                            <div className="min-w-0">
                              <Link
                                to={`/seller/categories/${category.id}`}
                                state={{ category }}
                                className="truncate font-medium text-gray-900 hover:underline"
                              >
                                {category.name}
                              </Link>

                              <p className="truncate text-xs text-gray-400">
                                {category.slug || "No slug"}
                              </p>

                              {category.description && (
                                <p className="line-clamp-1 text-xs text-gray-500">
                                  {category.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-3 text-gray-600">
                          {category._count?.products ?? 0}
                        </td>

                        <td className="px-3 py-3">
                          <Badge
                            variant={
                              category.isAvailable ? "secondary" : "outline"
                            }
                          >
                            {category.isAvailable
                              ? "Available"
                              : "Unavailable"}
                          </Badge>
                        </td>

                        <td className="whitespace-nowrap px-3 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            disabled={busy}
                          >
                            <Link
                              to={`/seller/categories/${category.id}`}
                              state={{ category }}
                            >
                              <Eye className="mr-1 h-4 w-4" />
                              View
                            </Link>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={busy}
                            onClick={() => handleToggle(category)}
                          >
                            {category.isAvailable ? "Disable" : "Enable"}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={busy}
                            onClick={() => setFormCategory(category)}
                            aria-label={`Edit ${category.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={busy}
                            onClick={() => handleDelete(category)}
                            className="text-red-600 hover:text-red-700"
                            aria-label={`Delete ${category.name}`}
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
