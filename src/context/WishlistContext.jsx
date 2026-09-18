import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    const saved = Cookies.get("yanzee_wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    Cookies.set("yanzee_wishlist", JSON.stringify(wishlist), {
      expires: 30,
    });
  }, [wishlist]);

  const isWishlisted = (productId) =>
    wishlist.some((item) => item.id === productId);

  const addToWishlist = (product) => {
    setWishlist((prev) =>
      prev.some((item) => item.id === product.id)
        ? prev
        : [...prev, product]
    );
  };

  // Save an item from Cart to Wishlist
  // while remembering the quantity it had in the Cart.
  const saveForLater = (product) => {
    setWishlist((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                ...product,
                savedQuantity:
                  product.quantity ?? item.savedQuantity ?? 1,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          ...product,
          savedQuantity: product.quantity ?? 1,
        },
      ];
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlist((prev) =>
      prev.filter((item) => item.id !== productId)
    );
  };

  const toggleWishlist = (product) => {
    setWishlist((prev) =>
      prev.some((item) => item.id === product.id)
        ? prev.filter((item) => item.id !== product.id)
        : [...prev, product]
    );
  };

  const clearWishlist = () => setWishlist([]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isWishlisted,
        addToWishlist,
        saveForLater,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
        totalWishlisted: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);