function buttonClass(type) {
  if (type === "primary") return "bg-app-teal text-white hover:bg-app-teal-dark";
  if (type === "secondary") return "bg-app-blue-light text-app-navy hover:bg-[#BFD9F5]";
  return "border border-app-border bg-app-bg text-app-slate hover:bg-[#E1EDF4]";
}

export default function QuickActions({ actions }) {
  return (
    <section className="rounded-2xl border border-app-border bg-app-card shadow-sm">
      <div className="px-5 pb-0 pt-5">
        <h3 className="text-base font-bold text-app-navy">Quick Actions</h3>
      </div>
      <div className="space-y-2.5 px-5 pb-5 pt-4">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            className={[
              "flex w-full items-center rounded-xl px-3.5 py-3 text-sm font-bold transition duration-200",
              buttonClass(action.type),
            ].join(" ")}
          >
            <span className="mr-2">{action.icon}</span>
            {action.label}
            <span className="ml-auto">{"\u2192"}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
