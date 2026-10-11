import { useState } from "react"
import { useAuth } from "../../context/useAuth"
import { useCreateStore } from "../../hooks/useStores"
import { STORE_CATEGORIES } from "../../services/storeService"

const inputClass =
  "w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-black"

const categoryLabel = (c) =>
  c.split("_").map((w) => w[0] + w.slice(1).toLowerCase()).join(" ")

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
  const [error, setError] = useState("")

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    const payload = Object.fromEntries(
      Object.entries(form)
        .map(([key, value]) => [key, value.trim()])
        .filter(([, value]) => value !== "")
    )

    try {
      const store = await createStore.mutateAsync({ ...payload, logoFile })
      onCreated?.(store)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-lg border border-gray-100 bg-white p-6 shadow-sm"
    >
      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          ⚠ {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Shop name *</label>
        <input required value={form.name} onChange={handleChange("name")} className={inputClass} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Category *</label>
        <select value={form.category} onChange={handleChange("category")} className={inputClass}>
          {STORE_CATEGORIES.map((c) => (
            <option key={c} value={c}>{categoryLabel(c)}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Contact email *</label>
          <input required type="email" value={form.contactEmail} onChange={handleChange("contactEmail")} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Contact phone</label>
          <input value={form.contactPhone} onChange={handleChange("contactPhone")} className={inputClass} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Store address</label>
        <input value={form.storeAddress} onChange={handleChange("storeAddress")} className={inputClass} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Logo (optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
          className="block w-full text-xs text-gray-600"
        />
      </div>

      <button
        type="submit"
        disabled={createStore.isPending}
        className="cursor-pointer rounded bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
      >
        {createStore.isPending ? "Creating shop..." : "Create shop"}
      </button>
    </form>
  )
}