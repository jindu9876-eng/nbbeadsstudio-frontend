import React, { useState, useEffect } from "react";
import { adminApi } from "../../api";
import {
  Boxes,
  Search,
  AlertTriangle,
  Package,
  TrendingDown,
  CheckCircle2,
  IndianRupee,
  Plus,
  Minus,
  Save,
  Edit,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";

export function AdminInventory() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "low_stock" | "out_of_stock">("all");
  const [search, setSearch] = useState("");
  const [editingStock, setEditingStock] = useState<{ [id: string]: number }>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getInventory(filterType, search.trim() || undefined);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        toast.error(res.message || "Failed to load inventory");
      }
    } catch {
      toast.error("Network error fetching inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [filterType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInventory();
  };

  const handleStockDelta = (id: string, currentStock: number, delta: number) => {
    const existing = editingStock[id] !== undefined ? editingStock[id] : currentStock;
    const nextVal = Math.max(0, existing + delta);
    setEditingStock({ ...editingStock, [id]: nextVal });
  };

  const handleStockSave = async (id: string) => {
    const newStock = editingStock[id];
    if (newStock === undefined) return;

    setSavingId(id);
    try {
      const res = await adminApi.updateProductStock(id, newStock);
      if (res.success) {
        toast.success(`Stock level updated to ${newStock}`);
        // Update local state without full reload
        if (data && data.products) {
          setData({
            ...data,
            products: data.products.map((p: any) =>
              p.id === id ? { ...p, stock: newStock, inventory_value: Number((newStock * p.sale_price).toFixed(2)) } : p
            )
          });
        }
        const updatedEditing = { ...editingStock };
        delete updatedEditing[id];
        setEditingStock(updatedEditing);
      } else {
        toast.error(res.message || "Failed to update stock");
      }
    } catch {
      toast.error("Network error updating stock");
    } finally {
      setSavingId(null);
    }
  };

  const summary = data?.summary || {};
  const products = data?.products || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900">Inventory & Stock Control</h2>
          <p className="text-xs text-gray-500">Live warehouse quantities, low-stock warnings, and fast inline stock adjustments</p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Inventory Valuation</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">
            ₹{summary.total_valuation?.toLocaleString("en-IN", { minimumFractionDigits: 2 }) || "0.00"}
          </div>
          <p className="mt-1 text-[11px] text-gray-400">Total warehouse asset value</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Units</span>
            <Boxes className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">
            {summary.total_stock_units?.toLocaleString() || 0}
          </div>
          <p className="mt-1 text-[11px] text-gray-400">Items available across all catalog products</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Low Stock Alert</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {summary.low_stock_count || 0}
          </div>
          <p className="mt-1 text-[11px] text-gray-400">Products with &le; 5 units remaining</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Out of Stock</span>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-600">
            {summary.out_of_stock_count || 0}
          </div>
          <p className="mt-1 text-[11px] text-gray-400">Products requiring urgent replenishment</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl text-xs font-semibold w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterType === "all" ? "bg-white text-black shadow-xs font-bold" : "text-gray-600 hover:text-black"
            }`}
          >
            All Items ({summary.total_products || 0})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("low_stock")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterType === "low_stock" ? "bg-white text-amber-700 shadow-xs font-bold" : "text-gray-600 hover:text-black"
            }`}
          >
            Low Stock ({summary.low_stock_count || 0})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("out_of_stock")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterType === "out_of_stock" ? "bg-white text-red-600 shadow-xs font-bold" : "text-gray-600 hover:text-black"
            }`}
          >
            Out of Stock ({summary.out_of_stock_count || 0})
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product, SKU..."
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-black text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-500 space-y-3">
            <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold uppercase tracking-wider">Loading stock levels...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            <Boxes className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="font-bold text-gray-800">No matching inventory items</p>
            <p className="text-xs text-gray-400 mt-0.5">Try selecting a different filter above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 pl-6 pr-3">Product Info</th>
                  <th className="py-3.5 px-3">SKU</th>
                  <th className="py-3.5 px-3">Unit Price</th>
                  <th className="py-3.5 px-3">Stock Value</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3 text-center">Adjust Quantity</th>
                  <th className="py-3.5 pr-6 pl-3 text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p: any) => {
                  const currentStock = editingStock[p.id] !== undefined ? editingStock[p.id] : p.stock;
                  const hasUnsavedChanges = editingStock[p.id] !== undefined && editingStock[p.id] !== p.stock;
                  const isOut = p.stock === 0;
                  const isLow = p.stock > 0 && p.stock <= 5;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Product Info */}
                      <td className="py-3.5 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                            {p.thumbnail ? (
                              <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Package className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-[220px]">
                            <p className="font-bold text-gray-900 text-xs truncate">{p.name}</p>
                            <p className="text-[11px] text-gray-500 truncate">{p.category}</p>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3.5 px-3 font-mono text-xs font-semibold text-gray-700">
                        {p.sku}
                      </td>

                      {/* Unit Price */}
                      <td className="py-3.5 px-3 font-bold text-gray-900 text-xs">
                        ₹{p.sale_price?.toFixed(2)}
                      </td>

                      {/* Stock Value */}
                      <td className="py-3.5 px-3 font-semibold text-gray-900 text-xs">
                        ₹{p.inventory_value?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                            Low Stock ({p.stock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                            {p.stock} Available
                          </span>
                        )}
                      </td>

                      {/* Adjust Quantity Stepper */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStockDelta(p.id, p.stock, -1)}
                            className="w-7 h-7 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={currentStock}
                            onChange={(e) =>
                              setEditingStock({
                                ...editingStock,
                                [p.id]: Math.max(0, parseInt(e.target.value) || 0)
                              })
                            }
                            className={`w-16 text-center py-1 rounded-lg border text-xs font-bold ${
                              hasUnsavedChanges
                                ? "border-amber-400 bg-amber-50 text-amber-900"
                                : "border-gray-200 bg-gray-50 text-gray-900"
                            } focus:outline-none focus:ring-2 focus:ring-black`}
                          />

                          <button
                            type="button"
                            onClick={() => handleStockDelta(p.id, p.stock, 1)}
                            className="w-7 h-7 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>

                          {hasUnsavedChanges && (
                            <button
                              type="button"
                              onClick={() => handleStockSave(p.id)}
                              disabled={savingId === p.id}
                              className="ml-1 px-2.5 py-1 bg-black text-white text-[11px] font-bold rounded-lg hover:bg-gray-800 shadow-xs flex items-center gap-1"
                            >
                              <Save className="w-3 h-3" />
                              Save
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Edit link */}
                      <td className="py-3.5 pr-6 pl-3 text-right">
                        <Link
                          to={`/admin/products/edit/${p.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-black hover:underline"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
