import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const savedCart = Cookies.get("yanzee_cart");

    if (!savedCart) {
      return [];
    }

    try {
      const parsedCart = JSON.parse(savedCart);

      if (!Array.isArray(parsedCart)) {
        return [];
      }

      // Clean old cart data so old NaN/invalid values don't break the cart
      return parsedCart.map((item) => ({
        ...item,
        price: Number(item.price ?? item.priceNPR) || 0,
        priceNPR: Number(item.priceNPR ?? item.price) || 0,
        quantity: Number(item.quantity) || 1,
        stock: Number(item.stock) || 999,
      }));
    } catch {
      return [];
    }
  });

  useEffect(() => {
    Cookies.set("yanzee_cart", JSON.stringify(cart), {
      expires: 7,
    });
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    // Support both price formats
    const price = Number(product?.price ?? product?.priceNPR) || 0;

    const priceNPR = Number(product?.priceNPR ?? product?.price) || price;

    const stockValue = Number(product?.stock);

    const maxStock =
      Number.isFinite(stockValue) && stockValue > 0 ? stockValue : 999;

    const requestedQuantity = Number(quantity) || 1;

    const cleanProduct = {
      ...product,

      // Keep both fields for compatibility with existing pages
      price,
      priceNPR,

      stock: maxStock,
      quantity: requestedQuantity,
    };

    setCart((prev) => {
      const existing = prev.find(
        (item) => item.id === product.id
      );

      if (existing) {
        const currentQuantity =
          Number(existing.quantity) || 0;

        if (currentQuantity >= maxStock) {
          alert(
            `You've reached the maximum available stock (${maxStock}) for ${product.title}.`
          );

          return prev;
        }

        const newQuantity = Math.min(
          currentQuantity + requestedQuantity,
          maxStock
        );

        return prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                price: Number(item.price ?? item.priceNPR) || 0,
                priceNPR:
                  Number(item.priceNPR ?? item.price) || 0,
                stock: maxStock,
                quantity: newQuantity,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          ...cleanProduct,
          quantity: Math.min(
            requestedQuantity,
            maxStock
          ),
        },
      ];
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    const quantity = Number(newQuantity) || 0;

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== productId) {
          return item;
        }

        const maxStock =
          Number(item.stock) || 999;

        if (quantity > maxStock) {
          alert(
            `Sorry, we only have ${maxStock} units of ${item.title} available.`
          );

          return {
            ...item,
            quantity: maxStock,
          };
        }

        return {
          ...item,
          quantity,
        };
      })
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) =>
      prev.filter((item) => item.id !== productId)
    );
  };

  const isInCart = (productId) => {
    return cart.some(
      (item) => item.id === productId
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 0;

    return sum + quantity;
  }, 0);

  const subtotalNPR = cart.reduce((sum, item) => {
    const price =
      Number(item.price ?? item.priceNPR) || 0;

    const quantity =
      Number(item.quantity) || 0;

    return sum + price * quantity;
  }, 0);

  // Free shipping over Rs 3000
  const FREE_SHIPPING_THRESHOLD = 3000;

  // Flat shipping below Rs 3000
  const FLAT_SHIPPING = 200;

  const shippingNPR =
    subtotalNPR >= FREE_SHIPPING_THRESHOLD ||
    subtotalNPR === 0
      ? 0
      : FLAT_SHIPPING;

  const grandTotalNPR =
    subtotalNPR + shippingNPR;

  const isFreeShipping =
    subtotalNPR >= FREE_SHIPPING_THRESHOLD;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        isInCart,
        clearCart,
        totalItems,
        subtotalNPR,
        shippingNPR,
        grandTotalNPR,
        isFreeShipping,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);