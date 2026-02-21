import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (cart.length > 0) {
        console.log("Debounced API call with cart:", cart);
      }
    }, 2000); 

    return () => clearTimeout(timeout); 
  }, [cart]);

  const addToCart = (item) => {
    console.log("Adding to cart:", item);
    setCart((prev) => {
      
      const existingItem = prev.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        console.log("Product already in cart, updating quantity");
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: (cartItem.quantity || 1) + 1 }
            : cartItem
        );
      }
      console.log("New product, adding to cart");
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const quantity = item.quantity || 1;
      return total + (item.price || 0) * quantity;
    }, 0);
  };

  const confirmOrder = () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }
    setConfirmedOrder({
      items: cart,
      totalPrice: getTotalPrice(),
      timestamp: new Date().toISOString(),
    });
    setShowConfirmationModal(false);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      confirmedOrder,
      setConfirmedOrder,
      showConfirmationModal,
      setShowConfirmationModal,
      confirmOrder,
    }}>
      {children}
    </CartContext.Provider>
  );
};
