import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { adminApi } from "../../api";
import {
  IndianRupee,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Cloud,
  FileSpreadsheet,
  Plus,
  Boxes,
  Clock,
  Eye,
  CheckCircle,
  Truck,
  Sparkles
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { toast } from "sonner";
import { useSettings } from "../SettingsContext";

const COLORS = ["#000000", "#d97706", "#0284c7", "#10b981", "#8b5cf6", "#ec4899"];

export function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { hidePriceAndCart, toggleHidePriceAndCart } = useSettings();

  const fetchAnalytics = async () => {
    try {
      const res = await adminApi.getAnalytics();
      if (res.success && res.data) {
        setData(res.data);
      } else {
        toast.error(res.message || "Failed to load dashboard metrics");
      }
    } catch {
      toast.error("Failed to connect to backend server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-gray-200 rounded-3xl" />
          <div className="h-96 bg-gray-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const salesTrend = data?.sales_trend || [];
  const categoryDistribution = data?.category_distribution || [];
  const recentOrders = data?.recent_orders || [];
  const lowStockItems = data?.low_stock_items || [];
  const cloudinaryEnabled = data?.cloudinary_enabled;

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Delivered</span>;
      case "shipped":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">Shipped</span>;
      case "packed":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Packed</span>;
      case "cancelled":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">Pending</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Cloudinary Info Banner if local fallback */}
      {!cloudinaryEnabled && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-900 text-sm">
          <div className="flex items-center gap-3">
            <Cloud className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-semibold">Cloudinary Storage Ready</p>
              <p className="text-xs text-amber-700">Currently operating in high-speed local storage mode. Add your Cloudinary keys to <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-800">backend/.env</code> anytime to enable automatic Cloudinary CDN hosting.</p>
            </div>
          </div>
          <span className="shrink-0 text-xs font-semibold px-3 py-1 bg-amber-200/60 rounded-full text-amber-800">Local Fallback Active</span>
        </div>
      )}

      {/* Quick Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Quick Actions</h2>
          <p className="text-xs text-gray-500">Shortcut buttons for common admin management workflows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Product
          </Link>
          <Link
            to="/admin/bulk-upload"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-black text-xs font-semibold rounded-xl hover:bg-amber-400 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Bulk Excel/CSV Import
          </Link>
          <Link
            to="/admin/inventory"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-800 text-xs font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            <Boxes className="w-3.5 h-3.5" />
            Stock Manager
          </Link>
        </div>
      </div>

      {/* Catalog Mode Banner Widget */}
      <div className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
        hidePriceAndCart
          ? "bg-amber-500/10 border-amber-300 text-amber-950"
          : "bg-white border-gray-200 text-gray-900"
      }`}>
        <div className="flex items-start gap-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            hidePriceAndCart ? "bg-amber-500 text-black shadow-sm" : "bg-gray-100 text-gray-700"
          }`}>
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold">Catalog Mode Control</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                hidePriceAndCart
                  ? "bg-amber-500 text-black"
                  : "bg-emerald-100 text-emerald-800"
              }`}>
                {hidePriceAndCart ? "Prices & Cart Disabled" : "Prices & Cart Active"}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5 max-w-2xl">
              {hidePriceAndCart
                ? "Catalog Mode is currently active: All product prices and the cart buttons are disabled and hidden on the website storefront."
                : "Store Mode is currently active: All product prices and the cart functionality are visible and active for customers."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={async () => {
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
              toast.error("Failed to update catalog mode");
            }
          }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer ${
            hidePriceAndCart
              ? "bg-amber-500 hover:bg-amber-400 text-black"
              : "bg-black hover:bg-gray-800 text-white"
          }`}
        >
          <span>{hidePriceAndCart ? "Turn Store Mode ON (Show Prices)" : "Enable Catalog Mode (Hide Prices)"}</span>
        </button>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Revenue */}
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
            ₹{metrics.total_revenue?.toLocaleString("en-IN", { minimumFractionDigits: 2 }) || "0.00"}
          </div>
          <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> Active sales
            </span>
            <span>excluding cancelled orders</span>
          </p>
        </div>

        {/* Orders */}
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Orders</span>
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
            {metrics.total_orders || 0}
          </div>
          <p className="mt-2 text-xs text-gray-500 flex items-center gap-2">
            <span className="text-amber-600 font-semibold">{data?.order_status_counts?.pending || 0} Pending</span>
            <span>•</span>
            <span className="text-emerald-600 font-semibold">{data?.order_status_counts?.delivered || 0} Delivered</span>
          </p>
        </div>

        {/* Products */}
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Products Catalog</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
            {metrics.total_products || 0}
          </div>
          <p className="mt-2 text-xs text-gray-500 flex items-center gap-2">
            <span className="text-gray-900 font-semibold">{metrics.active_products || 0} active</span>
            <span>•</span>
            <span className="text-red-600 font-semibold">{metrics.low_stock_count || 0} low stock</span>
          </p>
        </div>

        {/* Customers */}
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Registered Users</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
            {metrics.total_customers || 0}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Valuation: <span className="font-semibold text-gray-900">₹{metrics.inventory_valuation?.toLocaleString("en-IN") || 0}</span>
          </p>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 14-Day Sales Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-gray-900">Sales & Revenue Trend</h3>
              <p className="text-xs text-gray-500">Past 14 days performance overview</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
              Daily Updates
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#000000" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#000", color: "#fff", borderRadius: "12px", border: "none" }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString("en-IN")}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#000000" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Chart */}
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-900">Category Catalog</h3>
            <p className="text-xs text-gray-500">Distribution of products across store categories</p>
          </div>

          <div className="h-56 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="product_count"
                >
                  {categoryDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#000", color: "#fff", borderRadius: "12px", border: "none" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
            {categoryDistribution.map((cat: any, i: number) => (
              <div key={cat.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="truncate text-gray-700 font-medium">{cat.name}:</span>
                <span className="font-bold text-gray-900">{cat.product_count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Warning Section */}
      {lowStockItems.length > 0 && (
        <div className="p-6 rounded-3xl bg-red-50/50 border border-red-200/70 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="text-base font-bold">Low Stock Warning ({lowStockItems.length} items &le; 5 units)</h3>
            </div>
            <Link
              to="/admin/inventory?filter_type=low_stock"
              className="text-xs font-semibold text-red-700 hover:text-red-900 flex items-center gap-1"
            >
              <span>Manage all inventory</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {lowStockItems.map((item: any) => (
              <div key={item.id} className="p-3.5 rounded-2xl bg-white border border-red-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="truncate flex-1">
                  <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                  <p className="text-[10px] text-gray-500 font-mono">{item.sku}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-red-600">{item.stock} left</span>
                    <Link
                      to={`/admin/products/edit/${item.id}`}
                      className="text-[10px] font-semibold text-gray-600 hover:text-black underline"
                    >
                      Restock
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-gray-900">Recent Customer Orders</h3>
            <p className="text-xs text-gray-500">Latest orders placed on your e-commerce store</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-gray-700 hover:text-black flex items-center gap-1"
          >
            <span>View all orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            No orders found yet. As customers check out, their orders will appear here in real-time.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="pb-3 font-semibold">Order ID</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Items</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-gray-900 text-xs">
                      {order.order_number}
                    </td>
                    <td className="py-3.5">
                      <div className="font-semibold text-gray-900">{order.customer_name}</div>
                      {order.customer_email && (
                        <div className="text-xs text-gray-500">{order.customer_email}</div>
                      )}
                    </td>
                    <td className="py-3.5 text-gray-600 font-medium">
                      {order.items_count} item{order.items_count !== 1 ? "s" : ""}
                    </td>
                    <td className="py-3.5 font-extrabold text-gray-900">
                      ₹{order.total?.toFixed(2)}
                    </td>
                    <td className="py-3.5">
                      {getStatusBadge(order.shipping_status)}
                    </td>
                    <td className="py-3.5 text-xs text-gray-500">
                      {order.created_at}
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        to={`/admin/orders`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-black hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
