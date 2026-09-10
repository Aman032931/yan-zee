import { Link } from "react-router-dom";
import { IoMdHeartEmpty } from "react-icons/io";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const HeaderIcons = () => {
  const { totalItems } = useCart();
  const { totalWishlisted } = useWishlist();

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Link
        to="/wishlist"
        className="relative hidden sm:flex h-10 w-10 items-center justify-center rounded-full text-slate-800 transition-colors duration-200 hover:bg-slate-100"
        aria-label="Wishlist"
      >
        <IoMdHeartEmpty className="text-[22px]" />
        {totalWishlisted > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
            {totalWishlisted}
          </span>
        )}
      </Link>

      <Link
        to="/cart"
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-800 transition-colors duration-200 hover:bg-slate-100"
        aria-label="Shopping cart"
      >
        <AiOutlineShoppingCart className="text-[22px]" />
        {totalItems > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
            {totalItems}
          </span>
        )}
      </Link>
    </div>
  );
};

export default HeaderIcons;
