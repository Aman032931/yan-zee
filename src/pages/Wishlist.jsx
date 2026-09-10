import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { formatNPR } from "./Cart";
import "../styles/cart.css";

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-8">
        <div className="cart-empty">
          <h2>Your Wishlist is Empty</h2>
          <p>Tap the heart icon on any product to save it here for later.</p>
          <Link to="/all" className="continue-shopping-btn">
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8">
      <div className="cart-container">
        <h2>My Wishlist ({wishlist.length} items)</h2>

        <div className="cart-items">
          {wishlist.map((item) => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} className="cart-item-img" />

              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p className="item-price">{formatNPR(item.priceNPR)}</p>
              </div>

              <button
                className="clear-cart-btn"
                style={{ marginRight: "0.5rem" }}
                onClick={() =>
                  addToCart({
                    id: item.id,
                    name: item.name,
                    image: item.image,
                    priceNPR: item.priceNPR,
                    stock: 999,
                  })
                }
              >
                {isInCart(item.id) ? "In Cart" : "Add to Cart"}
              </button>

              <button className="cart-remove-btn" onClick={() => removeFromWishlist(item.id)}>
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
