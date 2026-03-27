import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../components/dashboard/Sidebar";
import TopBar from "../../components/dashboard/TopBar";
import CartItemRow from "../../components/user/cart/CartItemRow";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../components/shared/Toast";

function getLoggedInName() {
  return localStorage.getItem("userName") || "Pet Parent";
}

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, cartItemCount, fetchCart, isLoading, updateItem, removeItem } = useCart();
  const { showToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [busyItems, setBusyItems] = useState({});

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
      { label: "Dashboard", icon: "🏠", to: "/user-dashboard", section: "MAIN" },
      { label: "My Pets", icon: "🐶", to: "/pets", section: "MAIN" },
      { label: "Appointments", icon: "📅", to: "/appointments", section: "MAIN" },
      { label: "Marketplace", icon: "🛍️", to: "/marketplace", section: "MORE" },
      { label: "Cart", icon: "🛒", to: "/cart", activeRoute: true, section: "MORE" },
      { label: "My Orders", icon: "📦", to: "/my-orders", section: "MORE" },
    ],
    []
  );

  useEffect(() => {
    fetchCart().catch((error) => showToast(error.message || "Failed to load cart.", "error"));
  }, [fetchCart, showToast]);

  const hasOutOfStockItems = useMemo(
    () => cart.items.some((item) => item.status === "OUT_OF_STOCK"),
    [cart.items]
  );

  const setItemBusy = (itemId, value) => {
    setBusyItems((current) => ({ ...current, [itemId]: value }));
  };

  const handleIncrease = async (item) => {
    setItemBusy(item.id, true);
    try {
      await updateItem(item.id, item.quantity + 1);
    } catch (error) {
      showToast(error.message || "Failed to update cart.", "error");
    } finally {
      setItemBusy(item.id, false);
    }
  };

  const handleDecrease = async (item) => {
    setItemBusy(item.id, true);
    try {
      if (item.quantity <= 1) {
        await removeItem(item.id);
        showToast("Item removed", "info");
      } else {
        await updateItem(item.id, item.quantity - 1);
      }
    } catch (error) {
      showToast(error.message || "Failed to update cart.", "error");
    } finally {
      setItemBusy(item.id, false);
    }
  };

  const handleRemove = async (item) => {
    setItemBusy(item.id, true);
    try {
      await removeItem(item.id);
      showToast("Item removed", "info");
    } catch (error) {
      showToast(error.message || "Failed to remove item.", "error");
    } finally {
      setItemBusy(item.id, false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EBF4F8] text-[#1A2332]">
      <Sidebar user={owner} navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="px-4 pb-8 pt-5 md:ml-[260px] md:p-7">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5">
          <TopBar
            variant="page"
            title="Cart"
            subtitle="Review the products you're about to order"
            onOpenSidebar={() => setSidebarOpen(true)}
            actions={
              <Link
                to="/marketplace"
                className="inline-flex items-center rounded-full border border-[#E2EBF0] bg-white px-5 py-2.5 text-sm font-bold text-[#1A2332] shadow-[0_2px_8px_rgba(26,35,50,0.06)] transition hover:border-[#2DD4A0] hover:text-[#1BAF82]"
              >
                Continue Shopping
              </Link>
            }
          />

          {isLoading ? (
            <section className="rounded-[20px] border border-[#E2EBF0] bg-white px-6 py-10 text-center shadow-[0_2px_8px_rgba(26,35,50,0.06)]">
              <p className="text-sm font-semibold text-[#6B7A8D]">Loading your cart...</p>
            </section>
          ) : cart.items.length === 0 ? (
            <section className="rounded-[20px] border border-[#E2EBF0] bg-white px-6 py-12 text-center shadow-[0_2px_8px_rgba(26,35,50,0.06)]">
              <div className="text-5xl">🛒</div>
              <h2 className="mt-4 text-xl font-extrabold text-[#1A2332]">Your cart is empty</h2>
              <button
                type="button"
                onClick={() => navigate("/marketplace")}
                className="mt-5 rounded-full bg-[#2DD4A0] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1BAF82]"
              >
                Shop Now
              </button>
            </section>
          ) : (
            <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="rounded-[20px] border border-[#E2EBF0] bg-white shadow-[0_2px_8px_rgba(26,35,50,0.06)]">
                <div className="border-b border-[#E2EBF0] px-5 py-4">
                  <h2 className="text-base font-extrabold text-[#1A2332]">Cart ({cartItemCount} items)</h2>
                </div>
                {cart.items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    isBusy={Boolean(busyItems[item.id])}
                    onIncrease={() => handleIncrease(item)}
                    onDecrease={() => handleDecrease(item)}
                    onRemove={() => handleRemove(item)}
                  />
                ))}
              </div>

              <div className="rounded-[20px] border border-[#E2EBF0] bg-white p-5 shadow-[0_2px_8px_rgba(26,35,50,0.06)] lg:sticky lg:top-24 lg:self-start">
                <h2 className="text-base font-extrabold text-[#1A2332]">Order Summary</h2>
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7A8D]">Subtotal</span>
                    <span className="font-semibold text-[#1A2332]">₹{cart.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7A8D]">Shipping</span>
                    <span className="italic text-[#6B7A8D]">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-[#E2EBF0]" />
                  <div className="flex items-center justify-between text-base font-extrabold text-[#1A2332]">
                    <span>Total</span>
                    <span>₹{cart.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {hasOutOfStockItems ? (
                  <div className="mt-5 rounded-2xl bg-[#FFF7ED] px-4 py-3 text-sm font-medium text-[#9A3412]">
                    ⚠ Remove out-of-stock items to continue
                  </div>
                ) : null}

                <div className="mt-5 space-y-3">
                  <button
                    type="button"
                    onClick={() => navigate("/checkout")}
                    disabled={hasOutOfStockItems}
                    className={[
                      "inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-bold text-white transition",
                      hasOutOfStockItems ? "cursor-not-allowed bg-slate-300" : "bg-[#2DD4A0] hover:bg-[#1BAF82]",
                    ].join(" ")}
                  >
                    Proceed to Checkout
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/marketplace")}
                    className="inline-flex w-full items-center justify-center rounded-full border border-[#E2EBF0] px-4 py-3 text-sm font-bold text-[#1A2332] transition hover:border-[#2DD4A0] hover:text-[#1BAF82]"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
