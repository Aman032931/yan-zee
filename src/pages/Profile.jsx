import { Link } from "react-router-dom"
import {
  User,
  ShoppingBag,
  Heart,
  Bookmark,
  MapPin,
  Settings,
  Store,
  Package,
  PlusCircle,
  LogOut,
} from "lucide-react"
import { useAuth } from "../context/useAuth"

export default function Profile() {
  const { currentUser, logout } = useAuth()

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <User className="mx-auto mb-4 h-12 w-12 text-gray-400" />

        <h1 className="text-2xl font-semibold text-gray-900">
          Please log in
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          You need to log in to view your profile.
        </p>

        <Link
          to="/login"
          className="mt-6 inline-flex rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Login
        </Link>
      </div>
    )
  }

  const isShopOwner = currentUser.role === "SHOP_OWNER"

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Profile Header */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-black text-2xl font-semibold text-white">
              {currentUser.fullName?.charAt(0)?.toUpperCase() ||
                currentUser.name?.charAt(0)?.toUpperCase() ||
                "U"}
            </div>

            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">
                {currentUser.fullName || currentUser.name || "User"}
              </h1>

              <p className="mt-1 break-all text-sm text-gray-500">
                {currentUser.email}
              </p>

              <span className="mt-3 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                {isShopOwner ? "Shop Owner" : "Customer"}
              </span>
            </div>
          </div>
        </section>

        {/* Account */}
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            My Account
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

            <ProfileLink
              to="/profile"
              icon={User}
              title="Personal Information"
              description="View and update your profile"
            />

            <ProfileLink
              to="/orders"
              icon={ShoppingBag}
              title="My Orders"
              description="View your orders and purchases"
            />

            <ProfileLink
              to="/wishlist"
              icon={Heart}
              title="Wishlist"
              description="View your saved products"
            />

            <ProfileLink
              to="/cart"
              icon={Bookmark}
              title="Saved for Later"
              description="Products saved from your cart"
            />

            <ProfileLink
              to="/addresses"
              icon={MapPin}
              title="Addresses"
              description="Manage your delivery addresses"
            />

            <ProfileLink
              to="/settings"
              icon={Settings}
              title="Account Settings"
              description="Manage your account preferences"
            />

          </div>
        </section>

        {/* Shop Owner */}
        {isShopOwner && (
          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Shop Owner
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Manage your shop and products
                </p>
              </div>

              <Store className="h-6 w-6 text-gray-700" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

              <ProfileLink
                to="/seller/add-shop"
                icon={PlusCircle}
                title="Add Shop"
                description="Create your shop"
              />

              <ProfileLink
                to="/seller/shop"
                icon={Store}
                title="My Shop"
                description="View and manage your shop"
              />

              <ProfileLink
                to="/seller/products"
                icon={Package}
                title="Manage Products"
                description="Add and manage products"
              />

              <ProfileLink
                to="/seller/orders"
                icon={ShoppingBag}
                title="Seller Orders"
                description="Manage customer orders"
              />

            </div>
          </section>
        )}

        {/* Logout */}
        <section className="mt-8 border-t border-gray-200 pt-6">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 sm:w-auto sm:px-6"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </section>

      </div>
    </main>
  )
}

function ProfileLink({ to, icon: Icon, title, description }) {
  return (
    <Link
      to={to}
      className="group flex min-w-0 items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:shadow-sm"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 transition group-hover:bg-gray-200">
        <Icon className="h-5 w-5 text-gray-700" />
      </div>

      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-gray-900">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          {description}
        </p>
      </div>
    </Link>
  )
}
