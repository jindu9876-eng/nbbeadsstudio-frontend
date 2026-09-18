import { RouterProvider } from "react-router";
import { router } from "./routes";
import { CartProvider } from "./components/CartContext";
import { WishlistProvider } from "./components/WishlistContext";
import { AuthProvider } from "./components/AuthContext";
import { AdminAuthProvider } from "./components/admin/AdminAuthContext";
import { SettingsProvider } from "./components/SettingsContext";

export default function App() {
  return (
    <AdminAuthProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <SettingsProvider>
              <RouterProvider router={router} />
            </SettingsProvider>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </AdminAuthProvider>
  );
}
