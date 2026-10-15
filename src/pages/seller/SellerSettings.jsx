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
  "w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-black bg-white"

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
    <div className={`rounded border px-3 py-2 text-xs ${styles}`}>
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
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSaved(false)

    // send only what changed
    const changes = {}
    for (const key of Object.keys(form)) {
      const value = form[key].trim()
      if (value !== initial[key] && value !== "") changes[key] = value
    }

    if (Object.keys(changes).length === 0) {
      setError("Nothing to save: you haven't changed anything.")
      return
    }

    try {
      await update.mutateAsync({ storeId: store.id, changes })
      setSaved(true)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Store details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Message type="error">⚠ {error}</Message>}
          {saved && <Message type="success">Store details saved.</Message>}

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Store name 
              <span className="text-red-500"> *</span>
            </label>
            <input
              required
              value={form.name}
              onChange={handleChange("name")}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Category
              <span className="text-red-500"> *</span>
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
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Contact email
                <span className="text-red-500"> *</span>
              </label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={handleChange("contactEmail")}
                placeholder="Leave blank to keep the current email"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Contact phone
              </label>
              <input
                value={form.contactPhone}
                onChange={handleChange("contactPhone")}
                placeholder="Leave blank to keep the current phone"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Store address
            </label>
            <input
              value={form.storeAddress}
              onChange={handleChange("storeAddress")}
              placeholder="Leave blank to keep the current address"
              className={inputClass}
            />
          </div>

          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
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
    e.target.value = "" // allow choosing the same file again
    if (!file) return
    setError("")
    try {
      await upload.mutateAsync({ storeId: store.id, file })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Store logo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && <Message type="error">⚠ {error}</Message>}

        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
            {store.logo ? (
              <img
                src={store.logo}
                alt={store.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Store className="h-8 w-8 text-muted-foreground" />
            )}
          </div>

          <div>
            <input
              id="settings-logo"
              type="file"
              accept="image/*"
              onChange={handleFile}
              disabled={upload.isPending}
              className="hidden"
            />
            <label
              htmlFor="settings-logo"
              className={`inline-flex items-center gap-2 rounded bg-black px-3 py-2 text-xs font-semibold text-white transition ${
                upload.isPending
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer hover:bg-gray-800"
              }`}
            >
              <Upload className="h-4 w-4" />
              {upload.isPending
                ? "Uploading..."
                : store.logo
                  ? "Change logo"
                  : "Upload logo"}
            </label>
            <p className="mt-2 text-xs text-gray-500">
              PNG, JPG or WebP. It uploads as soon as you choose a file.
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
      setError(err.message)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          Visibility
          <Badge variant={store.isPublished ? "secondary" : "outline"}>
            {store.isPublished ? "Published" : "Unpublished"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && <Message type="error">⚠ {error}</Message>}
        <p className="text-sm text-muted-foreground">
          {store.isPublished
            ? "Your store is visible to customers."
            : "Your store is hidden from customers until you publish it."}
        </p>
        <Button
          variant="outline"
          onClick={handleToggle}
          disabled={toggle.isPending}
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
    if (!window.confirm(`Delete "${store.name}"? This cannot be undone.`))
      return
    setError("")
    try {
      await remove.mutateAsync(store.id)
      // SellerLayout reacts to the refreshed list: it switches to another
      // store, or back to the create-store screen if this was the last one.
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="text-lg text-red-700">Delete store</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && <Message type="error">⚠ {error}</Message>}
        <p className="text-sm text-muted-foreground">
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

  // fall back to the list item while the full record loads
  const store = { ...shop, ...(data ?? {}) }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage {shop.name}.
        </p>
      </div>

      {error && <Message type="error">⚠ {error.message}</Message>}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : (
        <>
          {/* key remounts the form when you switch stores */}
          <DetailsForm key={store.id} store={store} />
          <LogoCard store={store} />
          <PublishCard store={store} />
          <DeleteCard store={store} />
        </>
      )}
    </div>
  )
}
