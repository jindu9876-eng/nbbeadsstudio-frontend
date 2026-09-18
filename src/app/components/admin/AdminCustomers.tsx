import React, { useState, useEffect } from "react";
import { adminApi } from "../../api";
import {
  Users,
  Search,
  ShieldAlert,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";

export function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCustomers({
        page,
        limit: 15,
        status,
        search: search.trim() || undefined
      });
      if (res.success && res.data) {
        setCustomers(res.data.customers || []);
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);
      } else {
        toast.error(res.message || "Failed to fetch customers");
      }
    } catch {
      toast.error("Network error loading customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleToggleStatus = async (customer: any) => {
    const newStatus = customer.status === "active" ? "blocked" : "active";
    const actionName = newStatus === "active" ? "unblocked" : "blocked";
    setStatusUpdatingId(customer.id);
    try {
      const res = await adminApi.updateCustomerStatus(customer.id, newStatus);
      if (res.success) {
        toast.success(`Customer "${customer.name}" ${actionName}.`);
        setCustomers(
          customers.map((c) => (c.id === customer.id ? { ...c, status: newStatus } : c))
        );
      } else {
        toast.error(res.message || "Failed to update customer status");
      }
    } catch {
      toast.error("Network error updating customer status");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900">Customer Accounts</h2>
          <p className="text-xs text-gray-500">
            Registered shopper profiles, order history, lifetime spend, and account access
          </p>
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
            placeholder="Search customer by name, email, phone..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </form>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="all">All Customer Accounts</option>
          <option value="active">Active Shoppers</option>
          <option value="blocked">Blocked Accounts</option>
        </select>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-500 space-y-3">
            <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold uppercase tracking-wider">Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="font-bold text-gray-800">No customers found</p>
            <p className="text-xs text-gray-400 mt-0.5">Customer sign-ups will show up here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 pl-6 pr-3">Customer</th>
                  <th className="py-3.5 px-3">Contact</th>
                  <th className="py-3.5 px-3">Address</th>
                  <th className="py-3.5 px-3">Total Orders</th>
                  <th className="py-3.5 px-3">Total Spent</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 pr-6 pl-3 text-right">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((c) => {
                  const isBlocked = c.status === "blocked";
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {c.name?.slice(0, 2) || "U"}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-xs">{c.name}</p>
                            <p className="text-[10px] text-gray-400">Joined {c.joined_date}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-xs">
                        <div className="text-gray-900 font-medium flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-gray-400" />
                          {c.email}
                        </div>
                        {c.phone && c.phone !== "N/A" && (
                          <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {c.phone}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-xs text-gray-600 max-w-[200px] truncate">
                        {c.address || "N/A"}
                      </td>

                      <td className="py-3.5 px-3 font-semibold text-gray-900 text-xs">
                        <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-800">
                          {c.total_orders} orders
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-extrabold text-gray-900 text-xs">
                        ₹{c.total_spend?.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-3">
                        {isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                            <ShieldAlert className="w-3 h-3" /> Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            <ShieldCheck className="w-3 h-3" /> Active
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 pr-6 pl-3 text-right">
                        <button
                          type="button"
                          disabled={statusUpdatingId === c.id}
                          onClick={() => handleToggleStatus(c)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isBlocked
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-red-50 text-red-600 hover:bg-red-100"
                          } disabled:opacity-50`}
                        >
                          {statusUpdatingId === c.id
                            ? "Updating..."
                            : isBlocked
                            ? "Unblock Account"
                            : "Block Account"}
                        </button>
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
            Showing <span className="font-bold text-gray-900">{customers.length}</span> of{" "}
            <span className="font-bold text-gray-900">{total}</span> customers
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
    </div>
  );
}
