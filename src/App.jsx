import { useRoutes } from "react-router-dom";
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


function App() {
  const routeElements = useRoutes([
    { path: "/", element: <Home /> },
    { path: "/all", element: <Home /> },
    { path: "/fashion", element: <Fashion /> },
    { path: "/beauty", element: <Beauty /> },
    { path: "/sports", element: <Sports /> },
    { path: "/outlet", element: <Outlet/>},
    { path: "/cart", element: <Cart /> },
    { path: "/wishlist", element: <Wishlist /> },
  ]);

  return (
    <>
      <Announcement />
      <Header />

      <main className="min-h-[30vh]">{routeElements}</main>

      <Footer />
    </>
  );
}

export default App;
