"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  isBuyNow?: boolean;
}

interface CartContextType {
  cart: CartItem[];
  addItem: (product: any, quantity?: number, isBuyNow?: boolean) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  totalAmount: number;
  cartCount: number;
  isDarkMode: boolean;
  toggleTheme: (dark: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load cart and theme from local storage on mount
  useEffect(() => {
    setIsMounted(true);
    
    // Cart loading
    const savedCart = localStorage.getItem("agrinex-cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }

    // Theme loading
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = (dark: boolean) => {
    setIsDarkMode(dark);
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Save cart to local storage on change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("agrinex-cart", JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  const addItem = (product: any, quantity: number = 1, isBuyNow: boolean = false) => {
    setCart((prev) => {
      // Check if item already exists with the SAME isBuyNow status
      const existingItem = prev.find((item) => item.id === product.id && item.isBuyNow === isBuyNow);
      
      if (existingItem) {
        return prev.map((item) =>
          (item.id === product.id && item.isBuyNow === isBuyNow) 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          quantity: quantity,
          isBuyNow: isBuyNow
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, addItem, removeItem, updateQuantity, clearCart, 
      totalAmount, cartCount, isDarkMode, toggleTheme 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
