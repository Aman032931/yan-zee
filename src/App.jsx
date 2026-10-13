import React from "react"
import { Navigate, useLocation, useNavigate, useRoutes } from "react-router-dom"

import Announcement from "./components/Announcement"
import Header from "./components/Header"
import Footer from "./components/Footer"
import ScrollToTop from "./components/ScrollToTop"

import Home from "./pages/Home"
import Beauty from "./pages/Beauty"
import Cart from "./pages/Cart"
import Checkout from "./pages/Checkout"
import Fashion from "./pages/Fashion"
import Sports from "./pages/Sports"
import Wishlist from "./pages/Wishlist"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import ProductDetail from "./pages/ProductDetail"

import Outlet from "./pages/Outlet"
import Premium from "./pages/Premium"
import Kids from "./pages/Kids"
import HomeDecor from "./pages/HomeDecor"
import SearchResults from "./pages/SearchResults"
import NotFound from "./pages/NotFound"

import { GenderProvider } from "./context/GenderContext"
import { ToastProvider } from "./context/ToastContext"

import Toast from "./components/Toast"
import ProtectedRoute from "./components/ProtectedRoute"

import AdminLayout from "./components/admin/AdminLayout"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminProducts from "./pages/admin/AdminProducts"
import AdminOrders from "./pages/admin/AdminOrders"
import AdminUsers from "./pages/admin/AdminUsers"

import SellerLayout from "./components/seller/SellerLayout"
import SellerDashboard from "./pages/seller/SellerDashboard"
import SellerProducts from "./pages/seller/SellerProducts"
import SellerProductDetail from "./pages/seller/SellerProductDetail"
import SellerCategories from "./pages/seller/SellerCategories"
import SellerBrands from "./pages/seller/SellerBrands"
import SellerOrders from "./pages/seller/SellerOrders"
import SellerSettings from "./pages/seller/SellerSettings"
import SellerCategoryDetail from "./pages/seller/SellerCategoryDetails"


import Profile from "./pages/Profile"

function App() {
  const location = useLocation()
  const navigate = useNavigate()

  const authRef = React.useRef(null)

  const isLogin = location.pathname === "/login"
  const isSignup = location.pathname === "/signup"
  const isAuthPopup = isLogin || isSignup

  // Keep the previous page visible behind Login / Signup.
  const backgroundLocation = location.state?.backgroundLocation || null

  // For direct visits to /login or /signup, show the homepage
  // behind the authentication modal.
  const routeLocation = isAuthPopup
    ? backgroundLocation || { ...location, pathname: "/" }
    : location

  const isDashboardRoute =
    routeLocation.pathname.startsWith("/admin") ||
    routeLocation.pathname.startsWith("/seller") ||
    routeLocation.pathname.startsWith("/shop-owner")

  const returnTo = location.state?.from || backgroundLocation?.pathname || "/"

  const closePopup = React.useCallback(() => {
    navigate(returnTo, { replace: true })
  }, [navigate, returnTo])

  // Close authentication popup when clicking outside.
  React.useEffect(() => {
    if (!isAuthPopup) return

    const handleClickOutside = (event) => {
      if (authRef.current && !authRef.current.contains(event.target)) {
        closePopup()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isAuthPopup, closePopup])

  const routes = [
    // PUBLIC STOREFRONT
    { path: "/", element: <Home /> },
    { path: "/home", element: <Home /> },
    { path: "/fashion", element: <Fashion /> },
    { path: "/beauty", element: <Beauty /> },
    { path: "/sports", element: <Sports /> },
    { path: "/outlet", element: <Outlet /> },
    { path: "/kids", element: <Kids /> },
    { path: "/premium", element: <Premium /> },
    { path: "/home-decor", element: <HomeDecor /> },
    { path: "/search", element: <SearchResults /> },
    { path: "/product/:id", element: <ProductDetail /> },

    // CUSTOMER-ONLY PAGES
    {
      element: <ProtectedRoute roles={["CUSTOMER"]} />,
      children: [
        { path: "/cart", element: <Cart /> },
        { path: "/checkout", element: <Checkout /> },
        { path: "/wishlist", element: <Wishlist /> },
      ],
    },

    // PROFILE
    {
      element: (
        <ProtectedRoute roles={["CUSTOMER", "OWNER", "SHOP_OWNER", "ADMIN"]} />
      ),
      children: [{ path: "/profile", element: <Profile /> }],
    },

    // OLD SETUP URL -> onboarding now lives inside the seller panel
    {
      path: "/shop-owner/setup-shop",
      element: <Navigate to="/seller" replace />,
    },

    // ADMIN PANEL
    {
      path: "/admin",
      element: <ProtectedRoute roles={["ADMIN"]} />,
      children: [
        {
          element: <AdminLayout />,
          children: [
            { index: true, element: <AdminDashboard /> },
            { path: "products", element: <AdminProducts /> },
            { path: "orders", element: <AdminOrders /> },
            { path: "users", element: <AdminUsers /> },
            { path: "*", element: <NotFound /> },
          ],
        },
      ],
    },

    // SELLER PANEL
    {
      path: "/seller",
      element: <ProtectedRoute roles={["OWNER", "SHOP_OWNER"]} />,
      children: [
        {
          element: <SellerLayout />,
          children: [
            { index: true, element: <SellerDashboard /> },
            { path: "products", element: <SellerProducts /> },
            { path: "products/:id", element: <SellerProductDetail /> },
            { path: "categories", element: <SellerCategories /> },
            { path: "categories/:id", element: <SellerCategoryDetail/>},
            { path: "brands", element: <SellerBrands /> },
            { path: "orders", element: <SellerOrders /> },
            { path: "settings", element: <SellerSettings /> },
            { path: "*", element: <NotFound /> },
          ],
        },
      ],
    },

    // UNKNOWN ROUTES
    { path: "*", element: <NotFound /> },
  ]

  const routeElements = useRoutes(routes, routeLocation)

  return (
    <GenderProvider>
      <ToastProvider>
        <ScrollToTop />

        {!isDashboardRoute && <Announcement />}
        {!isDashboardRoute && <Header />}

        <main className={isDashboardRoute ? "" : "min-h-[30vh]"}>
          {routeElements}
        </main>

        {!isDashboardRoute && <Footer />}

        {/* LOGIN / SIGNUP POPUP */}
        {isAuthPopup && (
          <div className="auth-modal-layer">
            <div className="auth-modal-wrapper" ref={authRef}>
              {isLogin && <Login />}
              {isSignup && <Signup />}
            </div>
          </div>
        )}

        <Toast />
      </ToastProvider>
    </GenderProvider>
  )
}

export default App
