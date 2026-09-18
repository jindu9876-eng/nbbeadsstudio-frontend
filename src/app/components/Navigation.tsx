import { Link, useLocation } from "react-router";
import { ShoppingBag, Menu, X, Search, User, Heart, ShoppingCart, LogOut, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { useSettings } from "./SettingsContext";

export function Navigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout, openAuthModal } = useAuth();
  const { cart, openCart } = useCart();
  const { openWishlist, wishlistCount } = useWishlist();
  const { hidePriceAndCart } = useSettings();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Jewellery", path: "/jewellery" },
    { name: "Couple Things", path: "/couple-things" },
    { name: "Macrame", path: "/macrame" },
    { name: "Fashion", path: "/fashion" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tighter">NB BEADS STUDIO</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium tracking-wide transition-all relative ${isActive(item.path)
                    ? "text-black"
                    : "text-gray-500 hover:text-black"
                  }`}
              >
                {item.name}
                {isActive(item.path) && (
                  <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-black" />
                )}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-5">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={openWishlist}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative cursor-pointer"
              title="View Wishlist"
            >
              <Heart
                className={`w-5 h-5 transition-all ${wishlistCount > 0 ? "text-red-500 fill-red-500 scale-105" : "text-gray-700 hover:text-black"
                  }`}
              />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </button>
            {!hidePriceAndCart && (
              <button
                onClick={openCart}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors relative cursor-pointer"
                title="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            )}
            <div className="relative">
              <button
                onClick={() => {
                  if (user) {
                    setShowUserMenu(!showUserMenu);
                  } else {
                    openAuthModal("login");
                  }
                }}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                title={user ? user.name : "Sign In"}
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-black/10"
                  />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </button>
              {user && showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <Link
                    to="/admin"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-800 text-sm font-medium"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    Admin Console
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600 text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-gray-100">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-3 text-base font-medium tracking-wide transition-colors ${isActive(item.path)
                    ? "text-black"
                    : "text-gray-500 hover:text-black"
                  }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2.5">
              <div className="flex gap-2.5">
                <button
                  onClick={() => {
                    openWishlist();
                    setMobileMenuOpen(false);
                  }}
                  className={`${
                    hidePriceAndCart ? "w-full" : "flex-1"
                  } py-2 px-3 border border-gray-200 rounded-full flex items-center justify-center gap-1.5 text-xs font-semibold`}
                >
                  <Heart className="w-4 h-4 fill-red-500" />
                  Wishlist ({wishlistCount})
                </button>
                {!hidePriceAndCart && (
                  <button
                    onClick={() => {
                      openCart();
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 py-2 px-3 bg-black text-white rounded-full flex items-center justify-center gap-1.5 text-xs font-semibold relative cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Cart ({cartItemsCount})
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  if (user) {
                    logout();
                  } else {
                    openAuthModal("login");
                  }
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 border-2 border-black rounded-full text-xs font-semibold"
              >
                {user ? "Logout" : "Login"}
              </button>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 rounded-full hover:bg-amber-100 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Operations Console
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
