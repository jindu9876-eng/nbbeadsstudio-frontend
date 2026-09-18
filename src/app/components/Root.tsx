import { Outlet } from "react-router";
import { Navigation } from "./Navigation";
import { AuthModal } from "./AuthModal";
import { CartModal } from "./CartModal";
import { WishlistModal } from "./WishlistModal";
import { ProductDetailModal } from "./ProductDetailModal";

export function Root() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Outlet />
      <AuthModal />
      <CartModal />
      <WishlistModal />
      <ProductDetailModal />
    </div>
  );
}
