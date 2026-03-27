import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { AdminOrder } from "../../../api/services/adminOrderService";

type Props = {
  isOpen: boolean;
  order: AdminOrder | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

export default function AdminCancelOrderModal({ isOpen, order, loading, onClose, onConfirm }: Props) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setTouched(false);
    }
  }, [isOpen]);

  const error = useMemo(() => {
    if (!touched) return "";
    return reason.trim() ? "" : "Cancellation reason is required";
  }, [reason, touched]);

  const handleSubmit = () => {
    setTouched(true);
    if (!reason.trim()) return;
    onConfirm(reason.trim());
  };

  return (
    <AnimatePresence>
      {isOpen && order ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={loading ? undefined : onClose}>
          <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} className="w-full max-w-md rounded-2xl border border-teal-200 bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900">Cancel Order #{order.id}?</h3>
            <p className="mt-1 text-sm text-slate-600">Provide a reason before cancelling this order.</p>
            <div className="mt-4">
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Cancellation Reason</label>
              <textarea
                rows={4}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="Write the reason for cancelling this order..."
                className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ring-teal-300 focus:ring-2 ${error ? "border-rose-300 bg-rose-50/60" : "border-teal-200"}`}
              />
              {error ? <p className="mt-1 text-xs font-medium text-rose-600">{error}</p> : null}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={onClose} disabled={loading} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60">
                Close
              </button>
              <button type="button" onClick={handleSubmit} disabled={loading} className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-400">
                {loading ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
