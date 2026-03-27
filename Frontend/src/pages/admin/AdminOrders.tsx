import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  cancelOrderAdmin,
  getAdminOrders,
  type AdminOrder,
  type OrderStatus,
  updateOrderStatus,
} from "../../api/services/adminOrderService";
import { EyeIcon } from "../../components/admin/Icons";
import Sidebar from "../../components/admin/Sidebar";
import StatsCard from "../../components/admin/StatsCard";
import ToastStack from "../../components/admin/ToastStack";
import TopNavbar from "../../components/admin/TopNavbar";
import AdminCancelOrderModal from "../../components/admin/orders/AdminCancelOrderModal";
import OrderStatusBadge from "../../components/admin/orders/OrderStatusBadge";
import OrderStatusUpdateModal from "../../components/admin/orders/OrderStatusUpdateModal";
import type { DashboardMenuKey, ToastItem } from "../../types/adminDashboard";

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Pending Payment", value: "PENDING_PAYMENT" },
  { label: "Paid", value: "PAID" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
] as const;

const getNextStatus = (current: string): OrderStatus | null => {
  const map: Record<string, OrderStatus> = {
    PAID: "PROCESSING",
    PROCESSING: "SHIPPED",
    SHIPPED: "DELIVERED",
  };
  return map[current] ?? null;
};

const canAdminCancel = (status: string): boolean => ["PENDING_PAYMENT", "PAID", "PROCESSING"].includes(status);

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const data = (error as { response?: { data?: { message?: string } | string } }).response?.data;
    if (typeof data === "string" && data.trim()) return data;
    if (data && typeof data === "object" && typeof data.message === "string") return data.message;
  }
  return error instanceof Error ? error.message : "Request failed";
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(value: number) {
  return `₹${Number(value || 0).toFixed(2)}`;
}

