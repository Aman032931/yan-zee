import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function PageNavigation() {
  const location = useLocation();

  const getCurrentPage = () => {
    if (location.pathname === "/cart") {
      return "Cart";
    }

    if (location.pathname === "/wishlist") {
      return "Wishlist";
    }

    return "Home";
  };

  const currentPage = getCurrentPage();

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 text-sm">
        {/* Home */}
        <Link
          to="/home"
          className="text-gray-600 transition hover:text-black"
        >
          Home
        </Link>

        {/* Arrow */}
        {currentPage !== "Home" && (
          <>
            <ChevronRight className="h-4 w-4 text-gray-400" />

            {/* Current Page */}
            <span className="font-medium text-black">
              {currentPage}
            </span>
          </>
        )}
      </div>
    </div>
  );
}