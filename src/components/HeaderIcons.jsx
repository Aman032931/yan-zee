import { Link } from "react-router-dom";
import { IoMdHeartEmpty } from "react-icons/io";
import { AiOutlineShoppingCart } from "react-icons/ai";

const HeaderIcons = () => {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Link
        to="/wishlist"
        className="relative hidden sm:flex h-10 w-10 items-center justify-center rounded-full text-slate-800 transition-colors duration-200 hover:bg-slate-100"
        aria-label="Wishlist"
      >
        <IoMdHeartEmpty className="text-[22px]" />
      </Link>

      <Link
        to="/cart"
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-800 transition-colors duration-200 hover:bg-slate-100"
        aria-label="Shopping cart"
      >
        <AiOutlineShoppingCart className="text-[22px]" />
      </Link>
    </div>
  );
};

export default HeaderIcons;
