import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  createAppointment,
  deleteAppointment,
  getAllAppointments,
  type AdminAppointment,
  type AppointmentPayload,
  updateAppointment,
} from "../../api/services/adminAppointmentService";
import { PencilIcon, TrashIcon } from "../../components/admin/Icons";
import Sidebar from "../../components/admin/Sidebar";
import StatsCard from "../../components/admin/StatsCard";
import ToastStack from "../../components/admin/ToastStack";
import TopNavbar from "../../components/admin/TopNavbar";
import AppointmentFormModal from "../../components/admin/appointments/AppointmentFormModal";
import DeleteAppointmentModal from "../../components/admin/appointments/DeleteAppointmentModal";
import type { DashboardMenuKey, ToastItem } from "../../types/adminDashboard";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const data = (error as { response?: { data?: { message?: string } | string } }).response?.data;
    if (typeof data === "string" && data.trim()) return data;
    if (data && typeof data === "object" && typeof data.message === "string") return data.message;
  }
  return error instanceof Error ? error.message : "Request failed";
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function typeBadge(type: AdminAppointment["appointmentType"]) {
  return type === "ONLINE" ? "bg-teal-100 text-teal-700" : "bg-sky-100 text-sky-700";
}

function statusBadge(status: AdminAppointment["status"]) {
  return status === "AVAILABLE" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700";
}

