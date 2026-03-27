import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  cancelOrderAdmin,
  getAdminOrderById,
  type AdminOrder,
  type OrderStatus,
  updateOrderStatus,
} from "../../api/services/adminOrderService";
import Sidebar from "../../components/admin/Sidebar";
import TopNavbar from "../../components/admin/TopNavbar";
import ToastStack from "../../components/admin/ToastStack";
import AdminCancelOrderModal from "../../components/admin/orders/AdminCancelOrderModal";
import OrderStatusBadge from "../../components/admin/orders/OrderStatusBadge";
import OrderStatusUpdateModal from "../../components/admin/orders/OrderStatusUpdateModal";
import type { DashboardMenuKey, ToastItem } from "../../types/adminDashboard";

const getNextStatus = (current: string): OrderStatus | null => {
  const map: Record<string, OrderStatus> = {
    PAID: "PROCESSING",
    PROCESSING: "SHIPPED",
    SHIPPED: "DELIVERED",
  };
  return map[current] ?? null;
};

const canAdminCancel = (status: string): boolean => ["PENDING_PAYMENT", "PAID", "PROCESSING"].includes(status);

const STEPS: Array<{ key: OrderStatus; label: string; icon: string }> = [
  { key: "PENDING_PAYMENT", label: "Pending Payment", icon: "💳" },
  { key: "PAID", label: "Paid", icon: "✓" },
  { key: "PROCESSING", label: "Processing", icon: "⚙️" },
  { key: "SHIPPED", label: "Shipped", icon: "🚚" },
  { key: "DELIVERED", label: "Delivered", icon: "📦" },
];

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

