import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const savedCart = Cookies.get("yanzee_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    Cookies.set("yanzee_cart", JSON.stringify(cart), { expires: 7 });
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    const maxStock = product.stock ?? 999;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        if (existing.quantity >= maxStock) {
          alert(`You've reached the maximum available stock (${maxStock}) for ${product.name}.`);
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, maxStock) }
            : item
        );
      }
      return [...prev, { ...product, stock: maxStock, quantity: Math.min(quantity, maxStock) }];
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const maxStock = item.stock ?? 999;
          if (newQuantity > maxStock) {
            alert(`Sorry, we only have ${maxStock} units of ${item.name} available.`);
            return { ...item, quantity: maxStock };
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const isInCart = (productId) => cart.some((item) => item.id === productId);

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalNPR = cart.reduce((sum, item) => sum + item.priceNPR * item.quantity, 0);

  // Free shipping over Rs 3000, otherwise a flat Rs 200
  const FREE_SHIPPING_THRESHOLD = 3000;
  const FLAT_SHIPPING = 200;

  const shippingNPR = subtotalNPR >= FREE_SHIPPING_THRESHOLD || subtotalNPR === 0 ? 0 : FLAT_SHIPPING;
  const grandTotalNPR = subtotalNPR + shippingNPR;
  const isFreeShipping = subtotalNPR >= FREE_SHIPPING_THRESHOLD;

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
