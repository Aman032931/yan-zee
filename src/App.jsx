import React from "react";
import { useLocation, useNavigate, useRoutes } from "react-router-dom";

import Announcement from "./components/Announcement";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

import Home from "./pages/Home";
import Beauty from "./pages/Beauty";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Fashion from "./pages/Fashion";
import Sports from "./pages/Sports";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProductDetail from "./pages/ProductDetail";

import Outlet from "./pages/Outlet";
import Premium from "./pages/Premium";
import Kids from "./pages/Kids";
import HomeDecor from "./pages/HomeDecor";
import SearchResults from "./pages/SearchResults";
import NotFound from "./pages/NotFound";

import { GenderProvider } from "./context/GenderContext";

import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";

import SellerLayout from "./components/seller/SellerLayout";
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerProducts from "./pages/seller/SellerProducts";
import SellerCategories from "./pages/seller/SellerCategories";
import SellerBrands from "./pages/seller/SellerBrands";
import SellerOrders from "./pages/seller/SellerOrders";
import SellerSettings from "./pages/seller/SellerSettings";

import { ToastProvider } from "./context/ToastContext";
import Toast from "./components/Toast";

import Profile from "./pages/Profile";
import RoleRoute from "./components/RoleRoute";
import AddShop from "./pages/seller/AddShop";

function App() {
const location = useLocation();
const navigate = useNavigate();

const authRef = React.useRef(null);

const isLogin = location.pathname === "/login";
const isSignup = location.pathname === "/signup";
const isAuthPopup = isLogin || isSignup;

/*

* Background location allows Login / Signup
* to appear over the page the user came from.
  */
  const backgroundLocation =
  location.state?.backgroundLocation || null;

const routeLocation =
isAuthPopup && backgroundLocation
? backgroundLocation
: location;

/*

* Dashboard routes use their own layouts,
* without the customer storefront header/footer.
  */
  const isDashboardRoute =
  routeLocation.pathname.startsWith("/admin") ||
  routeLocation.pathname.startsWith("/seller") ||
  routeLocation.pathname.startsWith("/shop-owner");

const returnTo =
location.state?.from ||
backgroundLocation?.pathname ||
"/";

const closePopup = () => {
navigate(returnTo);
};

/*

* Close Login / Signup when clicking outside
* the authentication popup.
  */
  React.useEffect(() => {
  const handleClickOutside = (event) => {
  if (
  authRef.current &&
  !authRef.current.contains(event.target)
  ) {
  closePopup();
  }
  };


if (isAuthPopup) {



  document.addEventListener(
    "mousedown",
    handleClickOutside
  );
}

return () => {
  document.removeEventListener(
    "mousedown",
    handleClickOutside
  );
};


}, [isAuthPopup, returnTo]);

const routes = [
/*
* CUSTOMER STOREFRONT
*/
{
element: (
<RoleRoute
allowedRoles={["CUSTOMER"]}
allowGuest={true}
/>
),
children: [
{ path: "/", element: <Home /> },
{ path: "/home", element: <Home /> },
{ path: "/fashion", element: <Fashion /> },
{ path: "/beauty", element: <Beauty /> },
{ path: "/sports", element: <Sports /> },
{ path: "/outlet", element: <Outlet /> },
{ path: "/kids", element: <Kids /> },
{ path: "/premium", element: <Premium /> },
{ path: "/home-decor", element: <HomeDecor /> },
{ path: "/cart", element: <Cart /> },
{ path: "/checkout", element: <Checkout /> },
{ path: "/wishlist", element: <Wishlist /> },
{ path: "/search", element: <SearchResults /> },
{ path: "/product/:id", element: <ProductDetail /> },
],
},


/*
 * PROFILE
 */
{
  element: (
    <RoleRoute
      allowedRoles={["CUSTOMER", "SHOP_OWNER"]}
    />
  ),
  children: [
    {
      path: "/profile",
      element: <Profile />,
    },
  ],
},

/*
 * SHOP OWNER SETUP
 */
{
  path: "/shop-owner",
  element: (
    <RoleRoute
      allowedRoles={["SHOP_OWNER"]}
    />
  ),
  children: [
    {
      path: "setup-shop",
      element: <AddShop />,
    },
  ],
},

/*
 * ADMIN PANEL
 */
{
  path: "/admin",
  element: (
    <RoleRoute
      allowedRoles={["ADMIN"]}
    />
  ),
  children: [
    {
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
  ],
},

/*
 * SELLER / SHOP OWNER PANEL
 */
{
  path: "/seller",
  element: (
    <RoleRoute
      allowedRoles={["SHOP_OWNER"]}
    />
  ),
  children: [
    {
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
          path: "categories",
          element: <SellerCategories />,
        },
        {
          path: "brands",
          element: <SellerBrands />,
        },
        {
          path: "orders",
          element: <SellerOrders />,
        },
        {
          path: "settings",
          element: <SellerSettings />,
        },
        {
          path: "*",
          element: <NotFound />,
        },
      ],
    },
  ],
},

/*
 * UNKNOWN PAGE
 */
{
  path: "*",
  element: <NotFound />,
},


];

/*

* Passing routeLocation allows the original page
* to remain visible behind Login / Signup.
  */
  const routeElements = useRoutes(
  routes,
  routeLocation
  );

return ( <GenderProvider> <ToastProvider> <ScrollToTop />


    {!isDashboardRoute && <Announcement />}
    {!isDashboardRoute && <Header />}

    <main
      className={
        isDashboardRoute
          ? ""
          : "min-h-[30vh]"
      }
    >
      {routeElements}
    </main>

    {!isDashboardRoute && <Footer />}

    {/* LOGIN / SIGNUP POPUP */}
    {isAuthPopup && (
      <div className="auth-modal-layer">
        <div
          className="auth-modal-wrapper"
          ref={authRef}
        >
          {isLogin && <Login />}
          {isSignup && <Signup />}
        </div>
      </div>
    )}

    <Toast />
  </ToastProvider>
</GenderProvider>


);
}

export default App;
