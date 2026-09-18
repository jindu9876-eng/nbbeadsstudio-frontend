import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Boxes,
  ShoppingCart,
  Users,
  FileSpreadsheet,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShoppingBag,
  Cloud,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Eye,
  EyeOff
} from "lucide-react";
import { useAdminAuth, RequireAdminAuth } from "./AdminAuthContext";
import { useSettings } from "../SettingsContext";
import { toast, Toaster } from "sonner";

export function AdminProtectedLayout() {
  return (
    <RequireAdminAuth>
      <AdminLayout />
    </RequireAdminAuth>
  );
}

export function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();
  const { hidePriceAndCart, toggleHidePriceAndCart } = useSettings();
  const [togglingSettings, setTogglingSettings] = useState(false);

  const handleToggleCatalogMode = async () => {
    setTogglingSettings(true);
    try {
      const isHidden = await toggleHidePriceAndCart();
      if (isHidden) {
        toast.warning("Catalog Mode Activated", {
          description: "All price tags and cart are now disabled on the website."
        });
      } else {
        toast.success("Store Mode Activated", {
          description: "Prices and cart are now visible to customers on the website."
        });
      }
    } catch {
      toast.error("Failed to update catalog mode setting");
    } finally {
      setTogglingSettings(false);
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard, exact: true },
    { name: "Products", path: "/admin/products", icon: Package },
    { name: "Categories", path: "/admin/categories", icon: FolderTree },
    { name: "Inventory", path: "/admin/inventory", icon: Boxes },
    { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
    { name: "Customers", path: "/admin/customers", icon: Users },
    { name: "Bulk Excel / CSV", path: "/admin/bulk-upload", icon: FileSpreadsheet, badge: "Import" },
  ];

  const isNavActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  // Extract current section title
  const currentNav = navItems.find((item) => isNavActive(item));
  const currentTitle = currentNav ? currentNav.name : "Admin Panel";

  return (
    <div className="min-h-screen bg-gray-50 flex text-gray-900 font-sans selection:bg-black selection:text-white">
      <Toaster richColors position="top-right" />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-[#0c0c14] text-white z-40 border-r border-white/5">
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center font-bold shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tighter text-white">NB BEADS STUDIO</span>
              <span className="block text-[10px] uppercase tracking-widest text-amber-400 font-semibold">Admin Panel</span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">Management</p>
          {navItems.map((item) => {
            const active = isNavActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${active
                    ? "bg-white text-black shadow-sm font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${active ? "text-black" : "text-gray-400 group-hover:text-white"}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? "bg-black text-white" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Cloudinary Status & User Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 space-y-3">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <Cloud className="w-3.5 h-3.5 text-sky-400" />
              <span>Cloudinary CDN</span>
            </div>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-200 text-black flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {admin?.username?.slice(0, 2) || "AD"}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{admin?.username || "Admin"}</p>
                <p className="text-[10px] text-gray-400 truncate">{admin?.email || "admin@NB BEADS STUDIO.com"}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0c0c14] text-white">
            <div className="absolute top-0 right-0 -mr-12 pt-4">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none text-white hover:bg-white/10"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="h-20 flex items-center px-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white text-black rounded-xl flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="text-xl font-extrabold tracking-tighter text-white">NB BEADS STUDIO ADMIN</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
              {navItems.map((item) => {
                const active = isNavActive(item);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${active
                        ? "bg-white text-black font-semibold"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${active ? "text-black" : "text-gray-400"}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="p-4 border-t border-white/10 bg-black/40">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Breadcrumb Title */}
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                <span>Admin</span>
                <ChevronRight className="w-3 h-3 text-gray-400" />
                <span className="text-gray-900 font-semibold">{currentTitle}</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">{currentTitle}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Catalog Mode Toggle Switch */}
            <div className={`flex items-center gap-3 px-3 py-1.5 rounded-xl border transition-all ${
              hidePriceAndCart 
                ? "bg-amber-50/80 border-amber-200/80 text-amber-900 shadow-xs" 
                : "bg-gray-50 border-gray-200 text-gray-700"
            }`}>
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-[11px] font-bold flex items-center gap-1.5 justify-end">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      hidePriceAndCart ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                    }`}
                  />
                  {hidePriceAndCart ? "Catalog Mode (Prices & Cart Disabled)" : "Store Mode (Prices & Cart Active)"}
                </span>
                <span className="text-[10px] text-gray-500">
                  {hidePriceAndCart ? "All prices & cart are disabled on website" : "Prices & cart are visible to shoppers"}
                </span>
              </div>

              <button
                type="button"
                onClick={handleToggleCatalogMode}
                disabled={togglingSettings}
                title={hidePriceAndCart ? "Click to switch to Store Mode (enable prices & cart)" : "Click to switch to Catalog Mode (disable prices & cart)"}
                aria-pressed={hidePriceAndCart}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  hidePriceAndCart ? "bg-amber-500" : "bg-gray-300"
                } ${togglingSettings ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    hidePriceAndCart ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* View Store Quick Link */}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-black hover:text-white transition-all shadow-sm group"
            >
              <span>View Store</span>
              <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>

            {/* Quick Profile Pill */}
            <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold uppercase">
                {admin?.username?.slice(0, 2) || "A"}
              </div>
              <span className="text-xs font-semibold text-gray-800">{admin?.username || "Admin"}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
