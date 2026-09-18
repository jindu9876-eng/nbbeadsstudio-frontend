import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "../api";
import { useAuth } from "./AuthContext";
import { Product } from "./CartContext";
import { toast } from "sonner";

interface WishlistContextType {
  wishlist: Product[];
  isWishlistOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => Promise<void>;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "NB BEADS STUDIO_wishlist_items";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const { user } = useAuth();

  // Save guest wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      // Ignore localStorage errors
    }
  }, [wishlist]);

  // Load wishlist from backend when authenticated
  useEffect(() => {
    if (user) {
      api.getWishlist().then((res) => {
        if (res.success && res.data && Array.isArray(res.data.products)) {
          setWishlist(res.data.products);
        }
      });
    }
  }, [user]);

  const openWishlist = () => setIsWishlistOpen(true);
  const closeWishlist = () => setIsWishlistOpen(false);

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => String(item.id) === String(productId));
  };

  const addToWishlist = async (product: Product) => {
    if (isInWishlist(product.id)) return;

    if (user) {
      try {
        const res = await api.addToWishlist(product.id);
        if (res.success && res.data && Array.isArray(res.data.products)) {
          setWishlist(res.data.products);
        } else {
          setWishlist((prev) => [...prev, product]);
        }
      } catch {
        setWishlist((prev) => [...prev, product]);
      }
    } else {
      setWishlist((prev) => [...prev, product]);
    }

    toast.success(`"${product.name}" added to your Wishlist ❤️`);
  };

  const removeFromWishlist = async (productId: string) => {
    const itemToRemove = wishlist.find((item) => String(item.id) === String(productId));

    if (user) {
      try {
        const res = await api.removeFromWishlist(productId);
        if (res.success && res.data && Array.isArray(res.data.products)) {
          setWishlist(res.data.products);
        } else {
          setWishlist((prev) => prev.filter((item) => String(item.id) !== String(productId)));
        }
      } catch {
        setWishlist((prev) => prev.filter((item) => String(item.id) !== String(productId)));
      }
    } else {
      setWishlist((prev) => prev.filter((item) => String(item.id) !== String(productId)));
    }

    if (itemToRemove) {
      toast.info(`"${itemToRemove.name}" removed from Wishlist`);
    }
  };

  const toggleWishlist = async (product: Product) => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  const clearWishlist = async () => {
    if (wishlist.length === 0) return;
    const items = [...wishlist];
    setWishlist([]);

    if (user) {
      for (const item of items) {
        await api.removeFromWishlist(item.id).catch(() => { });
      }
    }

    toast.info("Wishlist cleared");
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isWishlistOpen,
        openWishlist,
        closeWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