function OrdersTableSkeleton() {
  return (
    <tbody>
      {Array.from({ length: 5 }).map((_, index) => (
        <tr key={index} className="text-sm">
          {Array.from({ length: 6 }).map((__, cellIndex) => (
            <td key={cellIndex} className="px-3 py-3">
              <div className="h-4 animate-pulse rounded bg-slate-200" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

export default function AdminOrders() {
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState<DashboardMenuKey>("orders");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState("");
  const [statusDialog, setStatusDialog] = useState<{ order: AdminOrder; nextStatus: OrderStatus } | null>(null);
  const [cancelDialog, setCancelDialog] = useState<AdminOrder | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = (message: string, type: ToastItem["type"]) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 2500);
  };

  const loadOrders = async (status = activeStatus) => {
    setLoading(true);
    try {
      const data = await getAdminOrders({
        offset: 0,
        limit: 20,
        ...(status ? { status: status as OrderStatus } : {}),
      });
      setOrders(data);
    } catch (error) {
      pushToast(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders(activeStatus);
  }, [activeStatus]);

  const metrics = useMemo(
    () => [
      { key: "users", label: "Total Orders", value: orders.length, colorClass: "from-cyan-500 to-sky-600" },
      {
        key: "pending",
        label: "Pending Payment",
        value: orders.filter((order) => order.status === "PENDING_PAYMENT").length,
        colorClass: "from-amber-400 to-orange-500",
      },
      {
        key: "appointments",
        label: "Processing",
        value: orders.filter((order) => order.status === "PROCESSING").length,
        colorClass: "from-indigo-400 to-sky-600",
      },
      {
        key: "listings",
        label: "Delivered",
        value: orders.filter((order) => order.status === "DELIVERED").length,
        colorClass: "from-emerald-400 to-teal-600",
      },
    ],
    [orders]
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#d9fdf2_0%,_#eff9ff_48%,_#f9fffe_100%)] text-slate-900">
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        selected={selectedMenu}
        onSelect={setSelectedMenu}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className={`min-h-screen transition-[margin] duration-300 ${sidebarCollapsed ? "lg:ml-[92px]" : "lg:ml-[270px]"}`}>
        <TopNavbar onOpenSidebar={() => setMobileSidebarOpen(true)} />

        <motion.main initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-5 px-4 py-5 sm:px-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <StatsCard key={metric.label} metric={metric} />
            ))}
          </section>

          <section className="rounded-2xl border border-teal-100 bg-white p-4 shadow-md shadow-teal-100/60 sm:p-5">
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((filter) => {
                const active = activeStatus === filter.value;
                return (
                  <button
                    key={filter.label}
                    type="button"
                    onClick={() => setActiveStatus(filter.value)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      active ? "bg-teal-600 text-white shadow-md shadow-teal-300/60" : "bg-teal-50 text-slate-700 hover:bg-teal-100"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-teal-100 bg-white p-4 shadow-md shadow-teal-100/60 sm:p-5">
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2">Order ID</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Items</th>
                    <th className="px-3 py-2">Total</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                {loading ? (
                  <OrdersTableSkeleton />
                ) : (
                  <tbody>
                    {orders.map((order) => {
                      const nextStatus = getNextStatus(order.status);
                      return (
                        <tr key={order.id} className="rounded-xl bg-teal-50/50 text-sm text-slate-700">
                          <td className="rounded-l-xl px-3 py-3 font-semibold text-slate-900">#{order.id}</td>
                          <td className="px-3 py-3 text-xs text-slate-500">{formatDate(order.createdAt)}</td>
                          <td className="px-3 py-3 text-xs text-slate-500">{order.items.length} items</td>
                          <td className="px-3 py-3 font-semibold text-slate-900">{formatMoney(order.totalAmount)}</td>
                          <td className="px-3 py-3">
                            <OrderStatusBadge status={order.status} />
                          </td>
                          <td className="rounded-r-xl px-3 py-3">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => navigate(`/admin/orders/${order.id}`)}
                                className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-teal-50"
                              >
                                <EyeIcon className="h-3.5 w-3.5" />
                                View
                              </button>

                              {nextStatus ? (
                                <button
                                  type="button"
                                  onClick={() => setStatusDialog({ order, nextStatus })}
                                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                                    order.status === "PAID"
                                      ? "bg-[#DAEAF8] text-[#1E6FD9]"
                                      : order.status === "PROCESSING"
                                      ? "bg-[#D0F5EB] text-[#1BAF82]"
                                      : "bg-[#D1FAE5] text-[#065F46]"
                                  }`}
                                >
                                  {order.status === "PAID"
                                    ? "Mark Processing"
                                    : order.status === "PROCESSING"
                                    ? "Mark Shipped"
                                    : "Mark Delivered"}
                                </button>
                              ) : null}

                              {canAdminCancel(order.status) ? (
                                <button
                                  type="button"
                                  onClick={() => setCancelDialog(order)}
                                  className="rounded-lg border border-rose-300 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                                >
                                  Cancel
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                )}
              </table>
            </div>

            {!loading && orders.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-teal-200 bg-teal-50/60 px-4 py-6 text-center text-sm text-slate-600">
                No orders found for this filter.
              </p>
            ) : null}
          </section>
        </motion.main>
      </div>

      <OrderStatusUpdateModal
        isOpen={Boolean(statusDialog)}
        currentStatus={statusDialog?.order.status || null}
        nextStatus={statusDialog?.nextStatus || null}
        loading={modalLoading}
        onClose={() => setStatusDialog(null)}
        onConfirm={async () => {
          if (!statusDialog) return;
          setModalLoading(true);
          try {
            await updateOrderStatus(statusDialog.order.id, statusDialog.nextStatus);
            pushToast("Order status updated", "success");
            setStatusDialog(null);
            await loadOrders(activeStatus);
          } catch (error) {
            pushToast(getErrorMessage(error), "error");
          } finally {
            setModalLoading(false);
          }
        }}
      />

      <AdminCancelOrderModal
        isOpen={Boolean(cancelDialog)}
        order={cancelDialog}
        loading={modalLoading}
        onClose={() => setCancelDialog(null)}
        onConfirm={async (reason) => {
          if (!cancelDialog) return;
          setModalLoading(true);
          try {
            await cancelOrderAdmin(cancelDialog.id, reason);
            pushToast("Order cancelled successfully", "success");
            setCancelDialog(null);
            await loadOrders(activeStatus);
          } catch (error) {
            pushToast(getErrorMessage(error), "error");
          } finally {
            setModalLoading(false);
          }
        }}
      />

      <ToastStack toasts={toasts} />
    </div>
  );
}
