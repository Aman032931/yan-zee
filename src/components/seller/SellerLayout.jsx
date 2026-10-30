import { useState, useEffect } from "react"
import { NavLink, Outlet, Link } from "react-router-dom"
import {
  LayoutDashboard,
  Package,
  Boxes,
  Tags,
  Tag,
  ShoppingBag,
  Settings,
  Store,
  ChevronDown,
  ArrowLeft,
  Menu,
  ExternalLink,
  Plus,
  Check,
  X,
} from "lucide-react"

import { useMyStores } from "../../hooks/useStores"
import CreateShopForm from "./CreateShopForm"

const NAV_ITEMS = [
  { label: "Dashboard", to: "/seller", icon: LayoutDashboard },
  { label: "My Products", to: "/seller/products", icon: Package },
  { label: "Inventory", to: "/seller/inventory", icon: Boxes },
  { label: "Categories", to: "/seller/categories", icon: Tags },
  { label: "Brands", to: "/seller/brands", icon: Tag },
  { label: "Orders", to: "/seller/orders", icon: ShoppingBag },
  { label: "Shops", to: "/seller/shops", icon: Store },
  { label: "Settings", to: "/seller/settings", icon: Settings },
]

const STORE_KEY = "yanzee_store_id"

// Display the uploaded logo, or a fallback icon.
function StoreLogo({ store, size = "h-10 w-10" }) {
  const [imageFailed, setImageFailed] = useState(false)
  const logoUrl = store?.logo || ""

  useEffect(() => {
    setImageFailed(false)
  }, [logoUrl])

  return (
    <span
      className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-lg border border-yz-border bg-white text-brand-red-600 shadow-sm`}
    >
      {logoUrl && !imageFailed ? (
        <img
          src={logoUrl}
          alt={`${store?.name || "Store"} logo`}
          className="h-full w-full object-contain p-1"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <Store size={19} />
      )}
    </span>
  )
}

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
  const [mobileOpen, setMobileOpen] = useState(false)
  const [storeMenuOpen, setStoreMenuOpen] = useState(false)
  const [addingStore, setAddingStore] = useState(false)

  const shop =
    stores.find((store) => store.id === selectedId) ?? stores[0] ?? null

  useEffect(() => {
    if (!storeMenuOpen) return

    const handleOutsideClick = (event) => {
      const target = event.target

      if (
        !(target instanceof Element) ||
        !target.closest("[data-store-menu]")
      ) {
        setStoreMenuOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setStoreMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [storeMenuOpen])

  useEffect(() => {
    if (!addingStore) return

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setAddingStore(false)
      }
    }

    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [addingStore])

  const selectStore = (id) => {
    try {
      localStorage.setItem(STORE_KEY, id)
    } catch {
      // Keep selection in component state.
    }

    setSelectedId(id)
    setStoreMenuOpen(false)
    setAddingStore(false)
  }

  const handleStoreCreated = (newStore) => {
    if (newStore?.id) {
      selectStore(newStore.id)
    }
  }

  const openAddStore = () => {
    setStoreMenuOpen(false)
    setMobileOpen(false)
    setAddingStore(true)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-yz-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-red-600/20 border-t-brand-red-600" />

          <p className="text-sm font-medium text-zinc-500">
            Loading your seller workspace...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-yz-bg px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
          <Store
            className="mx-auto mb-4 text-brand-red-600"
            size={28}
          />

          <h1 className="text-xl font-semibold text-zinc-900">
            Unable to load your stores
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            {error.message || "Please try again in a moment."}
          </p>
        </div>
      </div>
    )
  }

  if (stores.length === 0) {
    return (
      <div className="min-h-screen bg-yz-bg px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-brand-red-600"
          >
            <ArrowLeft size={16} />
            Back to YanZee
          </Link>

          <div className="overflow-hidden rounded-2xl border border-yz-border bg-white shadow-sm">
            <div className="bg-brand-red-600 px-6 py-7 text-white sm:px-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                <Store size={25} />
              </div>

              <p className="text-sm font-medium text-white/80">
                YANZEE SELLER STUDIO
              </p>

              <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
                Create your store
              </h1>

              <p className="mt-2 max-w-lg text-sm leading-6 text-white/85">
                Set up your store to start managing your products on YanZee.
              </p>
            </div>

            <div className="p-5 sm:p-8">
              <CreateShopForm onCreated={handleStoreCreated} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const sidebar = (
    <aside className="flex h-full w-65 shrink-0 flex-col overflow-hidden border-r border-yz-border bg-white">
      <Link
        to="/"
        className="flex items-center gap-3 border-b border-yz-border px-5 py-5"
        onClick={() => setMobileOpen(false)}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red-600 text-white shadow-sm">
          <ShoppingBag size={21} />
        </span>

        <span className="min-w-0">
          <span className="block text-xl font-bold tracking-tight text-zinc-900">
            YanZee
          </span>

          <span className="block text-[10px] font-semibold tracking-[0.18em] text-brand-red-600">
            SELLER STUDIO
          </span>
        </span>
      </Link>

      {/* Store switcher */}
      <div className="border-b border-yz-border p-4">
        <p className="mb-2 px-1 text-[10px] font-bold tracking-[0.16em] text-zinc-500 uppercase">
          Your store
        </p>

        <div className="relative" data-store-menu>
          <button
            type="button"
            aria-label="Choose store or add a store"
            aria-expanded={storeMenuOpen}
            onClick={() => setStoreMenuOpen((open) => !open)}
            className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
              storeMenuOpen
                ? "border-brand-red-600/40 bg-red-50/50"
                : "border-yz-border bg-yz-bg hover:border-brand-red-600/30"
            }`}
          >
            <StoreLogo store={shop} />

            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-zinc-900">
                {shop?.name || "My Store"}
              </span>

              <span className="mt-0.5 block text-xs text-zinc-500">
                Seller workspace
              </span>
            </span>

            <ChevronDown
              size={16}
              className={`shrink-0 text-zinc-400 transition-transform ${
                storeMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {storeMenuOpen && (
            <div className="absolute top-full right-0 left-0 z-[60] mt-2 overflow-hidden rounded-xl border border-yz-border bg-white p-1.5 shadow-lg">
              <p className="px-3 py-2 text-[10px] font-bold tracking-[0.14em] text-zinc-400 uppercase">
                Switch store
              </p>

              <div className="max-h-56 overflow-y-auto">
                {stores.map((store) => {
                  const isSelected = store.id === shop?.id

                  return (
                    <button
                      key={store.id}
                      type="button"
                      onClick={() => {
                        selectStore(store.id)
                        setMobileOpen(false)
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                        isSelected
                          ? "bg-red-50 text-brand-red-600"
                          : "text-zinc-700 hover:bg-zinc-50"
                      }`}
                    >
                      <StoreLogo store={store} size="h-9 w-9" />

                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {store.name || "My Store"}
                      </span>

                      {isSelected && (
                        <Check size={16} className="shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="my-1 border-t border-yz-border" />

              <button
                type="button"
                onClick={openAddStore}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-brand-red-600 transition-colors hover:bg-red-50"
              >
                <Plus size={17} />
                Add Store
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.16em] text-zinc-500 uppercase">
          Workspace
        </p>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/seller"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${
                  isActive
                    ? "bg-red-50 font-semibold text-brand-red-600"
                    : "font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={19}
                    strokeWidth={isActive ? 2.3 : 1.8}
                    className={
                      isActive
                        ? "text-brand-red-600"
                        : "text-zinc-400 group-hover:text-zinc-700"
                    }
                  />

                  <span className="flex-1">{item.label}</span>

                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-red-600" />
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-yz-border p-3">
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-red-50 hover:text-brand-red-600"
        >
          <ArrowLeft size={18} />
          <span className="flex-1">Back to storefront</span>
          <ExternalLink size={14} />
        </Link>

        <div className="mt-2 rounded-xl bg-yz-bg px-3 py-3">
          <p className="text-xs font-semibold text-zinc-700">
            Selling on YanZee
          </p>

          <p className="mt-1 text-[11px] leading-5 text-zinc-500">
            Manage your store from one place.
          </p>
        </div>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-yz-bg">
      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebar}
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden h-full shrink-0 lg:block">
          {sidebar}
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <header className="z-30 flex h-[68px] shrink-0 items-center justify-between border-b border-yz-border bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Open navigation"
                onClick={() => setMobileOpen(true)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-yz-border text-zinc-700 hover:bg-yz-bg lg:hidden"
              >
                <Menu size={20} />
              </button>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-900">
                  Seller workspace
                </p>

                <p className="hidden truncate text-xs text-zinc-500 sm:block">
                  Welcome back to YanZee
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <span className="hidden text-xs font-medium text-zinc-500 sm:block">
                Your store
              </span>

              <span className="max-w-[120px] truncate rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-brand-red-600 sm:max-w-[180px]">
                {shop?.name || "My Store"}
              </span>

              <Link
                to="/"
                aria-label="Visit YanZee storefront"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-yz-border text-zinc-500 hover:border-brand-red-600 hover:text-brand-red-600"
              >
                <ExternalLink size={16} />
              </Link>
            </div>
          </header>

          {/* Independently scrolling page content */}
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:p-8">
            <Outlet
              context={{
                shop,
                setShop: (store) => store && selectStore(store.id),
                stores,
                selectStore,
                openAddStore,
                shopLoading: false,
                shopError: "",
              }}
            />
          </main>
        </div>
      </div>

      {/* Add Store popup */}
      {addingStore && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setAddingStore(false)
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-store-title"
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-yz-border bg-white shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-yz-border bg-white px-5 py-4 sm:px-7">
              <div>
                <h2
                  id="add-store-title"
                  className="text-lg font-semibold text-zinc-900"
                >
                  Add another store
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Set up another store for your business.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close add store popup"
                onClick={() => setAddingStore(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 sm:p-7">
              <CreateShopForm onCreated={handleStoreCreated} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}