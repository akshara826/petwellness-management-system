import { motion } from "framer-motion";
import type { ActivityItem } from "../../types/adminDashboard";

type ActivityFeedProps = {
  items: ActivityItem[];
  loading?: boolean;
};

function toneClass(tone: "info" | "success" | "warning") {
  if (tone === "success") return "bg-emerald-500";
  if (tone === "warning") return "bg-amber-500";
  return "bg-sky-500";
}

export default function ActivityFeed({ items, loading = false }: ActivityFeedProps) {
  return (
    <section className="rounded-2xl border border-teal-100 bg-white p-4 shadow-md shadow-teal-100/60">
      <h3 className="mb-3 text-base font-bold text-slate-900">Recent Platform Activity</h3>

      <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
        {loading ? (
          <div className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 p-4 text-sm text-slate-600">
            Loading recent activity...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 p-4 text-sm text-slate-600">
            No recent activity available.
          </div>
        ) : (
          items.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="rounded-xl border border-teal-100 bg-teal-50/60 p-3"
            >
              <div className="flex items-start gap-2">
                <span className={`mt-1 h-2.5 w-2.5 rounded-full ${toneClass(item.tone)}`} />
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.text}</p>
                  <p className="text-xs text-slate-500">{item.time}</p>
                </div>
              </div>
            </motion.article>
          ))
        )}
      </div>
    </section>
  );
}