function StatusTracker({ status }: { status: OrderStatus }) {
  const currentIndex = STEPS.findIndex((step) => step.key === status);

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-[560px] items-start">
        {STEPS.map((step, index) => {
          const active = currentIndex >= index;
          const current = currentIndex === index;

          return (
            <div key={step.key} className="flex flex-1 items-start">
              <div className="flex min-w-[84px] flex-col items-center text-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                    active ? "bg-teal-600 text-white" : "border border-teal-200 bg-white text-slate-500"
                  } ${current ? "shadow-[0_0_0_4px_rgba(13,148,136,0.14)]" : ""}`}
                >
                  {currentIndex > index ? "✓" : step.icon}
                </div>
                <span className={`mt-2 text-[10px] font-semibold ${active ? "text-teal-700" : "text-slate-500"}`}>{step.label}</span>
              </div>

              {index < STEPS.length - 1 ? (
                <div className="mt-[17px] flex-1 px-2">
                  <div className="h-[2px] rounded-full bg-teal-100">
                    <div className={`h-full rounded-full bg-teal-500 ${currentIndex > index ? "w-full" : "w-0"}`} />
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState<DashboardMenuKey>("orders");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [statusDialog, setStatusDialog] = useState<{ currentStatus: OrderStatus; nextStatus: OrderStatus } | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = (message: string, type: ToastItem["type"]) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 2500);
  };

  const loadOrder = async () => {
    setLoading(true);
    try {
      const data = await getAdminOrderById(Number(orderId));
      setOrder(data);
    } catch (error) {
      pushToast(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrder();
  }, [orderId]);

  const nextStatus = order ? getNextStatus(order.status) : null;

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
          <div className="text-sm">
            <Link to="/admin/orders" className="font-semibold text-teal-700 hover:text-teal-800">
              Order Management
            </Link>
            <span className="mx-2 text-slate-400">›</span>
            <span className="font-semibold text-slate-900">Order #{orderId}</span>
          </div>

          {loading ? (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-5">
                <div className="rounded-2xl border border-teal-100 bg-white p-5 shadow-md shadow-teal-100/60">
                  <div className="h-24 animate-pulse rounded-xl bg-slate-200" />
                </div>
                <div className="rounded-2xl border border-teal-100 bg-white p-5 shadow-md shadow-teal-100/60">
                  <div className="h-48 animate-pulse rounded-xl bg-slate-200" />
                </div>
              </div>
              <div className="rounded-2xl border border-teal-100 bg-white p-5 shadow-md shadow-teal-100/60">
                <div className="h-56 animate-pulse rounded-xl bg-slate-200" />
              </div>
            </div>
          ) : order ? (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-5">
                <section className="rounded-2xl border border-teal-100 bg-white p-5 shadow-md shadow-teal-100/60">
                  <h2 className="text-lg font-bold text-slate-900">Order Status</h2>
                  {order.status === "CANCELLED" || order.status === "FAILED" ? (
                    <div className="mt-4 rounded-xl border-l-4 border-rose-500 bg-rose-50 px-4 py-4">
                      <p className="font-semibold text-rose-700">Order {order.status === "FAILED" ? "Failed" : "Cancelled"}</p>
                      {order.cancelReason ? <p className="mt-1 text-sm italic text-slate-600">{order.cancelReason}</p> : null}
                    </div>
                  ) : (
                    <div className="mt-5">
                      <StatusTracker status={order.status} />
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border border-teal-100 bg-white p-5 shadow-md shadow-teal-100/60">
                  <h2 className="text-lg font-bold text-slate-900">Items Ordered ({order.items.length})</h2>
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-y-2">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                          <th className="px-3 py-2">Product</th>
                          <th className="px-3 py-2">Qty</th>
                          <th className="px-3 py-2">Unit Price</th>
                          <th className="px-3 py-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item) => (
                          <tr key={item.id} className="rounded-xl bg-teal-50/50 text-sm text-slate-700">
                            <td className="rounded-l-xl px-3 py-3 font-medium text-slate-900">{item.productName}</td>
                            <td className="px-3 py-3">{item.quantity}</td>
                            <td className="px-3 py-3">{formatMoney(item.priceAtPurchase)}</td>
                            <td className="rounded-r-xl px-3 py-3 font-semibold text-slate-900">{formatMoney(item.lineTotal)}</td>
                          </tr>
                        ))}
                        <tr className="text-sm font-bold text-slate-900">
                          <td className="px-3 pt-4" colSpan={3}>
                            Order Total
                          </td>
                          <td className="px-3 pt-4">{formatMoney(order.totalAmount)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              <div className="space-y-5">
                <section className="rounded-2xl border border-teal-100 bg-white p-5 shadow-md shadow-teal-100/60">
                  <h2 className="text-lg font-bold text-slate-900">Order Info</h2>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <div className="flex items-center justify-between border-b border-teal-100 pb-3">
                      <span>Order ID</span>
                      <span className="font-semibold text-teal-700">#{order.id}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-teal-100 pb-3">
                      <span>Date</span>
                      <span className="font-semibold text-slate-900">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-teal-100 pb-3">
                      <span>Status</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div className="flex items-center justify-between border-b border-teal-100 pb-3">
                      <span>Total</span>
                      <span className="font-semibold text-slate-900">{formatMoney(order.totalAmount)}</span>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-teal-100 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Shipping Address</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{order.shippingAddress}</p>
                    <p className="mt-2 text-sm text-slate-500">Pincode: {order.shippingPincode || "-"}</p>
                  </div>

                  {order.cancelReason ? (
                    <div className="mt-4 border-t border-teal-100 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cancel Reason</p>
                      <p className="mt-2 text-sm italic text-slate-600">{order.cancelReason}</p>
                    </div>
                  ) : null}
                </section>

                <section className="rounded-2xl border border-teal-100 bg-white p-5 shadow-md shadow-teal-100/60">
                  {nextStatus ? (
                    <button
                      type="button"
                      onClick={() => setStatusDialog({ currentStatus: order.status, nextStatus })}
                      className="w-full rounded-full bg-teal-600 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-700"
                    >
                      {order.status === "PAID" ? "Mark Processing" : order.status === "PROCESSING" ? "Mark Shipped" : "Mark Delivered"}
                    </button>
                  ) : null}

                  {canAdminCancel(order.status) ? (
                    <button
                      type="button"
                      onClick={() => setCancelOpen(true)}
                      className={`w-full rounded-full border border-rose-300 px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 ${nextStatus ? "mt-2" : ""}`}
                    >
                      Cancel Order
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => navigate("/admin/orders")}
                    className={`w-full rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 ${nextStatus || canAdminCancel(order.status) ? "mt-2" : ""}`}
                  >
                    Back to Orders
                  </button>
                </section>
              </div>
            </div>
          ) : null}
        </motion.main>
      </div>

      <OrderStatusUpdateModal
        isOpen={Boolean(statusDialog)}
        currentStatus={statusDialog?.currentStatus || null}
        nextStatus={statusDialog?.nextStatus || null}
        loading={modalLoading}
        onClose={() => setStatusDialog(null)}
        onConfirm={async () => {
          if (!order || !statusDialog) return;
          setModalLoading(true);
          try {
            const updated = await updateOrderStatus(order.id, statusDialog.nextStatus);
            setOrder(updated);
            setStatusDialog(null);
            pushToast("Order status updated", "success");
          } catch (error) {
            pushToast(getErrorMessage(error), "error");
          } finally {
            setModalLoading(false);
          }
        }}
      />

      <AdminCancelOrderModal
        isOpen={cancelOpen}
        order={order}
        loading={modalLoading}
        onClose={() => setCancelOpen(false)}
        onConfirm={async (reason) => {
          if (!order) return;
          setModalLoading(true);
          try {
            const updated = await cancelOrderAdmin(order.id, reason);
            setOrder(updated);
            setCancelOpen(false);
            pushToast("Order cancelled successfully", "success");
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
