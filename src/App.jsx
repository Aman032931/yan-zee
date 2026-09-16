import { useLocation, useNavigate } from "react-router-dom";
import React from "react";
import Announcement from "./components/Announcement";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import ScrollToTop from "./components/ScrollToTop";


import Beauty from "./pages/Beauty";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Fashion from "./pages/Fashion";
import Sports from "./pages/Sports";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProductDetail from "./pages/ProductDetail";

function App() {
    const location = useLocation();
    const navigate = useNavigate();
    const authRef = React.useRef(null);

    const isLogin = location.pathname === "/login";
    const isSignup = location.pathname === "/signup";

    const isAuthPopup = isLogin || isSignup;
      React.useEffect(() =>{
        const handleClickOutside = (event) => {
            if (authRef.current && !authRef.current.contains(event.target)) {
                closePopup();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
        console.log("Auth popup is open:", isAuthPopup);
    })


    /*
     * Page where the user originally opened
     * Login / Signup
     */
    const returnTo = location.state?.from || "/";

    const backgroundPath = isAuthPopup ? returnTo : location.pathname;


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

                {backgroundPath === "/" && (
                        <Home />
                    )}


                {/* ALL */}

                {backgroundPath === "/all" && (
                        <Home />
                    )}


                {/* FASHION */}

                {backgroundPath === "/fashion" && (
                        <Fashion />
                    )}


                {/* BEAUTY */}

                {backgroundPath === "/beauty" && (
                        <Beauty />
                    )}


                {/* SPORTS */}

                {backgroundPath === "/sports" && (
                        <Sports />
                    )}


                {/* CART */}

                {backgroundPath === "/cart" && (
                        <Cart />
                    )}


                {/* CHECKOUT */}

                {backgroundPath === "/checkout" && (
                        <Checkout />
                    )}


                {/* WISHLIST */}

                {backgroundPath === "/wishlist" && (
                        <Wishlist />
                    )}


                {/* PRODUCT */}

                {backgroundPath.startsWith("/product/") && (
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
                >

                    <div
                        className="auth-modal-wrapper"
                        ref={authRef}
                    >

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