import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AppointmentPoint, RegistrationPoint } from "../../types/adminDashboard";

type ChartsPanelProps = {
  registrationTrend: RegistrationPoint[];
  weeklyAppointments: AppointmentPoint[];
  loading?: boolean;
};

export default function ChartsPanel({ registrationTrend, weeklyAppointments, loading = false }: ChartsPanelProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl border border-teal-100 bg-white p-4 shadow-md shadow-teal-100/60"
      >
        <h3 className="mb-3 text-base font-bold text-slate-900">User Registrations Over Time</h3>
        <div className="h-64 w-full">
          {loading ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-teal-200 bg-teal-50/60 text-sm text-slate-600">
              Loading chart...
            </div>
          ) : registrationTrend.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-teal-200 bg-teal-50/60 text-sm text-slate-600">
              No registration data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={registrationTrend}>
                <CartesianGrid strokeDasharray="4 4" stroke="#d1fae5" />
                <XAxis dataKey="month" stroke="#0f766e" />
                <YAxis stroke="#0f766e" allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#0284c7"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 1, fill: "#67e8f9" }}
                  activeDot={{ r: 6 }}
                  animationDuration={900}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.article>

      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="rounded-2xl border border-teal-100 bg-white p-4 shadow-md shadow-teal-100/60"
      >
        <h3 className="mb-3 text-base font-bold text-slate-900">Appointments Per Week</h3>
        <div className="h-64 w-full">
          {loading ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-teal-200 bg-teal-50/60 text-sm text-slate-600">
              Loading chart...
            </div>
          ) : weeklyAppointments.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-teal-200 bg-teal-50/60 text-sm text-slate-600">
              No appointment data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyAppointments}>
                <CartesianGrid strokeDasharray="4 4" stroke="#d1fae5" />
                <XAxis dataKey="week" stroke="#0f766e" />
                <YAxis stroke="#0f766e" allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="appointments" fill="#14b8a6" radius={[8, 8, 0, 0]} animationDuration={850} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.article>
    </section>
  );
}
