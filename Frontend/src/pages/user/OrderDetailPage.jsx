import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getOrderById } from "../../api/services/orderService";
import Sidebar from "../../components/dashboard/Sidebar";
import TopBar from "../../components/dashboard/TopBar";
import { useToast } from "../../components/shared/Toast";
import CancelOrderModal from "../../components/user/orders/CancelOrderModal";
import OrderStatusBadge from "../../components/user/orders/OrderStatusBadge";
import OrderStatusTracker from "../../components/user/orders/OrderStatusTracker";

function getLoggedInName() {
  return localStorage.getItem("userName") || "Pet Parent";
}

function formatMoney(value) {
  return `Rs ${Number(value || 0).toFixed(2)}`;
}

function formatDate(value) {
  if (!value) return "-";
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

function DetailSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <div className="rounded-[20px] border border-[#E2EBF0] bg-white p-6 shadow-[0_2px_8px_rgba(26,35,50,0.06)]">
          <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
          <div className="mt-5 h-20 animate-pulse rounded-xl bg-slate-200" />
        </div>
        <div className="rounded-[20px] border border-[#E2EBF0] bg-white p-6 shadow-[0_2px_8px_rgba(26,35,50,0.06)]">
          <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded bg-slate-200" />
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-5">
        <div className="rounded-[20px] border border-[#E2EBF0] bg-white p-6 shadow-[0_2px_8px_rgba(26,35,50,0.06)]">
          <div className="h-5 w-36 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-10 animate-pulse rounded bg-slate-200" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  const ownerName = useMemo(() => getLoggedInName(), []);
  const owner = useMemo(
    () => ({
      name: ownerName,
      avatar: ownerName.charAt(0).toUpperCase() || "P",
    }),
    [ownerName]
  );

  const navItems = useMemo(
    () => [
      { label: "Dashboard", icon: "\uD83C\uDFE0", to: "/user-dashboard", section: "MAIN" },
      { label: "My Pets", icon: "\uD83D\uDC36", to: "/pets", section: "MAIN" },
      { label: "Appointments", icon: "\uD83D\uDCC5", to: "/appointments", section: "MAIN" },
      { label: "Marketplace", icon: "\uD83D\uDECD\uFE0F", to: "/marketplace", section: "MORE" },
      { label: "Cart", icon: "\uD83D\uDED2", to: "/cart", section: "MORE" },
      { label: "My Orders", icon: "\uD83D\uDCE6", to: "/my-orders", activeRoute: true, section: "MORE" },
    ],
    []
  );

  const loadOrder = async () => {
    setIsLoading(true);
    try {
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (error) {
      showToast(error?.response?.data?.message || "Failed to load order details", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const items = Array.isArray(order?.items) ? order.items : [];
  const statusLabel = order?.status === "FAILED" ? "Failed" : "Cancelled";

  return (
    <div className="min-h-screen bg-[#EBF4F8] text-[#1A2332]">
      <Sidebar user={owner} navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="px-4 pb-8 pt-5 md:ml-[260px] md:p-7">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5">
          <TopBar
            variant="page"
            title="Order Details"
            subtitle="View the full status and items in your order"
            onOpenSidebar={() => setSidebarOpen(true)}
            actions={null}
          />

          <div className="text-sm">
            <Link to="/my-orders" className="font-semibold text-[#1BAF82] transition hover:text-[#15956E]">
              My Orders
            </Link>
            <span className="mx-2 text-[#6B7A8D]">{"\u203A"}</span>
            <span className="font-semibold text-[#1A2332]">Order #{orderId}</span>
          </div>

          {isLoading ? (
            <DetailSkeleton />
          ) : !order ? (
            <section className="rounded-[20px] border border-[#E2EBF0] bg-white px-6 py-14 text-center shadow-[0_2px_8px_rgba(26,35,50,0.06)]">
              <div className="text-4xl">{"\uD83D\uDE15"}</div>
              <h2 className="mt-3 text-lg font-extrabold text-[#1A2332]">Could not load order details</h2>
              <button
                type="button"
                onClick={() => navigate("/my-orders")}
                className="mt-5 rounded-full bg-[#2DD4A0] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1BAF82]"
              >
                Back to Orders
              </button>
            </section>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-5">
                <section className="rounded-[20px] border border-[#E2EBF0] bg-white p-6 shadow-[0_2px_8px_rgba(26,35,50,0.06)]">
                  <h2 className="text-[15px] font-extrabold text-[#1A2332]">Order Status</h2>

                  {order.status === "CANCELLED" || order.status === "FAILED" ? (
                    <div className="mt-4 rounded-xl border-l-4 border-[#F87171] bg-[#FEE2E2] px-4 py-4">
                      <p className="text-[14px] font-bold text-[#991B1B]">Order {statusLabel}</p>
                      {order.cancelReason ? (
                        <p className="mt-2 text-[12px] italic text-[#6B7A8D]">{order.cancelReason}</p>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-5">
                      <OrderStatusTracker currentStatus={order.status} />
                    </div>
                  )}
                </section>

                <section className="rounded-[20px] border border-[#E2EBF0] bg-white p-6 shadow-[0_2px_8px_rgba(26,35,50,0.06)]">
                  <h2 className="text-[15px] font-extrabold text-[#1A2332]">Items Ordered ({items.length})</h2>

                  <div className="mt-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-4 border-b border-[#E2EBF0] py-3 last:border-b-0"
                      >
                        <div className="pr-3">
                          <p className="text-[14px] font-bold text-[#1A2332]">{item.productName}</p>
                          <p className="mt-1 text-[12px] text-[#6B7A8D]">Qty: {item.quantity}</p>
                          <p className="mt-1 text-[11px] text-[#6B7A8D]">{formatMoney(item.priceAtPurchase)} each</p>
                        </div>
                        <p className="text-[14px] font-bold text-[#1A2332]">{formatMoney(item.lineTotal)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#E2EBF0] pt-4">
                    <span className="text-[14px] font-bold text-[#1A2332]">Order Total</span>
                    <span className="text-[16px] font-extrabold text-[#1A2332]">{formatMoney(order.totalAmount)}</span>
                  </div>
                </section>
              </div>

              <div className="space-y-5">
                <aside className="rounded-[20px] border border-[#E2EBF0] bg-white p-6 shadow-[0_2px_8px_rgba(26,35,50,0.06)]">
                  <h2 className="text-[15px] font-extrabold text-[#1A2332]">Order Information</h2>

                  <div className="mt-4 space-y-0">
                    <div className="flex items-center justify-between border-b border-[#E2EBF0] py-3">
                      <span className="text-[13px] text-[#6B7A8D]">Order ID</span>
                      <span className="text-[13px] font-bold text-[#1BAF82]">#{order.id}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#E2EBF0] py-3">
                      <span className="text-[13px] text-[#6B7A8D]">Date</span>
                      <span className="text-[13px] font-semibold text-[#1A2332]">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#E2EBF0] py-3">
                      <span className="text-[13px] text-[#6B7A8D]">Status</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div className="flex items-center justify-between border-b border-[#E2EBF0] py-3">
                      <span className="text-[13px] text-[#6B7A8D]">Total</span>
                      <span className="text-[13px] font-bold text-[#1A2332]">{formatMoney(order.totalAmount)}</span>
                    </div>
                  </div>

                  <div className="my-4 border-t border-[#E2EBF0]" />

                  <p className="text-[9px] font-bold uppercase tracking-[1px] text-[#6B7A8D]">Shipping Address</p>
                  <p className="mt-2 text-[13px] leading-7 text-[#1A2332]">{order.shippingAddress || "-"}</p>
                  <p className="mt-1 text-[12px] text-[#6B7A8D]">Pincode: {order.shippingPincode || "-"}</p>

                  {order.cancelReason ? (
                    <>
                      <div className="my-4 border-t border-[#E2EBF0]" />
                      <p className="text-[9px] font-bold uppercase tracking-[1px] text-[#6B7A8D]">Cancellation Reason</p>
                      <p className="mt-2 text-[12px] italic text-[#6B7A8D]">{order.cancelReason}</p>
                    </>
                  ) : null}
                </aside>

                <aside className="rounded-[20px] border border-[#E2EBF0] bg-white p-6 shadow-[0_2px_8px_rgba(26,35,50,0.06)]">
                  {order.status === "PENDING_PAYMENT" ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/payment/${order.id}`)}
                        className="inline-flex w-full items-center justify-center rounded-full bg-[#2DD4A0] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#1BAF82]"
                      >
                        Pay Now
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCancelOpen(true)}
                        className="inline-flex w-full items-center justify-center rounded-full border border-[#F87171] px-4 py-3 text-sm font-bold text-[#F87171] transition hover:bg-[#FEE2E2]"
                      >
                        Cancel Order
                      </button>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => navigate("/my-orders")}
                    className={[
                      "inline-flex w-full items-center justify-center rounded-full border border-[#E2EBF0] px-4 py-3 text-sm font-bold text-[#1A2332] transition hover:border-[#2DD4A0] hover:text-[#1BAF82]",
                      order.status === "PENDING_PAYMENT" ? "mt-2" : "",
                    ].join(" ")}
                  >
                    {"\u2190"} Back to Orders
                  </button>
                </aside>
              </div>
            </div>
          )}
        </div>
      </main>

      <CancelOrderModal
        isOpen={isCancelOpen}
        order={order}
        onClose={() => setIsCancelOpen(false)}
        onCancelled={async () => {
          setIsCancelOpen(false);
          await loadOrder();
          navigate("/my-orders");
        }}
      />
    </div>
  );
}
