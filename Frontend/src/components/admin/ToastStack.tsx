import { AnimatePresence, motion } from "framer-motion";
import type { ToastItem } from "../../types/adminDashboard";

type ToastStackProps = {
  toasts: ToastItem[];
};

export default function ToastStack({ toasts }: ToastStackProps) {
  return (
    <div className="fixed right-3 top-3 z-50 space-y-2 sm:right-6 sm:top-6">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            className={`min-w-64 rounded-xl border px-4 py-3 text-sm shadow-lg ${
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
