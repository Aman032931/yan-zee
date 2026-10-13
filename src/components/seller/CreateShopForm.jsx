
import { useState, useEffect, useRef } from "react"
import { useAuth } from "../../context/useAuth"
import { useCreateStore } from "../../hooks/useStores"
import { STORE_CATEGORIES } from "../../services/storeService"

const inputClass =
  "w-full min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-red-600 focus:bg-white focus:ring-2 focus:ring-red-100"

const labelClass = "mb-1.5 block text-sm font-medium text-gray-700"

const categoryLabel = (category) =>
  category
    .split("_")
    .map((word) => word[0] + word.slice(1).toLowerCase())
    .join(" ")

export default function CreateShopForm({ onCreated }) {
  const { currentUser } = useAuth()
  const createStore = useCreateStore()

  const [form, setForm] = useState({
    name: "",
    category: "GENERAL",
    contactEmail: currentUser?.email || "",
    contactPhone: currentUser?.phone || "",
    storeAddress: "",
  })

  const [logoFile, setLogoFile] = useState(null)
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

  const setLogo = (file) => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current)
    }

    const url = file ? URL.createObjectURL(file) : ""

    previewRef.current = url
    setPreview(url)
    setLogoFile(file)
  }

  const handleFileChange = (event) => {
    setLogo(event.target.files?.[0] ?? null)
  }

  const clearLogo = () => {
    setLogo(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleChange = (field) => (event) => {
    setForm((previous) => ({
      ...previous,
      [field]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")

    const payload = Object.fromEntries(
      Object.entries(form)
        .map(([key, value]) => [key, value.trim()])
        .filter(([, value]) => value !== "")
    )

    try {
      const store = await createStore.mutateAsync({
        ...payload,
        logoFile,
      })

      onCreated?.(store)
    } catch (err) {
      setError(err.message || "Unable to create your store. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
        >
          <span aria-hidden="true">!</span>
          <p>{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="store-name" className={labelClass}>
          Store name <span className="text-brand-red-600">*</span>
        </label>
        <input
          id="store-name"
          required
          autoFocus
          value={form.name}
          onChange={handleChange("name")}
          placeholder="e.g. My Fashion Store"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="store-category" className={labelClass}>
          Category <span className="text-brand-red-600">*</span>
        </label>
        <select
          id="store-category"
          required
          value={form.category}
          onChange={handleChange("category")}
          className={inputClass}
        >
          {STORE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {categoryLabel(category)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <label htmlFor="store-email" className={labelClass}>
            Contact email <span className="text-brand-red-600">*</span>
          </label>
          <input
            id="store-email"
            required
            type="email"
            value={form.contactEmail}
            onChange={handleChange("contactEmail")}
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>

        <div className="min-w-0">
          <label htmlFor="store-phone" className={labelClass}>
            Contact phone
          </label>
          <input
            id="store-phone"
            type="tel"
            value={form.contactPhone}
            onChange={handleChange("contactPhone")}
            placeholder="Phone number"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="store-address" className={labelClass}>
          Store address <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input
          id="store-address"
          value={form.storeAddress}
          onChange={handleChange("storeAddress")}
          placeholder="City or full address"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Store logo <span className="font-normal text-gray-400">(optional)</span></label>

        <input
          ref={fileInputRef}
          id="store-logo"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {logoFile ? (
          <div className="flex min-w-0 items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <img
              src={preview}
              alt="Store logo preview"
              className="h-12 w-12 shrink-0 rounded-lg border border-gray-200 bg-white object-contain p-1"
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800">
                {logoFile.name}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                {(logoFile.size / 1024).toFixed(0)} KB
              </p>
            </div>

            <label
              htmlFor="store-logo"
              className="shrink-0 cursor-pointer text-xs font-semibold text-brand-red-600 hover:text-brand-red-700"
            >
              Change
            </label>

            <button
              type="button"
              onClick={clearLogo}
              className="shrink-0 cursor-pointer text-xs text-gray-500 hover:text-red-600"
            >
              Remove
            </button>
          </div>
        ) : (
          <label
            htmlFor="store-logo"
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-4 transition hover:border-brand-red-600 hover:bg-red-50/40"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm">
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-gray-800">
                Upload a store logo
              </span>
              <span className="mt-0.5 block text-xs text-gray-500">
                Choose an image from your device
              </span>
            </span>

            <span className="shrink-0 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700">
              Browse
            </span>
          </label>
        )}
      </div>

      <div className="border-t border-gray-100 pt-4">
        <button
          type="submit"
          disabled={createStore.isPending}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {createStore.isPending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Creating store...
            </>
          ) : (
            "Create store"
          )}
        </button>

        <p className="mt-3 text-center text-xs text-gray-400">
          You can manage your store from your seller dashboard.
        </p>
      </div>
    </form>
  )
}
