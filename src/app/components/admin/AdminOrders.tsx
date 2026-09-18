import React, { useState, useEffect } from "react";
import { adminApi } from "../../api";
import {
  ShoppingCart,
  Search,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
  CheckCircle,
  Truck,
  Clock,
  XCircle,
  MapPin,
  User,
  Phone,
  DollarSign,
  Receipt
} from "lucide-react";
import { toast } from "sonner";

export function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Filters
  const [shippingStatus, setShippingStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [search, setSearch] = useState("");

  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOrders({
        page,
        limit: 12,
        shipping_status: shippingStatus,
        payment_status: paymentStatus,
        search: search.trim() || undefined
      });
      if (res.success && res.data) {
        setOrders(res.data.orders || []);
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);
      } else {
        toast.error(res.message || "Failed to fetch orders");
      }
    } catch {
      toast.error("Network error loading orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, shippingStatus, paymentStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const openDetailModal = async (orderId: string) => {
    try {
      const res = await adminApi.getOrderDetail(orderId);
      if (res.success && res.data) {
        setSelectedOrder(res.data);
        setModalOpen(true);
      } else {
        toast.error(res.message || "Failed to load order details");
      }
    } catch {
      toast.error("Network error fetching order details");
    }
  };

  const handleStatusChange = async (newShippingStatus: string, newPaymentStatus?: string) => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    try {
      const res = await adminApi.updateOrderStatus(
        selectedOrder.id,
        newShippingStatus,
        newPaymentStatus || selectedOrder.payment_status
      );
      if (res.success) {
        toast.success(`Order status updated to ${newShippingStatus}`);
        setSelectedOrder({
          ...selectedOrder,
          shipping_status: newShippingStatus,
          payment_status: newPaymentStatus || selectedOrder.payment_status
        });
        fetchOrders();
      } else {
        toast.error(res.message || "Failed to update status");
      }
    } catch {
      toast.error("Network error updating order status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const toastId = toast.loading("Deleting order...");
    try {
      const res = await adminApi.deleteOrder(deleteTarget.id);
      if (res.success) {
        toast.success("Order deleted successfully", { id: toastId });
        setDeleteTarget(null);
        fetchOrders();
      } else {
        toast.error(res.message || "Failed to delete order", { id: toastId });
      }
    } catch {
      toast.error("Network error deleting order", { id: toastId });
    }
  };

  const getShippingBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"><CheckCircle className="w-3 h-3" /> Delivered</span>;
      case "shipped":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800"><Truck className="w-3 h-3" /> Shipped</span>;
      case "packed":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800"><Package className="w-3 h-3" /> Packed</span>;
      case "cancelled":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800"><XCircle className="w-3 h-3" /> Cancelled</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800"><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">Paid</span>;
      case "failed":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700">Failed</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700">Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900">Orders Management</h2>
          <p className="text-xs text-gray-500">Track shipments, verify payment statuses, and review order invoices</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, phone, city..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </form>

        <select
          value={shippingStatus}
          onChange={(e) => {
            setShippingStatus(e.target.value);
            setPage(1);
          }}
          className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="all">All Shipping Statuses</option>
          <option value="pending">Pending</option>
          <option value="packed">Packed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={paymentStatus}
          onChange={(e) => {
            setPaymentStatus(e.target.value);
            setPage(1);
          }}
          className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="all">All Payment Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-500 space-y-3">
            <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold uppercase tracking-wider">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="font-bold text-gray-800">No orders found</p>
            <p className="text-xs text-gray-400 mt-0.5">Try clearing filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 pl-6 pr-3">Order</th>
                  <th className="py-3.5 px-3">Customer</th>
                  <th className="py-3.5 px-3">Items</th>
                  <th className="py-3.5 px-3">Total</th>
                  <th className="py-3.5 px-3">Payment</th>
                  <th className="py-3.5 px-3">Shipping Status</th>
                  <th className="py-3.5 px-3">Date</th>
                  <th className="py-3.5 pr-6 pl-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 pl-6 pr-3 font-mono font-bold text-gray-900 text-xs">
                      {o.order_number}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-bold text-gray-900 text-xs">{o.shipping_address?.name || "Customer"}</div>
                      <div className="text-[11px] text-gray-500">{o.shipping_address?.city || "Online"}</div>
                    </td>

                    <td className="py-3.5 px-3 text-xs text-gray-600 font-medium">
                      {o.items_count} item{o.items_count !== 1 ? "s" : ""}
                    </td>

                    <td className="py-3.5 px-3 font-extrabold text-gray-900 text-xs">
                      ₹{o.total?.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-3">
                      {getPaymentBadge(o.payment_status)}
                    </td>

                    <td className="py-3.5 px-3">
                      {getShippingBadge(o.shipping_status)}
                    </td>

                    <td className="py-3.5 px-3 text-xs text-gray-500 whitespace-nowrap">
                      {o.created_at_formatted}
                    </td>

                    <td className="py-3.5 pr-6 pl-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openDetailModal(o.id)}
                          className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-black hover:text-white text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(o)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div>
            Showing <span className="font-bold text-gray-900">{orders.length}</span> of{" "}
            <span className="font-bold text-gray-900">{total}</span> orders
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

      {/* Order Detail Modal */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-gray-100 space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Order Details</span>
                <h3 className="text-xl font-bold text-gray-900">{selectedOrder.order_number}</h3>
                <p className="text-xs text-gray-500">{selectedOrder.created_at_formatted}</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* Status Control */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Shipping Status</span>
                <select
                  value={selectedOrder.shipping_status}
                  disabled={updatingStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="pending">Pending</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <span className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Payment Status</span>
                <select
                  value={selectedOrder.payment_status}
                  disabled={updatingStatus}
                  onChange={(e) => handleStatusChange(selectedOrder.shipping_status, e.target.value)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-4 rounded-2xl border border-gray-100 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-black" />
                Shipping Destination
              </h4>
              <div className="text-xs text-gray-700 space-y-0.5">
                <p className="font-bold text-gray-900">{selectedOrder.shipping_address?.name}</p>
                <p>{selectedOrder.shipping_address?.address}</p>
                <p>{selectedOrder.shipping_address?.city} - {selectedOrder.shipping_address?.postal_code}</p>
                <p className="text-gray-500 flex items-center gap-1 pt-1">
                  <Phone className="w-3 h-3" />
                  {selectedOrder.shipping_address?.phone || "No phone provided"}
                </p>
              </div>
            </div>

            {/* Ordered Items */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-black" />
                Purchased Items ({selectedOrder.items?.length || 0})
              </h4>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between gap-3 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-xs">{item.name}</p>
                        <p className="text-[11px] text-gray-500">
                          Qty: {item.quantity} × ₹{item.price?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 text-xs">
                      ₹{(item.quantity * item.price)?.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Price Breakdown */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{selectedOrder.subtotal?.toFixed(2)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount</span>
                  <span>-₹{selectedOrder.discount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>₹{selectedOrder.shipping?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST Tax (18%)</span>
                <span>₹{selectedOrder.gst?.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between font-black text-sm text-gray-900">
                <span>Grand Total</span>
                <span>₹{selectedOrder.total?.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-base font-bold text-gray-900">Delete Order?</h3>
            <p className="text-xs text-gray-500">
              Are you sure you want to delete order <span className="font-bold text-gray-900">{deleteTarget.order_number}</span>?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
