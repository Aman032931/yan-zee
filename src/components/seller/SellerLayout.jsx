import { useState } from "react"
import { NavLink, Outlet, Link } from "react-router-dom"
import { useMyStores } from "../../hooks/useStores"
import CreateShopForm from "./CreateShopForm"

const NAV_ITEMS = [
  { label: "Dashboard", to: "/seller" },
  { label: "My Products", to: "/seller/products" },
]

const STORE_KEY = "yanzee_store_id"

const readSavedStoreId = () => {
  try {
    return localStorage.getItem(STORE_KEY)
  } catch {
    return null
  }
}

export default function SellerLayout() {
  const { data: stores = [], isLoading, error } = useMyStores()
  const [selectedId, setSelectedId] = useState(readSavedStoreId)

  // the saved store may have been deleted, so fall back to the first one
  const shop = stores.find((s) => s.id === selectedId) ?? stores[0] ?? null

  const selectStore = (id) => {
    try {
      localStorage.setItem(STORE_KEY, id)
    } catch {
      // ignore: the choice just won't survive a reload
    }
    setSelectedId(id)
  }

  // ---------- GATE: onboarding comes before the panel ----------
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-500">
        Loading…
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-red-600">
        {error.message}
      </div>
    )
  }

  if (stores.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-xl">
          <h1 className="mb-1 text-2xl font-bold text-gray-900">
            Create your store
          </h1>
          <p className="mb-6 text-sm text-gray-500">
            Set up your store to get started. You can add products once it's
            created.
          </p>
          <CreateShopForm onCreated={(s) => s && selectStore(s.id)} />
          <Link
            to="/"
            className="mt-6 inline-block text-xs text-gray-500 hover:text-gray-900"
          >
            ← Back to store
          </Link>
        </div>
      </div>
    )
  }

  // ---------- PANEL (only reached when the owner has a store) ----------
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="flex w-56 shrink-0 flex-col bg-gray-900 text-white">
        <div className="border-b border-white/10 px-5 py-5">
          <span className="text-lg font-bold">Seller Panel</span>
          {stores.length === 1 && (
            <p className="mt-1 truncate text-xs text-white/60">{shop.name}</p>
          )}
          {stores.length > 1 && (
            <select
              value={shop.id}
              onChange={(e) => selectStore(e.target.value)}
              className="mt-2 w-full rounded bg-white/10 px-2 py-1 text-xs text-white"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id} className="text-black">
                  {s.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <nav className="flex-1 py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/seller"}
              className={({ isActive }) =>
                `block px-5 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-white/10 font-semibold"
                    : "text-white/70 hover:bg-white/5"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Link
          to="/"
          className="border-t border-white/10 px-5 py-4 text-xs text-white/60 hover:text-white"
        >
          ← Back to store
        </Link>
      </aside>

      <main className="min-w-0 flex-1 p-8">
        <Outlet
          context={{
            shop,
            setShop: (s) => s && selectStore(s.id),
            stores,
            selectStore,
            shopLoading: false,
            shopError: "",
          }}
        />
      </main>
    </div>
  )
}