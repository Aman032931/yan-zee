import React from "react"
import { useLocation, useNavigate, useRoutes } from "react-router-dom"

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

import AdminLayout from "./components/admin/AdminLayout"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminProducts from "./pages/admin/AdminProducts"
import AdminOrders from "./pages/admin/AdminOrders"
import AdminUsers from "./pages/admin/AdminUsers"

import SellerLayout from "./components/seller/SellerLayout"
import SellerDashboard from "./pages/seller/SellerDashboard"
import SellerProducts from "./pages/seller/SellerProducts"

import { ToastProvider } from "./context/ToastContext"
import Toast from "./components/Toast"

function App() {
  const location = useLocation()
  const navigate = useNavigate()

  const authRef = React.useRef(null)

  const isLogin = location.pathname === "/login"
  const isSignup = location.pathname === "/signup"

  const isAuthPopup = isLogin || isSignup

  const isDashboardRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/seller")

  /*
   * Page where the user originally opened
   * before opening Login / Signup.
   */
  const returnTo = location.state?.from || "/"

  /*
   * Close Login / Signup popup
   * and return to the previous page.
   */
  const closePopup = () => {
    navigate(returnTo)
  }

  /*
   * Close authentication popup
   * when clicking outside it.
   */
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (authRef.current && !authRef.current.contains(event.target)) {
        closePopup()
      }
    }

    if (isAuthPopup) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isAuthPopup, returnTo])

  /*
   * All normal website routes.
   *
   * These come mainly from feature-home,
   * while Login, Signup and Checkout are
   * kept from the auth branch.
   */
  const routeElements = useRoutes([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/home",
      element: <Home />,
    },
    {
      path: "/fashion",
      element: <Fashion />,
    },
    {
      path: "/beauty",
      element: <Beauty />,
    },
    {
      path: "/sports",
      element: <Sports />,
    },
    {
      path: "/outlet",
      element: <Outlet />,
    },
    {
      path: "/kids",
      element: <Kids />,
    },
    {
      path: "/premium",
      element: <Premium />,
    },
    {
      path: "/home-decor",
      element: <HomeDecor />,
    },
    {
      path: "/cart",
      element: <Cart />,
    },
    {
      path: "/checkout",
      element: <Checkout />,
    },
    {
      path: "/wishlist",
      element: <Wishlist />,
    },
    {
      path: "/search",
      element: <SearchResults />,
    },
    {
      path: "/product/:id",
      element: <ProductDetail />,
    },

    /*
     * Admin routes
     */
    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
        {
          index: true,
          element: <AdminDashboard />,
        },
        {
          path: "products",
          element: <AdminProducts />,
        },
        {
          path: "orders",
          element: <AdminOrders />,
        },
        {
          path: "users",
          element: <AdminUsers />,
        },
        {
          path: "*",
          element: <NotFound />,
        },
      ],
    },

    /*
     * Seller routes
     */
    {
      path: "/seller",
      element: <SellerLayout />,
      children: [
        {
          index: true,
          element: <SellerDashboard />,
        },
        {
          path: "products",
          element: <SellerProducts />,
        },
        {
          path: "*",
          element: <NotFound />,
        },
      ],
    },

    /*
     * Unknown pages
     */
    {
      path: "*",
      element: <NotFound />,
    },
  ])

  /*
   * When Login or Signup is open,
   * the website remains visible behind the popup.
   */
  const backgroundContent = isAuthPopup ? null : routeElements

  return (
    <GenderProvider>
      <ToastProvider>
      <ScrollToTop />

      {!isDashboardRoute && <Announcement />}
      {!isDashboardRoute && <Header />}
       
      <main className={isDashboardRoute ? "" : "min-h-[30vh]"}>
        {backgroundContent}
      </main>
    
      {!isDashboardRoute && <Footer />}

      {/* ==========================================
                LOGIN / SIGNUP POPUP
            ========================================== */}

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
