import { useEffect, useState } from "react";
import { cancelOrder } from "../../../api/services/orderService";
import { useToast } from "../../shared/Toast";

export default function CancelOrderModal({ isOpen, order, onClose, onCancelled }) {
  const { showToast } = useToast();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const itemCount = Array.isArray(order.items) ? order.items.length : 0;

  const handleCancel = async () => {
    setIsSubmitting(true);
    try {
      await cancelOrder(order.id, reason.trim());
      showToast("Order cancelled", "info");
      onCancelled?.();
    } catch (error) {
      showToast(error?.response?.data?.message || "Failed to cancel order", "error");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[#1A2332]/45 px-4 backdrop-blur-sm"
      onClick={isSubmitting ? undefined : onClose}
    >
      <div
        className="w-full max-w-[400px] rounded-[20px] border border-[#E2EBF0] bg-white p-6 shadow-[0_20px_50px_rgba(26,35,50,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FEE2E2] text-2xl">
          {"\uD83D\uDDD1\uFE0F"}
        </div>
        <h2 className="mt-4 text-center text-[18px] font-extrabold text-[#1A2332]">Cancel Order?</h2>
        <p className="mt-2 text-center text-[13px] leading-6 text-[#6B7A8D]">
          Are you sure you want to cancel Order #{order.id}?
        </p>

        <div className="mt-4 rounded-xl bg-[#EBF4F8] px-4 py-3">
          <p className="text-[13px] font-bold text-[#1A2332]">Order #{order.id}</p>
          <p className="mt-1 text-[12px] font-semibold text-[#1BAF82]">Rs {Number(order.totalAmount || 0).toFixed(2)}</p>
          <p className="mt-1 text-[11px] text-[#6B7A8D]">{itemCount} items</p>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-[11px] font-bold text-[#1A2332]">Reason (optional)</label>
          <textarea
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Why are you cancelling this order?"
            className="w-full rounded-xl border border-[#E2EBF0] bg-[#EBF4F8] px-[14px] py-[10px] text-[13px] text-[#1A2332] outline-none transition focus:border-[#2DD4A0] focus:bg-white focus:shadow-[0_0_0_3px_rgba(45,212,160,0.12)]"
          />
        </div>

        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-full bg-[#F87171] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#EF4444] disabled:cursor-not-allowed disabled:bg-[#FCA5A5]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Cancelling...
              </span>
            ) : (
              "Yes, Cancel Order"
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-full border border-[#E2EBF0] bg-white px-4 py-3 text-sm font-bold text-[#1A2332] transition hover:border-[#2DD4A0] hover:text-[#1BAF82] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Keep My Order
          </button>
        </div>
      </div>
    </div>
  );
}
