import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Home } from "./components/Home";
import { Jewellery } from "./components/Jewellery";
import { CoupleThings } from "./components/CoupleThings";
import { Macrame } from "./components/Macrame";
import { Fashion } from "./components/Fashion";

// Admin components
import { AdminProtectedLayout } from "./components/admin/AdminLayout";
import { AdminLogin } from "./components/admin/AdminLogin";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AdminProducts } from "./components/admin/AdminProducts";
import { AdminProductForm } from "./components/admin/AdminProductForm";
import { AdminCategories } from "./components/admin/AdminCategories";
import { AdminInventory } from "./components/admin/AdminInventory";
import { AdminOrders } from "./components/admin/AdminOrders";
import { AdminCustomers } from "./components/admin/AdminCustomers";
import { AdminBulkUpload } from "./components/admin/AdminBulkUpload";

export const router = createBrowserRouter([
  // Customer Store Routes
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "jewellery", Component: Jewellery },
      { path: "couple-things", Component: CoupleThings },
      { path: "macrame", Component: Macrame },
      { path: "fashion", Component: Fashion },
    ],
  },
  // Admin Login
  {
    path: "/admin/login",
    Component: AdminLogin,
  },
  // Protected Admin Portal
  {
    path: "/admin",
    Component: AdminProtectedLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "products", Component: AdminProducts },
      { path: "products/new", Component: AdminProductForm },
      { path: "products/edit/:id", Component: AdminProductForm },
      { path: "categories", Component: AdminCategories },
      { path: "inventory", Component: AdminInventory },
      { path: "orders", Component: AdminOrders },
      { path: "customers", Component: AdminCustomers },
      { path: "bulk-upload", Component: AdminBulkUpload },
      { path: "bulk", Component: AdminBulkUpload },
    ],
  },
]);
