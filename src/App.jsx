import { useRoutes, useLocation } from "react-router-dom";
import Announcement from "./components/Announcement";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Beauty from "./pages/Beauty";
import Cart from "./pages/Cart";
import Fashion from "./pages/Fashion";
import Sports from "./pages/Sports";
import Wishlist from "./pages/Wishlist";
import Outlet from "./pages/Outlet";
import Premium from "./pages/Premium";
import Kids from "./pages/Kids";
import HomeDecor from "./pages/HomeDecor";
import SearchResults from "./pages/SearchResults";
import { GenderProvider } from "./context/GenderContext";

import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";

import SellerLayout from "./components/seller/SellerLayout";
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerProducts from "./pages/seller/SellerProducts";
import ProductDetail from "./pages/ProductDetail";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/seller');

  const routeElements = useRoutes([
    { path: "/", element: <Home /> },
    { path: "/all", element: <Home /> },
    { path: "/fashion", element: <Fashion /> },
    { path: "/beauty", element: <Beauty /> },
    { path: "/sports", element: <Sports /> },
    { path: "/outlet", element: <Outlet/>},
    { path: "/kids", element: <Kids/>},
    { path: "/premium", element: <Premium/>},
    { path: "/home-decor", element: <HomeDecor/>},
    { path: "/cart", element: <Cart /> },
    { path: "/wishlist", element: <Wishlist /> },
    { path: "/search", element: <SearchResults /> },
    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
        { index: true, element: <AdminDashboard /> },
        { path: "products", element: <AdminProducts /> },
        { path: "orders", element: <AdminOrders /> },
        { path: "users", element: <AdminUsers /> },
      ],
    },
    {
      path: "/seller",
      element: <SellerLayout />,
      children: [
        { index: true, element: <SellerDashboard /> },
        { path: "products", element: <SellerProducts /> },
      ],
    },
    { path: "/product/:id", element: <ProductDetail /> },
  ]);

  return (
    <GenderProvider>
      <ScrollToTop />
      {!isDashboardRoute && <Announcement />}
      {!isDashboardRoute && <Header />}

      <main className={isDashboardRoute ? "" : "min-h-[30vh]"}>{routeElements}</main>

      {!isDashboardRoute && <Footer />}
      
    </GenderProvider>
  );
}

export default App;