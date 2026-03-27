import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyOrders } from "../../api/services/orderService";
import Sidebar from "../../components/dashboard/Sidebar";
import TopBar from "../../components/dashboard/TopBar";
import { useToast } from "../../components/shared/Toast";
import CancelOrderModal from "../../components/user/orders/CancelOrderModal";
import OrderCard from "../../components/user/orders/OrderCard";

function getLoggedInName() {
  return localStorage.getItem("userName") || "Pet Parent";
}

function OrdersSkeleton() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-[#E2EBF0] bg-white shadow-[0_2px_8px_rgba(26,35,50,0.06)]">
      <div className="flex items-center justify-between border-b border-[#E2EBF0] px-[18px] py-4">
        <div className="space-y-2">
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="h-6 w-28 animate-pulse rounded-full bg-slate-200" />
      </div>
      <div className="space-y-3 px-[18px] py-[14px]">
        <div className="flex gap-2">
          <div className="h-6 w-24 animate-pulse rounded-full bg-slate-200" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
        </div>
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="border-t border-[#E2EBF0] px-[18px] py-3">
        <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await getMyOrders();
      const sorted = [...(Array.isArray(data) ? data : [])].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      setOrders(sorted);
    } catch (error) {
      showToast(error?.response?.data?.message || "Failed to load orders", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[#EBF4F8] text-[#1A2332]">
      <Sidebar user={owner} navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="px-4 pb-8 pt-5 md:ml-[260px] md:p-7">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5">
          <TopBar
            variant="page"
            title="My Orders"
            subtitle="Track and manage your recent purchases"
            onOpenSidebar={() => setSidebarOpen(true)}
            actions={null}
          />

          {isLoading ? (
            <section className="mx-auto flex w-full max-w-[800px] flex-col gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <OrdersSkeleton key={index} />
              ))}
            </section>
          ) : orders.length === 0 ? (
            <section className="rounded-[20px] border border-[#E2EBF0] bg-white px-6 py-16 text-center shadow-[0_2px_8px_rgba(26,35,50,0.06)]">
              <div className="text-[48px]">{"\uD83D\uDCE6"}</div>
              <h2 className="mt-3 text-[18px] font-extrabold text-[#1A2332]">No orders yet</h2>
              <p className="mt-2 text-sm text-[#6B7A8D]">Start shopping to place your first order</p>
              <button
                type="button"
                onClick={() => navigate("/marketplace")}
                className="mt-5 rounded-full bg-[#2DD4A0] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1BAF82]"
              >
                Browse Products
              </button>
            </section>
          ) : (
            <section className="mx-auto flex w-full max-w-[800px] flex-col gap-3">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onViewDetails={() => navigate(`/orders/${order.id}`)}
                  onCancel={() => setSelectedOrder(order)}
                />
              ))}
            </section>
          )}
        </div>
      </main>

      <CancelOrderModal
        isOpen={Boolean(selectedOrder)}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onCancelled={async () => {
          setSelectedOrder(null);
          await loadOrders();
        }}
      />
    </div>
  );
}
