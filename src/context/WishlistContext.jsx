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

  const normalizeProduct = (product) => {
    const price = Number(product.price ?? product.priceNPR ?? 0);

    return {
      ...product,

      // Keep both fields so old and new parts of the project work
      price,
      priceNPR: price,

      name: product.name || product.title || "Untitled product",

      stock: Number.isFinite(product.stock)
        ? product.stock
        : 50,
    };
  };

  const isWishlisted = (productId) =>
    wishlist.some((item) => item.id === productId);

  const addToWishlist = (product) => {
    const normalizedProduct = normalizeProduct(product);

    setWishlist((prev) =>
      prev.some((item) => item.id === normalizedProduct.id)
        ? prev
        : [...prev, normalizedProduct]
    );
  };

  // Save an item from Cart to Wishlist
  const saveForLater = (product) => {
    const normalizedProduct = normalizeProduct(product);

    setWishlist((prev) => {
      const existing = prev.find(
        (item) => item.id === normalizedProduct.id
      );

      if (existing) {
        return prev.map((item) =>
          item.id === normalizedProduct.id
            ? {
                ...item,
                ...normalizedProduct,
                savedQuantity:
                  product.quantity ??
                  item.savedQuantity ??
                  1,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          ...normalizedProduct,
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
    const normalizedProduct = normalizeProduct(product);

    setWishlist((prev) =>
      prev.some((item) => item.id === normalizedProduct.id)
        ? prev.filter((item) => item.id !== normalizedProduct.id)
        : [...prev, normalizedProduct]
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