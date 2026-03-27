import { AnimatePresence, motion } from "framer-motion";
import type { AdminAppointment } from "../../../api/services/adminAppointmentService";

type Props = {
  isOpen: boolean;
  appointment: AdminAppointment | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteAppointmentModal({ isOpen, appointment, loading, onClose, onConfirm }: Props) {
  return (
    <AnimatePresence>
      {isOpen && appointment ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={loading ? undefined : onClose}>
          <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} className="w-full max-w-md rounded-2xl border border-teal-200 bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900">Delete this appointment slot?</h3>
            <div className="mt-4 rounded-2xl bg-teal-50/60 px-4 py-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">{appointment.appointmentDate}</p>
              <p className="mt-1">{appointment.startTime.slice(0, 5)} – {appointment.endTime.slice(0, 5)}</p>
              <p className="mt-1">Dr. {appointment.veterinarianName}</p>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={onClose} disabled={loading} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60">
                Cancel
              </button>
              <button type="button" onClick={onConfirm} disabled={loading} className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-400">
                {loading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
