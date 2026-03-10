import { motion } from "framer-motion";

function badgeClass(tone) {
  if (tone === "green") return "bg-app-green-light text-[#047857]";
  if (tone === "yellow") return "bg-app-yellow-light text-[#92400E]";
  if (tone === "red") return "bg-app-red-light text-[#B91C1C]";
  if (tone === "blue") return "bg-app-blue-light text-app-blue";
  return "bg-app-bg text-app-slate";
}

export default function StatsRow({ items }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <motion.article
          key={item.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: index * 0.1 }}
          whileHover={{ y: -3 }}
          className="rounded-2xl border border-app-border bg-app-card p-4 shadow-sm transition duration-200 hover:shadow-md"
        >
          <div className="flex items-start gap-3">
            <div className={[
              "flex h-12 w-12 items-center justify-center rounded-xl text-xl",
              item.iconBg,
            ].join(" ")}>
              {item.icon}
            </div>
            <div>
              <p className="text-[28px] font-bold leading-none text-app-navy">{item.value}</p>
              <p className="mt-1 text-xs font-medium text-app-slate">{item.label}</p>
            </div>
          </div>
          <span className={["mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold", badgeClass(item.badgeTone)].join(" ")}>
            {item.badge}
          </span>
        </motion.article>
      ))}
    </div>
  );
}