export default function AdminAppointments() {
  type CombinedFilter = "ALL" | "AVAILABLE" | "BOOKED" | "ONLINE" | "CLINIC";
  const [selectedMenu, setSelectedMenu] = useState<DashboardMenuKey>("appointments");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<CombinedFilter>("ALL");
  const [selectedDate, setSelectedDate] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingAppointment, setEditingAppointment] = useState<AdminAppointment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminAppointment | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = (message: string, type: ToastItem["type"]) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 2500);
  };

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await getAllAppointments();
      setAppointments(data);
    } catch (error) {
      pushToast(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAppointments();
  }, []);

  const filteredAppointments = useMemo(
    () =>
      appointments.filter((appointment) => {
        const filterMatch =
          activeFilter === "ALL" ||
          appointment.status === activeFilter ||
          appointment.appointmentType === activeFilter;
        const dateMatch = !selectedDate || appointment.appointmentDate === selectedDate;
        return filterMatch && dateMatch;
      }),
    [activeFilter, appointments, selectedDate]
  );

  const metrics = useMemo(
    () => [
      { key: "appointments", label: "Total Slots", value: appointments.length, colorClass: "from-cyan-500 to-sky-600" },
      {
        key: "users",
        label: "Available",
        value: appointments.filter((appointment) => appointment.status === "AVAILABLE").length,
        colorClass: "from-emerald-400 to-teal-600",
      },
      {
        key: "pending",
        label: "Booked",
        value: appointments.filter((appointment) => appointment.status === "BOOKED").length,
        colorClass: "from-amber-400 to-orange-500",
      },
    ],
    [appointments]
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#d9fdf2_0%,_#eff9ff_48%,_#f9fffe_100%)] text-slate-900">
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        selected={selectedMenu}
        onSelect={setSelectedMenu}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className={`min-h-screen transition-[margin] duration-300 ${sidebarCollapsed ? "lg:ml-[92px]" : "lg:ml-[270px]"}`}>
        <TopNavbar onOpenSidebar={() => setMobileSidebarOpen(true)} />

        <motion.main initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-5 px-4 py-5 sm:px-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {metrics.map((metric) => (
              <StatsCard key={metric.label} metric={metric} />
            ))}
          </section>

          <section className="rounded-2xl border border-teal-100 bg-white p-4 shadow-md shadow-teal-100/60 sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap gap-2">
                  {["ALL", "AVAILABLE", "BOOKED", "ONLINE", "CLINIC"].map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setActiveFilter(filter as CombinedFilter)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        activeFilter === filter ? "bg-teal-600 text-white shadow-md shadow-teal-300/60" : "bg-teal-50 text-slate-700 hover:bg-teal-100"
                      }`}
                    >
                      {filter === "ALL"
                        ? "All"
                        : filter === "AVAILABLE"
                        ? "Available"
                        : filter === "BOOKED"
                        ? "Booked"
                        : filter === "ONLINE"
                        ? "Online"
                        : "Clinic"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="rounded-xl border border-teal-200 px-3 py-2 text-sm outline-none ring-teal-300 focus:ring-2"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormMode("create");
                    setEditingAppointment(null);
                    setFormOpen(true);
                  }}
                  className="rounded-full bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                >
                  + Create Slot
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-teal-100 bg-white p-4 shadow-md shadow-teal-100/60 sm:p-5">
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Time</th>
                    <th className="px-3 py-2">Vet Name</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index}>
                          {Array.from({ length: 7 }).map((__, cellIndex) => (
                            <td key={cellIndex} className="px-3 py-3">
                              <div className="h-4 animate-pulse rounded bg-slate-200" />
                            </td>
                          ))}
                        </tr>
                      ))
                    : filteredAppointments.map((appointment) => (
                        <tr key={appointment.id} className="rounded-xl bg-teal-50/50 text-sm text-slate-700">
                          <td className="rounded-l-xl px-3 py-3 font-semibold text-slate-900">#{appointment.id}</td>
                          <td className="px-3 py-3">{formatDate(appointment.appointmentDate)}</td>
                          <td className="px-3 py-3">
                            {appointment.startTime.slice(0, 5)} – {appointment.endTime.slice(0, 5)}
                          </td>
                          <td className="px-3 py-3">Dr. {appointment.veterinarianName}</td>
                          <td className="px-3 py-3">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${typeBadge(appointment.appointmentType)}`}>
                              {appointment.appointmentType}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </td>
                          <td className="rounded-r-xl px-3 py-3">
                            {appointment.status === "AVAILABLE" ? (
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormMode("edit");
                                    setEditingAppointment(appointment);
                                    setFormOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                                >
                                  <PencilIcon className="h-3.5 w-3.5" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget(appointment)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                                >
                                  <TrashIcon className="h-3.5 w-3.5" />
                                  Delete
                                </button>
                              </div>
                            ) : (
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">Booked</span>
                            )}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>

            {!loading && filteredAppointments.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-teal-200 bg-teal-50/60 px-4 py-6 text-center text-sm text-slate-600">
                No appointment slots found.
              </p>
            ) : null}
          </section>
        </motion.main>
      </div>

      <AppointmentFormModal
        isOpen={formOpen}
        mode={formMode}
        appointment={editingAppointment}
        loading={modalLoading}
        onClose={() => {
          if (modalLoading) return;
          setFormOpen(false);
          setEditingAppointment(null);
          setFormMode("create");
        }}
        onSubmit={async (data: AppointmentPayload) => {
          setModalLoading(true);
          try {
            if (formMode === "create") {
              await createAppointment(data);
              pushToast("Appointment slot created", "success");
            } else if (editingAppointment) {
              await updateAppointment(editingAppointment.id, data);
              pushToast("Appointment slot updated", "success");
            }
            setFormOpen(false);
            setEditingAppointment(null);
            setFormMode("create");
            await loadAppointments();
          } catch (error) {
            pushToast(getErrorMessage(error), "error");
          } finally {
            setModalLoading(false);
          }
        }}
      />

      <DeleteAppointmentModal
        isOpen={Boolean(deleteTarget)}
        appointment={deleteTarget}
        loading={modalLoading}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setModalLoading(true);
          try {
            await deleteAppointment(deleteTarget.id);
            pushToast("Appointment slot deleted", "success");
            setDeleteTarget(null);
            await loadAppointments();
          } catch (error) {
            pushToast(getErrorMessage(error), "error");
          } finally {
            setModalLoading(false);
          }
        }}
      />

      <ToastStack toasts={toasts} />
    </div>
  );
}
