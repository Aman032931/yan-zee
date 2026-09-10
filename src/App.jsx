import { useLocation, useNavigate } from "react-router-dom";

import Announcement from "./components/Announcement";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import ScrollToTop from "./components/ScrollToTop";

import Beauty from "./pages/Beauty";
import Cart from "./pages/Cart";
import Fashion from "./pages/Fashion";
import Sports from "./pages/Sports";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProductDetail from "./pages/ProductDetail";

function App() {
    const location = useLocation();
    const navigate = useNavigate();

    const isLogin = location.pathname === "/login";
    const isSignup = location.pathname === "/signup";

    const isAuthPopup = isLogin || isSignup;


    /*
     * Page where the user originally opened
     * Login / Signup
     */
    const returnTo = location.state?.from || "/";


    const closePopup = () => {
        navigate(returnTo);
    };


    return (
        <>
            {/* =====================================================
                WEBSITE
            ===================================================== */}
            <ScrollToTop />

            <Announcement />

            <Header />

            <main>

                {/* HOME */}

                {!isAuthPopup &&
                    location.pathname === "/" && (
                        <Home />
                    )}


                {/* ALL */}

                {!isAuthPopup &&
                    location.pathname === "/all" && (
                        <Home />
                    )}


                {/* FASHION */}

                {!isAuthPopup &&
                    location.pathname === "/fashion" && (
                        <Fashion />
                    )}


                {/* BEAUTY */}

                {!isAuthPopup &&
                    location.pathname === "/beauty" && (
                        <Beauty />
                    )}


                {/* SPORTS */}

                {!isAuthPopup &&
                    location.pathname === "/sports" && (
                        <Sports />
                    )}


                {/* CART */}

                {!isAuthPopup &&
                    location.pathname === "/cart" && (
                        <Cart />
                    )}


                {/* WISHLIST */}

                {!isAuthPopup &&
                    location.pathname === "/wishlist" && (
                        <Wishlist />
                    )}


                {/* PRODUCT */}

                {!isAuthPopup &&
                    location.pathname.startsWith("/product/") && (
                        <ProductDetail />
                    )}

            </main>


            <Footer />


            {/* =====================================================
                LOGIN / SIGNUP POPUP
            ===================================================== */}

            {isAuthPopup && (

                <div
                    className="auth-modal-layer"

                    onMouseDown={(e) => {

                        /*
                         * Close if clicking outside
                         * the popup
                         */

                        if (e.target === e.currentTarget) {
                            closePopup();
                        }

                    }}
                >

                    <div className="auth-modal-wrapper">

                        {/* CLOSE */}

                        <button
                            type="button"
                            className="auth-close"
                            onClick={closePopup}
                            aria-label="Close"
                        >
                            ×
                        </button>


                        {/* LOGIN */}

                        {isLogin && (
                            <Login />
                        )}


                        {/* SIGNUP */}

                        {isSignup && (
                            <Signup />
                        )}

                    </div>

                </div>

            )}

        </>
    );
}

export default App;