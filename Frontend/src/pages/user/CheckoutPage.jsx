import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkout } from "../../api/services/cartService";
import Sidebar from "../../components/dashboard/Sidebar";
import TopBar from "../../components/dashboard/TopBar";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../components/shared/Toast";

function getLoggedInName() {
  return localStorage.getItem("userName") || "Pet Parent";
}

function formatMoney(value) {
  return `₹${Number(value || 0).toFixed(2)}`;
}

function getFieldError(field, value) {
  if (field === "shippingAddress") {
    if (!value.trim()) return "Delivery address is required";
    if (value.length > 500) return "Address must be 500 characters or fewer";
    return "";
  }

  if (!value.trim()) return "Pincode is required";
  if (!/^\d{6}$/.test(value)) return "Pincode must be exactly 6 digits";
  return "";
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, fetchCart, clearCartState } = useCart();
  const { showToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [touched, setTouched] = useState({ shippingAddress: false, pincode: false });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const addressRef = useRef(null);
  const pincodeRef = useRef(null);

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
      { label: "Cart", icon: "🛒", to: "/cart", section: "MORE" },
      { label: "My Orders", icon: "📦", to: "/my-orders", section: "MORE" },
    ],
    []
  );

  useEffect(() => {
    let active = true;

    async function loadCart() {
      try {
        const nextCart = await fetchCart();
        if (!active) return;
        if (!nextCart?.items?.length) {
          navigate("/marketplace", { replace: true });
          return;
        }
      } catch (error) {
        if (!active) return;
        showToast(error.message || "Failed to load cart", "error");
        navigate("/marketplace", { replace: true });
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadCart();
    return () => {
      active = false;
    };
  }, [fetchCart, navigate, showToast]);

  const shippingError = getFieldError("shippingAddress", shippingAddress);
  const pincodeError = getFieldError("pincode", pincode);
  const visibleItems = cart.items.slice(0, 4);
  const remainingItems = Math.max(0, cart.items.length - 4);

  const markTouched = () => {
    setTouched({ shippingAddress: true, pincode: true });
  };

  const scrollToFirstInvalidField = () => {
    if (shippingError) {
      addressRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      addressRef.current?.focus();
      return;
    }

    if (pincodeError) {
      pincodeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      pincodeRef.current?.focus();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    markTouched();

    if (shippingError || pincodeError) {
      scrollToFirstInvalidField();
      return;
    }

    setIsPlacingOrder(true);
    try {
      const order = await checkout(shippingAddress.trim(), pincode);
      clearCartState();
      navigate(`/payment/${order.id}`);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to place order", "error");
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EBF4F8] text-[#1A2332]">
      <Sidebar user={owner} navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="px-4 pb-8 pt-5 md:ml-[260px] md:p-7">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5">
          <TopBar
            variant="page"
            title="Checkout"
            subtitle="Review your order and enter delivery details"
            onOpenSidebar={() => setSidebarOpen(true)}
            actions={null}
          />

          {isLoading ? (
            <div className="rounded-[20px] border border-[#E2EBF0] bg-white px-6 py-12 text-center shadow-[0_2px_8px_rgba(26,35,50,0.06)]">
              <p className="text-sm font-semibold text-[#6B7A8D]">Loading checkout...</p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <form
                onSubmit={handleSubmit}
                className="rounded-[20px] border border-[#E2EBF0] bg-white p-6 shadow-[0_2px_8px_rgba(26,35,50,0.06)]"
              >
                <h2 className="text-[16px] font-extrabold text-[#1A2332]">Shipping Details</h2>
                <p className="mt-2 text-xs text-[#6B7A8D]">Where should we deliver your order?</p>

                <div className="my-4 border-t border-[#E2EBF0]" />

                <div className="space-y-5">
                  <div>
                    <label className="mb-[5px] block text-[11px] font-bold text-[#1A2332]">Delivery Address *</label>
                    <textarea
                      ref={addressRef}
                      rows={4}
                      maxLength={500}
                      value={shippingAddress}
                      onChange={(event) => setShippingAddress(event.target.value)}
                      onBlur={() => setTouched((current) => ({ ...current, shippingAddress: true }))}
                      placeholder={"Enter your full delivery address including\nflat/house number, street, area, city..."}
                      className={[
                        "w-full resize-y rounded-xl border px-[14px] py-[10px] text-[13px] text-[#1A2332] outline-none transition",
                        touched.shippingAddress && shippingError
                          ? "border-[#F87171] bg-[#FFF8F8] shadow-[0_0_0_3px_rgba(248,113,113,0.1)]"
                          : "border-[#E2EBF0] bg-[#EBF4F8] focus:border-[#2DD4A0] focus:bg-white focus:shadow-[0_0_0_3px_rgba(45,212,160,0.12)]",
                      ].join(" ")}
                    />
                    <div className="mt-1 flex justify-end text-[10px] text-[#6B7A8D]">{shippingAddress.length}/500</div>
                    {touched.shippingAddress && shippingError ? (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-[#F87171]">⚠ {shippingError}</p>
                    ) : null}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#1A2332]">Pincode *</label>
                    <p className="mt-1 text-[10px] text-[#6B7A8D]">6-digit postal code</p>
                    <input
                      ref={pincodeRef}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={pincode}
                      onChange={(event) => setPincode(event.target.value.replace(/\D/g, ""))}
                      onBlur={() => setTouched((current) => ({ ...current, pincode: true }))}
                      placeholder="e.g. 560001"
                      className={[
                        "mt-2 w-full rounded-xl border px-[14px] py-[10px] text-[13px] text-[#1A2332] outline-none transition",
                        touched.pincode && pincodeError
                          ? "border-[#F87171] bg-[#FFF8F8] shadow-[0_0_0_3px_rgba(248,113,113,0.1)]"
                          : "border-[#E2EBF0] bg-[#EBF4F8] focus:border-[#2DD4A0] focus:bg-white focus:shadow-[0_0_0_3px_rgba(45,212,160,0.12)]",
                      ].join(" ")}
                    />
                    {touched.pincode && pincodeError ? (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-[#F87171]">⚠ {pincodeError}</p>
                    ) : null}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPlacingOrder}
                  className={[
                    "mt-5 inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-bold text-white transition",
                    isPlacingOrder
                      ? "cursor-not-allowed bg-[#A8E8D5]"
                      : "bg-[#2DD4A0] hover:bg-[#1BAF82] hover:shadow-[0_4px_14px_rgba(45,212,160,0.4)]",
                  ].join(" ")}
                >
                  {isPlacingOrder ? (
                    <span className="flex items-center gap-2">
                      <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Placing Order...
                    </span>
                  ) : (
                    "Place Order"
                  )}
                </button>
              </form>

              <aside className="rounded-[20px] border border-[#E2EBF0] bg-white px-6 py-5 shadow-[0_2px_8px_rgba(26,35,50,0.06)] lg:sticky lg:top-24 lg:self-start">
                <h2 className="text-[15px] font-extrabold text-[#1A2332]">Order Summary</h2>

                <div className="mt-4">
                  {visibleItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between border-b border-dashed border-[#E2EBF0] py-2"
                    >
                      <div className="pr-3">
                        <p className="text-[13px] font-semibold text-[#1A2332]">{item.productName}</p>
                        <p className="text-xs text-[#6B7A8D]">x{item.quantity}</p>
                      </div>
                      <p className="text-[13px] font-bold text-[#1A2332]">{formatMoney(item.price * item.quantity)}</p>
                    </div>
                  ))}
                  {remainingItems > 0 ? (
                    <p className="py-2 text-xs italic text-[#6B7A8D]">+ {remainingItems} more items</p>
                  ) : null}
                </div>

                <div className="my-3 border-t border-[#E2EBF0]" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#6B7A8D]">Subtotal</span>
                    <span className="text-[13px] font-bold text-[#1A2332]">{formatMoney(cart.totalAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#6B7A8D]">Shipping</span>
                    <span className="text-xs italic text-[#6B7A8D]">Calculated after order</span>
                  </div>
                </div>

                <div className="my-3 border-t border-[#E2EBF0]" />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#1A2332]">Total</span>
                  <span className="text-[18px] font-extrabold text-[#1A2332]">{formatMoney(cart.totalAmount)}</span>
                </div>

                <p className="mt-2 flex items-center gap-1 text-[11px] text-[#34D399]">✓ Secure checkout</p>
              </aside>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
