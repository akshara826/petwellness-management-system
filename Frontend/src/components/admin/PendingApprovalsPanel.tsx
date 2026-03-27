import { AnimatePresence, motion } from "framer-motion";
import type { PendingApproval } from "../../types/adminDashboard";
import { CheckIcon, CloseIcon } from "./Icons";

type PendingApprovalsPanelProps = {
  approvals: PendingApproval[];
  loading: boolean;
  processingIds: number[];
  onApprove: (item: PendingApproval) => void;
  onReject: (item: PendingApproval) => void;
};

export default function PendingApprovalsPanel({
  approvals,
  loading,
  processingIds,
  onApprove,
  onReject,
}: PendingApprovalsPanelProps) {
  return (
    <section className="rounded-2xl border border-teal-100 bg-white p-4 shadow-md shadow-teal-100/60 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Pending Approval Requests</h2>
        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
          {approvals.length} pending
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-2 py-2">Name</th>
              <th className="px-2 py-2">Email</th>
              <th className="px-2 py-2">Role</th>
              <th className="px-2 py-2">Registration Date</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {approvals.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                  className="rounded-xl bg-teal-50/50 text-sm text-slate-700"
                >
                  <td className="rounded-l-xl px-2 py-3 font-semibold text-slate-900">{item.name}</td>
                  <td className="px-2 py-3">{item.email}</td>
                  <td className="px-2 py-3">{item.role}</td>
                  <td className="px-2 py-3">{item.registrationDate}</td>
                  <td className="px-2 py-3">
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                      {item.status}
                    </span>
                  </td>
                  <td className="rounded-r-xl px-2 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                        onClick={() => onApprove(item)}
                        disabled={processingIds.includes(item.id)}
                      >
                        <CheckIcon className="h-3.5 w-3.5" />
                        {processingIds.includes(item.id) ? "Working..." : "Approve"}
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                        onClick={() => onReject(item)}
                        disabled={processingIds.includes(item.id)}
                      >
                        <CloseIcon className="h-3.5 w-3.5" />
                        {processingIds.includes(item.id) ? "Working..." : "Reject"}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {loading ? (
        <p className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 px-4 py-6 text-center text-sm text-slate-600">
          Loading pending approvals...
        </p>
      ) : null}

      {!loading && approvals.length === 0 ? (
        <p className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 px-4 py-6 text-center text-sm text-slate-600">
          No pending approvals right now.
        </p>
      ) : null}
    </section>
  );
}
