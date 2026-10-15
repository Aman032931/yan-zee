
import { useState } from "react"
import { useOutletContext } from "react-router-dom"
import { Store, Upload } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import {
  useStore,
  useUpdateStore,
  useUploadStoreLogo,
  useToggleStorePublish,
  useDeleteStore,
} from "../../hooks/useStores"
import { STORE_CATEGORIES } from "../../services/storeService"

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-red-600 focus:ring-2 focus:ring-brand-red-600/10"

const categoryLabel = (c) =>
  c
    .split("_")
    .map((w) => w[0] + w.slice(1).toLowerCase())
    .join(" ")

function Message({ type, children }) {
  const styles =
    type === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-green-200 bg-green-50 text-green-700"

  return (
    <div className={`rounded-lg border px-3 py-2 text-xs ${styles}`}>
      {children}
    </div>
  )
}

/* ---------------- Details form ---------------- */
function DetailsForm({ store }) {
  const update = useUpdateStore()

  const initial = {
    name: store.name ?? "",
    category: store.category ?? "GENERAL",
    contactEmail: store.contactEmail ?? "",
    contactPhone: store.contactPhone ?? "",
    storeAddress: store.storeAddress ?? store.address ?? "",
  }

  const [form, setForm] = useState(initial)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setSaved(false)
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSaved(false)

    const changes = {}

    for (const key of Object.keys(form)) {
      const value = form[key].trim()

      if (value !== initial[key] && value !== "") {
        changes[key] = value
      }
    }

    if (Object.keys(changes).length === 0) {
      setError("Nothing to save: you haven't changed anything.")
      return
    }

    try {
      await update.mutateAsync({ storeId: store.id, changes })
      setSaved(true)
    } catch (err) {
      setError(err.message || "Unable to save store details.")
    }
  }

  return (
    <Card className="h-fit rounded-2xl border-yz-border shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Store details</CardTitle>
        <p className="text-sm text-muted-foreground">
          Update your store information.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <Message type="error">⚠ {error}</Message>}
          {saved && <Message type="success">Store details saved.</Message>}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Store name <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.name}
              onChange={handleChange("name")}
              className={inputClass}
              placeholder="Enter store name"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={form.category}
              onChange={handleChange("category")}
              className={inputClass}
            >
              {STORE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {categoryLabel(c)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Contact email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={handleChange("contactEmail")}
                placeholder="Contact email"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Contact phone
              </label>
              <input
                value={form.contactPhone}
                onChange={handleChange("contactPhone")}
                placeholder="Contact phone"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Store address
            </label>
            <input
              value={form.storeAddress}
              onChange={handleChange("storeAddress")}
              placeholder="Enter store address"
              className={inputClass}
            />
          </div>

          <div className="border-t border-yz-border pt-4">
            <Button
              type="submit"
              disabled={update.isPending}
              className="bg-brand-red-600 text-white hover:bg-brand-red-700"
            >
              {update.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

/* ---------------- Logo ---------------- */
function LogoCard({ store }) {
  const upload = useUploadStoreLogo()
  const [error, setError] = useState("")

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ""

    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.")
      return
    }

    setError("")

    try {
      await upload.mutateAsync({ storeId: store.id, file })
    } catch (err) {
      setError(err.message || "Unable to upload logo.")
    }
  }

  return (
    <Card className="rounded-2xl border-yz-border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Store logo</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {error && <Message type="error">⚠ {error}</Message>}

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-yz-border bg-yz-bg">
            {store.logo ? (
              <img
                src={store.logo}
                alt={`${store.name} logo`}
                className="h-full w-full object-contain p-1"
              />
            ) : (
              <Store className="h-8 w-8 text-muted-foreground" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <input
              id={`settings-logo-${store.id}`}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFile}
              disabled={upload.isPending}
              className="hidden"
            />

            <label
              htmlFor={`settings-logo-${store.id}`}
              className={`inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-red-700 ${
                upload.isPending
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer"
              }`}
            >
              <Upload className="h-4 w-4" />
              {upload.isPending
                ? "Uploading..."
                : store.logo
                  ? "Change logo"
                  : "Upload logo"}
            </label>

            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              PNG, JPG or WebP. Uploads automatically when selected.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ---------------- Publish ---------------- */
function PublishCard({ store }) {
  const toggle = useToggleStorePublish()
  const [error, setError] = useState("")

  const handleToggle = async () => {
    setError("")

    try {
      await toggle.mutateAsync(store.id)
    } catch (err) {
      setError(err.message || "Unable to update store visibility.")
    }
  }

  return (
    <Card className="rounded-2xl border-yz-border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
          Visibility
          <Badge variant={store.isPublished ? "secondary" : "outline"}>
            {store.isPublished ? "Published" : "Unpublished"}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && <Message type="error">⚠ {error}</Message>}

        <p className="text-sm leading-6 text-muted-foreground">
          {store.isPublished
            ? "Your store is visible to customers."
            : "Your store is hidden from customers until you publish it."}
        </p>

        <Button
          variant="outline"
          onClick={handleToggle}
          disabled={toggle.isPending}
          className="w-full sm:w-auto"
        >
          {toggle.isPending
            ? "Updating..."
            : store.isPublished
              ? "Unpublish store"
              : "Publish store"}
        </Button>
      </CardContent>
    </Card>
  )
}

/* ---------------- Danger zone ---------------- */
function DeleteCard({ store }) {
  const remove = useDeleteStore()
  const [error, setError] = useState("")

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${store.name}"? This cannot be undone.`)) {
      return
    }

    setError("")

    try {
      await remove.mutateAsync(store.id)
    } catch (err) {
      setError(err.message || "Unable to delete store.")
    }
  }

  return (
    <Card className="rounded-2xl border-red-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-red-700">
          Delete store
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {error && <Message type="error">⚠ {error}</Message>}

        <p className="text-sm leading-6 text-muted-foreground">
          Permanently delete this store. This cannot be undone.
        </p>

        <Button
          variant="outline"
          onClick={handleDelete}
          disabled={remove.isPending}
          className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          {remove.isPending ? "Deleting..." : "Delete this store"}
        </Button>
      </CardContent>
    </Card>
  )
}

/* ---------------- Page ---------------- */
export default function SellerSettings() {
  const { shop } = useOutletContext()
  const { data, isLoading, error } = useStore(shop.id)

  // Use the selected store while the full record loads.
  const store = { ...shop, ...(data ?? {}) }

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage {shop.name}.
        </p>
      </div>

      {error && <Message type="error">⚠ {error.message}</Message>}

      {isLoading ? (
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
          <Skeleton className="h-[420px] w-full rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
          {/* Left column */}
          <div className="min-w-0">
            <DetailsForm key={store.id} store={store} />
          </div>

          {/* Right column */}
          <div className="min-w-0 space-y-6">
            <LogoCard store={store} />
            <PublishCard store={store} />
            <DeleteCard store={store} />
          </div>
        </div>
      )}
    </div>
  )
}