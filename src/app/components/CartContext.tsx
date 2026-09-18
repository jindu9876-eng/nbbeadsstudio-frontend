import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "../api";
import { useAuth } from "./AuthContext";

export interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  category?: string;
  description?: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  selectedProduct: Product | null;
  openProductDetail: (product: Product) => void;
  closeProductDetail: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { user } = useAuth();

  // Load cart when user logs in or out
  useEffect(() => {
    if (user) {
      // Sync guest cart to DB or just load DB cart
      api.getCart().then((res) => {
        if (res.success && res.data) {
          setCart(res.data.items || []);
        }
      });
    } else {
      // Clear cart on logout
      setCart([]);
    }
  }, [user]);

  const addToCart = async (product: Product) => {
    if (user) {
      const res = await api.addToCart(product.id, 1);
      if (res.success && res.data) {
        setCart(res.data.items || []);
      }
    } else {
      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.id === product.id);
        if (existingItem) {
          return prevCart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prevCart, { ...product, quantity: 1 }];
      });
    }
  };

  const removeFromCart = async (productId: string) => {
    if (user) {
      const res = await api.removeFromCart(productId);
      if (res.success && res.data) {
        setCart(res.data.items || []);
      }
    } else {
      setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    if (user) {
      const res = await api.updateCartItem(productId, quantity);
      if (res.success && res.data) {
        setCart(res.data.items || []);
      }
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = async () => {
    if (user) {
      const res = await api.clearCart();
      if (res.success) {
        setCart([]);
      }
    } else {
      setCart([]);
    }
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
  };

  const closeProductDetail = () => {
    setSelectedProduct(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        selectedProduct,
        openProductDetail,
        closeProductDetail,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}

