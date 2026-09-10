import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // Don't scroll when switching between
        // Login and Signup popup
        if (
            pathname === "/login" ||
            pathname === "/signup"
        ) {
            return;
        }

        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

export default ScrollToTop;
