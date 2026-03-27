import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";
import type { AdminMetric } from "../../types/adminDashboard";
import { CalendarIcon, StoreIcon, UserCheckIcon } from "./Icons";

type StatsCardProps = {
  metric: AdminMetric;
};

function MetricIcon({ metricKey }: { metricKey: string }) {
  const className = "h-6 w-6";
  if (metricKey === "users") return <UserCheckIcon className={className} />;
  if (metricKey === "pending") return <UserCheckIcon className={className} />;
  if (metricKey === "appointments") return <CalendarIcon className={className} />;
  return <StoreIcon className={className} />;
}

export default function StatsCard({ metric }: StatsCardProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString("en-IN"));

  useEffect(() => {
    const controls = animate(count, metric.value, { duration: 1.2, ease: "easeOut" });
    return () => controls.stop();
  }, [count, metric.value]);

  return (
    <motion.article
      whileHover={{ scale: 1.03, y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="rounded-2xl border border-teal-100 bg-white p-4 shadow-md shadow-teal-100/60"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className={`rounded-xl bg-gradient-to-r ${metric.colorClass} p-2 text-white shadow-md`}>
          <MetricIcon metricKey={metric.key} />
        </div>
        <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700">Live</span>
      </div>

      <p className="text-sm font-medium text-slate-600">{metric.label}</p>
      <motion.p className="mt-2 text-2xl font-extrabold text-slate-900">{rounded}</motion.p>
    </motion.article>
  );
}
