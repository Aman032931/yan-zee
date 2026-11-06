import { useState, useEffect } from "react"
import { NavLink, Outlet, Link, useLocation } from "react-router-dom"
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
  MapPin,
  Users,
  Sparkles,
} from "lucide-react"

import { useMyStores } from "../../hooks/useStores"
import CreateShopForm from "./CreateShopForm"

const NAV_ITEMS = [
  { label: "Dashboard", to: "/seller", icon: LayoutDashboard },
  { label: "Categories", to: "/seller/categories", icon: Tags },
  { label: "Brands", to: "/seller/brands", icon: Tag },
  { label: "My Products", to: "/seller/products", icon: Package },
  {
    label: "Inventory",
    to: "/seller/inventory",
    icon: Boxes,
    children: [
      { label: "Search inventory", to: "/seller/inventory/stock" },
      { label: "Stock movements", to: "/seller/inventory/movements" },
    ],
  },
  { label: "Outlets", to: "/seller/outlets", icon: MapPin },
  { label: "Customers", to: "/seller/customers", icon: Users },
  { label: "Orders", to: "/seller/orders", icon: ShoppingBag },
  { label: "Shops", to: "/seller/shops", icon: Store },
  { label: "Settings", to: "/seller/settings", icon: Settings },
]

const STORE_KEY = "yanzee_store_id"

