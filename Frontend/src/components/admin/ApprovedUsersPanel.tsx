import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { ApprovedUser } from "../../types/adminDashboard";
import { CloseIcon } from "./Icons";

type ApprovedUsersPanelProps = {
  users: ApprovedUser[];
  loading: boolean;
  deletingId: number | null;
  onDelete: (user: ApprovedUser, reason: string) => void;
};

type DeleteDialogState = {
  user: ApprovedUser;
  enteredId: string;
  reason: string;
};

export default function ApprovedUsersPanel({
  users,
  loading,
  deletingId,
  onDelete,
}: ApprovedUsersPanelProps) {
  const [dialog, setDialog] = useState<DeleteDialogState | null>(null);

  const canDelete = useMemo(() => {
    if (!dialog) return false;
    return dialog.enteredId.trim() === String(dialog.user.id) && dialog.reason.trim().length > 2;
  }, [dialog]);

  return (
    <section className="rounded-2xl border border-teal-100 bg-white p-4 shadow-md shadow-teal-100/60 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Approved Users</h2>
        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
          {users.length} approved
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-2 py-2">User ID</th>
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
              {users.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className="rounded-xl bg-emerald-50/50 text-sm text-slate-700"
                >
                  <td className="rounded-l-xl px-2 py-3 font-semibold text-slate-900">#{user.id}</td>
                  <td className="px-2 py-3 font-medium text-slate-900">{user.name}</td>
                  <td className="px-2 py-3">{user.email}</td>
                  <td className="px-2 py-3">{user.role}</td>
                  <td className="px-2 py-3">{user.registrationDate}</td>
                  <td className="px-2 py-3">
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                      {user.status}
                    </span>
                  </td>
                  <td className="rounded-r-xl px-2 py-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                      onClick={() =>
                        setDialog({
                          user,
                          enteredId: "",
                          reason: "",
                        })
                      }
                      disabled={deletingId === user.id}
                    >
                      <CloseIcon className="h-3.5 w-3.5" />
                      {deletingId === user.id ? "Deleting..." : "Reject / Delete"}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {loading ? (
        <p className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 px-4 py-6 text-center text-sm text-slate-600">
          Loading approved users...
        </p>
      ) : null}

      {!loading && users.length === 0 ? (
        <p className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 px-4 py-6 text-center text-sm text-slate-600">
          No approved users yet.
        </p>
      ) : null}

      <AnimatePresence>
        {dialog ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-teal-200 bg-white p-5 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-slate-900">Delete Approved User</h3>
              <p className="mt-1 text-sm text-slate-600">
                Confirm deletion for <span className="font-semibold">{dialog.user.name}</span> (ID:
                {" "}
                {dialog.user.id}).
              </p>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                    Enter User ID to confirm
                  </label>
                  <input
                    type="text"
                    value={dialog.enteredId}
                    onChange={(event) => setDialog({ ...dialog, enteredId: event.target.value })}
                    placeholder={`Type ${dialog.user.id}`}
                    className="w-full rounded-xl border border-teal-200 px-3 py-2 text-sm outline-none ring-teal-300 focus:ring-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                    Reason for Deletion
                  </label>
                  <textarea
                    rows={4}
                    value={dialog.reason}
                    onChange={(event) => setDialog({ ...dialog, reason: event.target.value })}
                    placeholder="Write reason for removing this approved user..."
                    className="w-full rounded-xl border border-teal-200 px-3 py-2 text-sm outline-none ring-teal-300 focus:ring-2"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDialog(null)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!canDelete || deletingId === dialog.user.id}
                  onClick={() => {
                    onDelete(dialog.user, dialog.reason);
                    setDialog(null);
                  }}
                  className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
