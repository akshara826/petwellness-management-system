import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { addToCart, getCart, removeCartItem, updateCartItem } from "../api/services/cartService";

const CartContext = createContext(null);

function getErrorMessage(error) {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object" && data.message) return data.message;
  return error?.message || "Request failed";
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const nextCart = await getCart();
      setCart(nextCart);
      return nextCart;
    } catch (error) {
      if (error?.response?.status === 404) {
        const emptyCart = { items: [], totalAmount: 0 };
        setCart(emptyCart);
        return emptyCart;
      }
      throw new Error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addItem = useCallback(async (productId, quantity = 1) => {
    try {
      const nextCart = await addToCart(productId, quantity);
      setCart(nextCart);
      return nextCart;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }, []);

  const updateItem = useCallback(async (itemId, quantity) => {
    try {
      const nextCart = await updateCartItem(itemId, quantity);
      setCart(nextCart);
      return nextCart;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }, []);

  const removeItem = useCallback(async (itemId) => {
    try {
      const nextCart = await removeCartItem(itemId);
      setCart(nextCart);
      return nextCart;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }, []);

  const clearCartState = useCallback(() => {
    setCart({ items: [], totalAmount: 0 });
  }, []);

  const cartItemCount = useMemo(
    () => cart.items.reduce((total, item) => total + Number(item.quantity || 0), 0),
    [cart.items]
  );

  const value = useMemo(
    () => ({
      cart,
      cartItemCount,
      isLoading,
      fetchCart,
      addItem,
      updateItem,
      removeItem,
      clearCartState,
    }),
    [addItem, cart, cartItemCount, clearCartState, fetchCart, isLoading, removeItem, updateItem]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