function StoreLogo({ store, size = "h-10 w-10" }) {
  const [imageFailed, setImageFailed] = useState(false)
  const logoUrl = store?.logo || ""

  useEffect(() => {
    setImageFailed(false)
  }, [logoUrl])

  return (
    <span
      className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-white text-brand-red-600 shadow-sm`}
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
  const { pathname } = useLocation()

  const [selectedId, setSelectedId] = useState(readSavedStoreId)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [storeMenuOpen, setStoreMenuOpen] = useState(false)
  const [addingStore, setAddingStore] = useState(false)
  const [openGroups, setOpenGroups] = useState({})

  // A nav group is open when the user toggled it, or by default when the
  // current page is inside it.
  const isGroupOpen = (key) => openGroups[key] ?? pathname.startsWith(key)

  const toggleGroup = (key) =>
    setOpenGroups((groups) => ({ ...groups, [key]: !isGroupOpen(key) }))

  const shop =
    stores.find((store) => store.id === selectedId) ?? stores[0] ?? null

  // Keep selected store synchronized with localStorage.
  useEffect(() => {
    if (!stores.length) return

    const savedStoreExists = stores.some(
      (store) => store.id === selectedId
    )

    if (!savedStoreExists) {
      const firstStore = stores[0]

      setSelectedId(firstStore.id)

      try {
        localStorage.setItem(STORE_KEY, firstStore.id)
      } catch {
        // Keep selection in component state.
      }
    }
  }, [stores, selectedId])

  // Close store dropdown when clicking outside or pressing Escape.
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

  // Close Add Store popup with Escape.
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
          <div className="h-11 w-11 animate-spin rounded-full border-4 border-brand-red-600/20 border-t-brand-red-600" />
          <p className="text-sm font-semibold text-zinc-500">
            Loading your seller workspace...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-yz-bg px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-7 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-brand-red-600">
            <Store size={27} />
          </div>

          <h1 className="text-xl font-bold text-zinc-900">
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
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 transition-colors hover:text-brand-red-600"
          >
            <ArrowLeft size={16} />
            Back to YanZee
          </Link>

          <div className="overflow-hidden rounded-3xl border border-yz-border bg-white shadow-xl">
            <div className="relative overflow-hidden bg-brand-red-600 px-6 py-9 text-white sm:px-9">
              <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full border-[35px] border-white/10" />
              <div className="absolute -bottom-24 right-28 h-48 w-48 rounded-full bg-white/10" />

              <div className="relative">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-lg">
                  <Store size={27} />
                </div>

                <p className="text-xs font-bold tracking-[0.2em] text-white/75">
                  YANZEE SELLER STUDIO
                </p>

                <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Create your store
                </h1>

                <p className="mt-3 max-w-lg text-sm leading-6 text-white/85">
                  Set up your store and start managing your products,
                  customers and orders from one place.
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-9">
              <CreateShopForm onCreated={handleStoreCreated} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const sidebar = (
    <aside className="flex h-full w-[272px] shrink-0 flex-col overflow-hidden bg-white">
      {/* Brand section */}
      <Link
        to="/"
        onClick={() => setMobileOpen(false)}
        className="group relative flex h-[76px] min-h-[76px] shrink-0 items-center gap-3 overflow-hidden border-b border-white/10 bg-brand-red-600 px-5 py-3"
      >
        <div className="absolute -right-8 -top-12 h-36 w-36 rounded-full border-[18px] border-white/10 transition-transform duration-500 group-hover:scale-110" />

        <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand-red-600 shadow-lg">
          <ShoppingBag size={23} strokeWidth={2.5} />
        </span>

        <span className="relative min-w-0">
          <span className="block text-2xl font-extrabold tracking-tight text-white">
            YanZee
          </span>
          <span className="mt-0.5 block text-[10px] font-bold tracking-[0.2em] text-white/75">
            SELLER STUDIO
          </span>
        </span>
      </Link>

      {/* Store switcher */}
      <div className="border-b border-yz-border p-4">
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-zinc-400">
            Your store
          </p>
          <span className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
        </div>

        <div className="relative" data-store-menu>
          <button
            type="button"
            aria-label="Choose store or add a store"
            aria-expanded={storeMenuOpen}
            onClick={() => setStoreMenuOpen((open) => !open)}
            className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
              storeMenuOpen
                ? "border-brand-red-600 bg-red-50 shadow-sm"
                : "border-yz-border bg-yz-bg hover:border-brand-red-600/50 hover:bg-red-50/40"
            }`}
          >
            <StoreLogo store={shop} />

            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-zinc-900">
                {shop?.name || "My Store"}
              </span>
              <span className="mt-0.5 block text-[11px] font-medium text-zinc-500">
                Active workspace
              </span>
            </span>

            <ChevronDown
              size={17}
              className={`shrink-0 text-zinc-500 transition-transform ${
                storeMenuOpen ? "rotate-180 text-brand-red-600" : ""
              }`}
            />
          </button>

          {storeMenuOpen && (
            <div className="absolute left-0 right-0 top-full z-[60] mt-2 overflow-hidden rounded-xl border border-yz-border bg-white p-1.5 shadow-xl">
              <p className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-zinc-400">
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

                      <span className="min-w-0 flex-1 truncate text-sm font-semibold">
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
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-brand-red-600 transition-colors hover:bg-red-50"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50">
                  <Plus size={16} />
                </span>
                Add Store
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-5">
        <div className="mb-3 flex items-center justify-between px-3">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-zinc-400">
            Workspace
          </p>
          <Sparkles size={13} className="text-brand-red-600/60" />
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon

          // Expandable group (Inventory)
          if (item.children) {
            const open = isGroupOpen(item.to)
            const groupActive = pathname.startsWith(item.to)

            return (
              <div key={item.to}>
                <div
                  className={`flex items-center rounded-xl transition-colors ${
                    groupActive ? "bg-red-50" : "hover:bg-zinc-50"
                  }`}
                >
                  <NavLink
                    to={item.to}
                    end
                    onClick={() => {
                      setOpenGroups((groups) => ({
                        ...groups,
                        [item.to]: true,
                      }))
                      setMobileOpen(false)
                    }}
                    className={`flex flex-1 items-center gap-3 px-3 py-3 text-sm ${
                      groupActive
                        ? "font-semibold text-brand-red-600"
                        : "font-medium text-zinc-600 hover:text-zinc-950"
                    }`}
                  >
                    <Icon
                      size={19}
                      strokeWidth={groupActive ? 2.3 : 1.8}
                      className={
                        groupActive ? "text-brand-red-600" : "text-zinc-400"
                      }
                    />
                    <span className="flex-1">{item.label}</span>
                  </NavLink>

                  <button
                    type="button"
                    aria-label={`${open ? "Collapse" : "Expand"} ${item.label}`}
                    aria-expanded={open}
                    onClick={() => toggleGroup(item.to)}
                    className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700"
                  >
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                {open && (
                  <div className="mt-1 ml-6 space-y-1 border-l border-yz-border pl-3">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          `block rounded-lg px-3 py-2 text-sm transition-colors ${
                            isActive
                              ? "bg-red-50 font-semibold text-brand-red-600"
                              : "font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                          }`
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          // Regular item
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/seller"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-3 text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-brand-red-600 font-bold text-white shadow-md shadow-red-600/20"
                    : "font-semibold text-zinc-600 hover:bg-red-50 hover:text-brand-red-600"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={19}
                    strokeWidth={isActive ? 2.5 : 1.9}
                    className={
                      isActive
                        ? "text-white"
                        : "text-zinc-400 transition-colors group-hover:text-brand-red-600"
                    }
                  />

                  <span className="flex-1">{item.label}</span>

                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Sidebar footer */}
      <div className="shrink-0 border-t border-yz-border p-3">
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-zinc-600 transition-colors hover:bg-red-50 hover:text-brand-red-600"
        >
          <ArrowLeft size={18} />
          <span className="flex-1">Back to storefront</span>
          <ExternalLink size={14} />
        </Link>

        <div className="relative mt-2 overflow-hidden rounded-xl bg-brand-red-600 p-3.5 text-white">
          <div className="absolute -right-5 -top-8 h-24 w-24 rounded-full border-[13px] border-white/10" />

          <div className="relative">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles size={15} />
              <p className="text-xs font-extrabold">
                Selling on YanZee
              </p>
            </div>

            <p className="text-[11px] leading-5 text-white/80">
              Your business, your products, all in one place.
            </p>
          </div>
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
          className="fixed inset-0 z-40 bg-zinc-950/50 backdrop-blur-[2px] lg:hidden"
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
        <div className="hidden h-full shrink-0 border-r border-yz-border lg:block">
          {sidebar}
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {/* Top header */}
          <header className="relative z-30 flex h-19 shrink-0 items-center justify-between border-b border-yz-border bg-white px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Open navigation"
                onClick={() => setMobileOpen(true)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-yz-border text-zinc-700 transition-colors hover:border-brand-red-600 hover:bg-red-50 hover:text-brand-red-600 lg:hidden"
              >
                <Menu size={20} />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="hidden h-2 w-2 rounded-full bg-brand-red-600 sm:block" />
                  <p className="truncate text-sm font-extrabold text-zinc-900 sm:text-base">
                    Seller workspace
                  </p>
                </div>

                <p className="mt-0.5 hidden truncate text-xs font-medium text-zinc-500 sm:block">
                  Manage your business with YanZee
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              <div className="hidden text-right sm:block">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Current store
                </p>
                <p className="max-w-[150px] truncate text-sm font-bold text-zinc-900">
                  {shop?.name || "My Store"}
                </p>
              </div>

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-brand-red-600 sm:hidden">
                <Store size={19} />
              </span>

              <Link
                to="/"
                aria-label="Visit YanZee storefront"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red-600 text-white shadow-sm shadow-red-600/20 transition-all hover:bg-brand-red-700 hover:shadow-md"
              >
                <ExternalLink size={17} />
              </Link>
            </div>
          </header>

          {/* Independently scrolling page content */}
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain bg-yz-bg p-4 sm:p-6 lg:p-8">
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/55 p-4 backdrop-blur-sm"
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
                <div className="mb-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-brand-red-600" />
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-brand-red-600">
                    YanZee Seller Studio
                  </p>
                </div>

                <h2
                  id="add-store-title"
                  className="text-lg font-extrabold text-zinc-900"
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
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-red-50 hover:text-brand-red-600"
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