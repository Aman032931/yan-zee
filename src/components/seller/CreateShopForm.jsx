import { useState } from "react"
import { createShop } from "../../services/shopService"
import { useAuth } from "../../context/useAuth"

const inputClass =
  "w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-black"

export default function CreateShopForm({ onCreated }) {
  const { currentUser } = useAuth()
  const [form, setForm] = useState({
    name: "",
    contactEmail: currentUser?.email || "",
    contactPhone: currentUser?.phone || "",
    address: "",
    description: "",
    returnPolicy: "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // send only the fields the seller filled in
    const payload = Object.fromEntries(
      Object.entries(form)
        .map(([key, value]) => [key, value.trim()])
        .filter(([, value]) => value !== "")
    )

    setSaving(true)
    try {
      const shop = await createShop(payload)
      onCreated(shop)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
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
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Shop name *
        </label>
        <input
          required
          value={form.name}
          onChange={handleChange("name")}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Contact email *
          </label>
          <input
            required
            type="email"
            value={form.contactEmail}
            onChange={handleChange("contactEmail")}
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
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Address
        </label>
        <input
          value={form.address}
          onChange={handleChange("address")}
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Description
        </label>
        <textarea
          rows={3}
          value={form.description}
          onChange={handleChange("description")}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Return policy
        </label>
        <textarea
          rows={2}
          value={form.returnPolicy}
          onChange={handleChange("returnPolicy")}
          className={`${inputClass} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="cursor-pointer rounded bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
      >
        {saving ? "Creating shop..." : "Create shop"}
      </button>
    </form>
  )
}
