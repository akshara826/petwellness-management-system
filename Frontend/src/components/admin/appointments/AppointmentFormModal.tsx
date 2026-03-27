import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type {
  AdminAppointment,
  AppointmentPayload,
  AppointmentStatus,
  AppointmentType,
} from "../../../api/services/adminAppointmentService";

type Props = {
  isOpen: boolean;
  mode: "create" | "edit";
  appointment: AdminAppointment | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: AppointmentPayload) => void;
};

type FormState = {
  appointmentDate: string;
  startTime: string;
  endTime: string;
  veterinarianName: string;
  appointmentType: AppointmentType | "";
  status: AppointmentStatus;
};

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

function initialForm(appointment: AdminAppointment | null): FormState {
  return {
    appointmentDate: appointment?.appointmentDate || "",
    startTime: appointment?.startTime?.slice(0, 5) || "",
    endTime: appointment?.endTime?.slice(0, 5) || "",
    veterinarianName: appointment?.veterinarianName || "",
    appointmentType: appointment?.appointmentType || "",
    status: appointment?.status || "AVAILABLE",
  };
}

export default function AppointmentFormModal({ isOpen, mode, appointment, loading, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<FormState>(initialForm(appointment));
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      setForm(initialForm(appointment));
      setTouched({});
    }
  }, [appointment, isOpen]);

  const errors = useMemo(() => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.appointmentDate || form.appointmentDate < todayValue()) next.appointmentDate = "Please select a future date";
    if (!form.startTime) next.startTime = "Start time is required";
    if (!form.endTime) next.endTime = "End time is required";
    if (form.startTime && form.endTime && form.endTime <= form.startTime) next.endTime = "End time must be after start time";
    if (!form.veterinarianName.trim()) next.veterinarianName = "Veterinarian name is required";
    if (!form.appointmentType) next.appointmentType = "Please select appointment type";
    return next;
  }, [form]);

  const inputClass = (error?: string) =>
    `w-full rounded-xl border px-3 py-2 text-sm outline-none ring-teal-300 focus:ring-2 ${error ? "border-rose-300 bg-rose-50/60" : "border-teal-200 bg-white"}`;

  const handleSubmit = () => {
    setTouched({
      appointmentDate: true,
      startTime: true,
      endTime: true,
      veterinarianName: true,
      appointmentType: true,
      status: true,
    });
    if (Object.keys(errors).length) return;
    onSubmit({
      appointmentDate: form.appointmentDate,
      startTime: form.startTime,
      endTime: form.endTime,
      veterinarianName: form.veterinarianName.trim(),
      appointmentType: form.appointmentType as AppointmentType,
      ...(mode === "edit" ? { status: form.status } : {}),
    });
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={loading ? undefined : onClose}>
          <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} className="w-full max-w-2xl rounded-2xl border border-teal-200 bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900">{mode === "create" ? "Create Appointment Slot" : "Edit Appointment Slot"}</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Appointment Date *</label>
                <input type="date" min={todayValue()} value={form.appointmentDate} onChange={(event) => setForm((prev) => ({ ...prev, appointmentDate: event.target.value }))} onBlur={() => setTouched((prev) => ({ ...prev, appointmentDate: true }))} className={inputClass(touched.appointmentDate ? errors.appointmentDate : "")} />
                {touched.appointmentDate && errors.appointmentDate ? <p className="mt-1 text-xs font-medium text-rose-600">{errors.appointmentDate}</p> : null}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Veterinarian Name *</label>
                <input type="text" value={form.veterinarianName} onChange={(event) => setForm((prev) => ({ ...prev, veterinarianName: event.target.value }))} onBlur={() => setTouched((prev) => ({ ...prev, veterinarianName: true }))} placeholder="e.g. Dr. Anika Sharma" className={inputClass(touched.veterinarianName ? errors.veterinarianName : "")} />
                {touched.veterinarianName && errors.veterinarianName ? <p className="mt-1 text-xs font-medium text-rose-600">{errors.veterinarianName}</p> : null}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Start Time *</label>
                <input type="time" value={form.startTime} onChange={(event) => setForm((prev) => ({ ...prev, startTime: event.target.value }))} onBlur={() => setTouched((prev) => ({ ...prev, startTime: true }))} className={inputClass(touched.startTime ? errors.startTime : "")} />
                {touched.startTime && errors.startTime ? <p className="mt-1 text-xs font-medium text-rose-600">{errors.startTime}</p> : null}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">End Time *</label>
                <input type="time" value={form.endTime} onChange={(event) => setForm((prev) => ({ ...prev, endTime: event.target.value }))} onBlur={() => setTouched((prev) => ({ ...prev, endTime: true }))} className={inputClass(touched.endTime ? errors.endTime : "")} />
                {touched.endTime && errors.endTime ? <p className="mt-1 text-xs font-medium text-rose-600">{errors.endTime}</p> : null}
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">Appointment Type *</label>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Online", value: "ONLINE", icon: "🖥️" },
                  { label: "Clinic", value: "CLINIC", icon: "🏥" },
                ].map((option) => {
                  const active = form.appointmentType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, appointmentType: option.value as AppointmentType }));
                        setTouched((prev) => ({ ...prev, appointmentType: true }));
                      }}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        active ? "border-teal-600 bg-teal-600 text-white shadow-md shadow-teal-200" : "border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:bg-teal-50"
                      }`}
                    >
                      <div className="text-lg">{option.icon}</div>
                      <p className="mt-2 text-sm font-semibold">{option.label}</p>
                    </button>
                  );
                })}
              </div>
              {touched.appointmentType && errors.appointmentType ? <p className="mt-1 text-xs font-medium text-rose-600">{errors.appointmentType}</p> : null}
            </div>

            {mode === "edit" ? (
              <div className="mt-4">
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Status</label>
                <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as AppointmentStatus }))} className={inputClass()}>
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="BOOKED">BOOKED</option>
                </select>
              </div>
            ) : null}

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={onClose} disabled={loading} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60">
                Cancel
              </button>
              <button type="button" onClick={handleSubmit} disabled={loading} className="rounded-full bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-400">
                {loading ? "Saving..." : mode === "create" ? "Save Slot" : "Update Slot"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
