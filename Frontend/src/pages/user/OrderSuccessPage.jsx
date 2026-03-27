import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOrderById } from "../../api/services/orderService";

function formatMoney(value) {
  return `₹${Number(value || 0).toFixed(2)}`;
}

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      try {
        const data = await getOrderById(orderId);
        if (!active) return;
        setOrder(data);
      } catch (err) {
        if (!active) return;
        setError(err?.response?.data?.message || "Could not load order details");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadOrder();
    return () => {
      active = false;
    };
  }, [orderId]);

  const previewItems = useMemo(() => order?.items?.slice(0, 3) || [], [order]);
  const extraCount = Math.max(0, (order?.items?.length || 0) - 3);

  return (
    <div className="min-h-screen bg-[#EBF4F8] px-4 py-8 text-[#1A2332]">
      <div className="mx-auto max-w-[560px]">
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#D0F5EB] border-t-[#2DD4A0]" />
            <p className="text-[13px] text-[#6B7A8D]">Loading your order...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <div className="text-4xl">😕</div>
            <p className="mt-3 text-sm font-semibold text-[#1A2332]">Could not load order details</p>
            <button
              type="button"
              onClick={() => navigate("/my-orders")}
              className="mt-5 rounded-full bg-[#2DD4A0] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1BAF82]"
            >
              View My Orders
            </button>
          </div>
        ) : (
          <>
            <div className="mx-auto flex h-[72px] w-[72px] animate-[scaleIn_0.4s_ease_forwards] items-center justify-center rounded-full bg-[#D1FAE5] text-[36px]">
              ✅
            </div>
            <h1 className="mt-6 text-center text-[24px] font-extrabold text-[#1A2332]">Order Placed Successfully!</h1>
            <p className="mx-auto mt-3 max-w-[400px] text-center text-[13px] leading-7 text-[#6B7A8D]">
              Your payment has been confirmed and your order is being processed.
            </p>

            <div className="mt-6 rounded-[20px] border border-[#E2EBF0] bg-white px-6 py-5 shadow-[0_2px_8px_rgba(26,35,50,0.06)]">
              <div className="flex items-center justify-between border-b border-dashed border-[#E2EBF0] py-[10px]">
                <span className="text-[13px] text-[#6B7A8D]">Order ID</span>
                <span className="text-[13px] font-bold text-[#2DD4A0]">#{order.id}</span>
              </div>
              <div className="flex items-center justify-between border-b border-dashed border-[#E2EBF0] py-[10px]">
                <span className="text-[13px] text-[#6B7A8D]">Status</span>
                <span className="rounded-full bg-[#D1FAE5] px-3 py-1 text-[12px] font-bold text-[#047857]">✓ Paid</span>
              </div>
              <div className="flex items-center justify-between border-b border-dashed border-[#E2EBF0] py-[10px]">
                <span className="text-[13px] text-[#6B7A8D]">Total</span>
                <span className="text-[13px] font-bold text-[#1A2332]">{formatMoney(order.totalAmount)}</span>
              </div>
              <div className="flex items-start justify-between border-b border-dashed border-[#E2EBF0] py-[10px]">
                <span className="pr-3 text-[13px] text-[#6B7A8D]">Deliver to</span>
                <span className="max-w-[240px] text-right text-[13px] text-[#6B7A8D]">{order.shippingAddress}</span>
              </div>

              <div className="my-1 border-t border-[#E2EBF0]" />
              <p className="mb-2 mt-3 text-[9px] font-bold uppercase tracking-[1px] text-[#6B7A8D]">Items</p>

              {previewItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-1.5">
                  <span className="pr-3 text-[12px] font-semibold text-[#1A2332]">
                    {item.productName} x{item.quantity}
                  </span>
                  <span className="text-[12px] font-bold text-[#1A2332]">
                    {formatMoney(Number(item.priceAtPurchase || 0) * Number(item.quantity || 0))}
                  </span>
                </div>
              ))}

              {extraCount > 0 ? <p className="mt-1 text-[11px] italic text-[#6B7A8D]">+ {extraCount} more items</p> : null}
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate(`/orders/${orderId}`)}
                className="rounded-full bg-[#2DD4A0] px-6 py-3 text-[13px] font-bold text-white transition hover:bg-[#1BAF82]"
              >
                📦 View Order Details
              </button>
              <button
                type="button"
                onClick={() => navigate("/marketplace")}
                className="rounded-full border border-[#E2EBF0] bg-white px-6 py-3 text-[13px] font-bold text-[#6B7A8D] transition hover:border-[#2DD4A0] hover:text-[#1BAF82]"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
