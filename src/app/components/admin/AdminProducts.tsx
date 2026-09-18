import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { adminApi } from "../../api";
import {
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  Copy,
  Trash2,
  Edit,
  Archive,
  ArchiveRestore,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  FileSpreadsheet,
  RefreshCw,
  MoreVertical,
  CheckSquare,
  Square,
  X,
  IndianRupee
} from "lucide-react";
import { toast } from "sonner";

export function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);

  // Filters & Sorting
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [stockStatus, setStockStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  // Quick Price Edit state
  const [quickEditProduct, setQuickEditProduct] = useState<any | null>(null);
  const [quickMrp, setQuickMrp] = useState<number | "">("");
  const [quickSalePrice, setQuickSalePrice] = useState<number | "">("");
  const [quickStock, setQuickStock] = useState<number | "">("");
  const [quickSaving, setQuickSaving] = useState(false);

  const openQuickEdit = (p: any) => {
    setQuickEditProduct(p);
    setQuickMrp(p.mrp ?? 0);
    setQuickSalePrice(p.sale_price ?? 0);
    setQuickStock(p.stock ?? 0);
  };

  const handleSaveQuickPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEditProduct) return;
    setQuickSaving(true);
    const toastId = toast.loading(`Updating price for "${quickEditProduct.name}"...`);
    try {
      const res = await adminApi.updateProduct(quickEditProduct.id, {
        mrp: Number(quickMrp) || 0,
        sale_price: Number(quickSalePrice) || 0,
        stock: Number(quickStock) || 0
      });
      if (res.success) {
        toast.success("Price & stock updated successfully!", { id: toastId });
        setQuickEditProduct(null);
        fetchProducts();
      } else {
        toast.error(res.message || "Failed to update price", { id: toastId });
      }
    } catch {
      toast.error("Network error updating price", { id: toastId });
    } finally {
      setQuickSaving(false);
    }
  };

  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getProducts({
        page,
        limit: 12,
        search: search.trim() || undefined,
        category,
        status,
        stock_status: stockStatus,
        sort_by: sortBy
      });
      if (res.success && res.data) {
        setProducts(res.data.products || []);
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);
      } else {
        toast.error(res.message || "Failed to fetch products");
      }
    } catch {
      toast.error("Network error while loading products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await adminApi.getCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
    // Reset selection on page or filter change
    setSelectedIds([]);
  }, [page, category, status, stockStatus, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleDuplicate = async (id: string, name: string) => {
    const toastId = toast.loading(`Duplicating "${name}"...`);
    try {
      const res = await adminApi.duplicateProduct(id);
      if (res.success) {
        toast.success(`Duplicated successfully as copy!`, { id: toastId });
        fetchProducts();
      } else {
        toast.error(res.message || "Failed to duplicate product", { id: toastId });
      }
    } catch {
      toast.error("Network error duplicating product", { id: toastId });
    }
  };

  const handleArchiveToggle = async (id: string, currentStatus: string, name: string) => {
    const newStatus = currentStatus === "archived" ? "active" : "archived";
    const actionText = newStatus === "archived" ? "Archived" : "Restored";
    try {
      const res = await adminApi.updateProductStatus(id, newStatus);
      if (res.success) {
        toast.success(`"${name}" ${actionText}`);
        fetchProducts();
      } else {
        toast.error(res.message || "Failed to update product status");
      }
    } catch {
      toast.error("Network error updating product status");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const toastId = toast.loading(`Deleting product...`);
    try {
      const res = await adminApi.deleteProduct(deleteTarget.id);
      if (res.success) {
        toast.success(`Product deleted permanently`, { id: toastId });
        setDeleteTarget(null);
        fetchProducts();
      } else {
        toast.error(res.message || "Failed to delete product", { id: toastId });
      }
    } catch {
      toast.error("Network error deleting product", { id: toastId });
    }
  };

  // Bulk actions
  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    const toastId = toast.loading(`Applying ${action} to ${selectedIds.length} products...`);
    try {
      const res = await adminApi.bulkAction(action, selectedIds);
      if (res.success) {
        toast.success(res.message || "Bulk operation completed", { id: toastId });
        setSelectedIds([]);
        fetchProducts();
      } else {
        toast.error(res.message || "Bulk operation failed", { id: toastId });
      }
    } catch {
      toast.error("Network error during bulk action", { id: toastId });
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900">Products Catalog</h2>
          <p className="text-xs text-gray-500">Manage all items, pricing, inventory, variants, and SEO</p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/bulk-upload"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-600" />
            Bulk Excel/CSV
          </Link>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-800 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, SKU, brand, tags..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
            />
          </div>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>

          {/* Stock Status Filter */}
          <select
            value={stockStatus}
            onChange={(e) => {
              setStockStatus(e.target.value);
              setPage(1);
            }}
            className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="all">All Stock Levels</option>
            <option value="in_stock">In Stock (&gt; 0)</option>
            <option value="low_stock">Low Stock (&le; 5)</option>
            <option value="out_of_stock">Out of Stock (0)</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="stock_desc">Stock: High to Low</option>
            <option value="stock_asc">Stock: Low to High</option>
            <option value="name_asc">Name: A to Z</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-black text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Bulk Action Toolbar if selected */}
      {selectedIds.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-black text-white flex flex-wrap items-center justify-between gap-3 shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
              {selectedIds.length}
            </span>
            <span>products selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction("archive")}
              disabled={bulkLoading}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1.5"
            >
              <Archive className="w-3.5 h-3.5" />
              Archive Selected
            </button>
            <button
              onClick={() => handleBulkAction("activate")}
              disabled={bulkLoading}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Activate Selected
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              disabled={bulkLoading}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/30 text-red-300 hover:bg-red-500/50 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 space-y-3">
            <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-medium tracking-wider uppercase">Loading products catalog...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900">No products found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
              Try adjusting your search query, status filters, or add a new product to your inventory.
            </p>
            <Link
              to="/admin/products/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-semibold rounded-xl"
            >
              <Plus className="w-4 h-4" />
              Add First Product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 pl-6 pr-3 w-10">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-gray-400 hover:text-black"
                    >
                      {selectedIds.length === products.length ? (
                        <CheckSquare className="w-4 h-4 text-black" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-3 font-semibold">Product</th>
                  <th className="py-3.5 px-3 font-semibold">SKU</th>
                  <th className="py-3.5 px-3 font-semibold">Category</th>
                  <th className="py-3.5 px-3 font-semibold">Pricing</th>
                  <th className="py-3.5 px-3 font-semibold">Stock</th>
                  <th className="py-3.5 px-3 font-semibold">Status</th>
                  <th className="py-3.5 pr-6 pl-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  const isLowStock = p.stock > 0 && p.stock <= 5;
                  const isOutOfStock = p.stock === 0;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-gray-50/80 transition-colors ${isSelected ? "bg-amber-50/40" : ""
                        }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 pl-6 pr-3">
                        <button
                          type="button"
                          onClick={() => toggleSelectOne(p.id)}
                          className="text-gray-400 hover:text-black"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-black" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Product Thumbnail & Name */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                            {p.thumbnail ? (
                              <img
                                src={p.thumbnail.startsWith("http://localhost:8000") ? p.thumbnail.replace("http://localhost:8000", "") : p.thumbnail}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-[200px] sm:max-w-xs">
                            <Link
                              to={`/admin/products/edit/${p.id}`}
                              className="font-bold text-gray-900 hover:underline text-xs sm:text-sm truncate block"
                            >
                              {p.name}
                            </Link>
                            <p className="text-[11px] text-gray-400 truncate">
                              {p.brand || "NB BEADS STUDIO"} • {p.variants?.length ? `${p.variants.length} variants` : "Standard"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3.5 px-3">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-800">
                          {p.sku}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3">
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {p.category}
                        </span>
                        {p.subcategory && (
                          <span className="block text-[10px] text-gray-400 mt-0.5">
                            {p.subcategory}
                          </span>
                        )}
                      </td>

                      {/* Pricing & Discount */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-gray-900 text-xs sm:text-sm">
                            ₹{p.sale_price?.toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => openQuickEdit(p)}
                            className="p-1 rounded-md text-gray-400 hover:text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
                            title="Quick Edit Price (₹)"
                          >
                            <Edit className="w-3 h-3 text-purple-600" />
                          </button>
                        </div>
                        {p.mrp > p.sale_price && (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <span className="line-through text-gray-400">₹{p.mrp?.toFixed(2)}</span>
                            <span className="text-emerald-600 font-bold">
                              -{p.discount_percent || Math.round(((p.mrp - p.sale_price) / p.mrp) * 100)}%
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Stock Indicator */}
                      <td className="py-3.5 px-3">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700">
                            Out of stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            Low: {p.stock} left
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                            {p.stock} in stock
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        {p.status === "active" ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        ) : p.status === "archived" ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
                            Archived
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pr-6 pl-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Prominent Edit Button */}
                          <Link
                            to={`/admin/products/edit/${p.id}`}
                            title="Edit Product"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black text-white hover:bg-gray-800 text-xs font-semibold shadow-xs transition-all cursor-pointer hover:scale-105"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </Link>

                          {/* Duplicate */}
                          <button
                            type="button"
                            onClick={() => handleDuplicate(p.id, p.name)}
                            title="Duplicate Product"
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-black transition-colors cursor-pointer"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Archive/Restore */}
                          <button
                            type="button"
                            onClick={() => handleArchiveToggle(p.id, p.status, p.name)}
                            title={p.status === "archived" ? "Restore to Active" : "Archive Product"}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-black transition-colors cursor-pointer"
                          >
                            {p.status === "archived" ? (
                              <ArchiveRestore className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Archive className="w-4 h-4" />
                            )}
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(p)}
                            title="Delete Product"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div>
            Showing <span className="font-bold text-gray-900">{products.length}</span> of{" "}
            <span className="font-bold text-gray-900">{total}</span> products
          </div>

          {pages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-3 py-1 font-semibold text-gray-900">
                Page {page} of {pages}
              </span>
              <button
                disabled={page >= pages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Delete Product?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to permanently delete{" "}
                <span className="font-bold text-gray-900">"{deleteTarget.name}"</span> (SKU: {deleteTarget.sku})? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Price & Stock Edit Modal */}
      {quickEditProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form
            onSubmit={handleSaveQuickPrice}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Quick Price & Stock Update</h3>
                  <p className="text-xs text-gray-500 truncate max-w-[240px]">
                    {quickEditProduct.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickEditProduct(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-1">
              {/* MRP (₹) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  MRP / Original Price (₹ INR) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={quickMrp}
                    onChange={(e) => setQuickMrp(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* Sale Price (₹) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Sale Price (₹ INR) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={quickSalePrice}
                    onChange={(e) => setQuickSalePrice(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 bg-emerald-50/40 border border-emerald-200 rounded-xl text-sm font-bold text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Inventory Stock */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Inventory Stock (Units) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={quickStock}
                  onChange={(e) => setQuickStock(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Discount Preview */}
              {Number(quickMrp) > Number(quickSalePrice) && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center justify-between">
                  <span>Calculated Discount:</span>
                  <span className="font-bold">
                    {Math.round(((Number(quickMrp) - Number(quickSalePrice)) / Number(quickMrp)) * 100)}% OFF
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={quickSaving}
                onClick={() => setQuickEditProduct(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={quickSaving}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-black text-white hover:bg-gray-800 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                {quickSaving ? "Saving..." : "Save Price (₹)"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
