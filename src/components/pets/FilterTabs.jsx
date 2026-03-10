const tabs = [
  { key: "all", label: "All Pets", emoji: "" },
  { key: "dog", label: "Dogs", emoji: "🐕" },
  { key: "cat", label: "Cats", emoji: "🐈" },
  { key: "other", label: "Others", emoji: "🐇" },
  { key: "due", label: "Attention Needed", emoji: "⚠️" },
];

function GridIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <rect x="2.5" y="2.5" width="5" height="5" rx="1.2" className="stroke-current" strokeWidth="1.6" />
      <rect x="12.5" y="2.5" width="5" height="5" rx="1.2" className="stroke-current" strokeWidth="1.6" />
      <rect x="2.5" y="12.5" width="5" height="5" rx="1.2" className="stroke-current" strokeWidth="1.6" />
      <rect x="12.5" y="12.5" width="5" height="5" rx="1.2" className="stroke-current" strokeWidth="1.6" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path d="M3 5.5h14M3 10h14M3 14.5h14" className="stroke-current" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export default function FilterTabs({ activeFilter, onChangeFilter, counts, viewMode, onChangeView }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-app-border bg-app-card p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChangeFilter(tab.key)}
              className={[
                "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold transition duration-200",
                isActive
                  ? "border-app-teal bg-app-teal text-white"
                  : "border-app-border bg-app-card text-app-slate hover:border-app-teal hover:text-app-teal-dark",
              ].join(" ")}
            >
              <span>{tab.emoji ? `${tab.emoji} ${tab.label}` : tab.label}</span>
              <span
                className={[
                  "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px]",
                  isActive ? "bg-white/30 text-white" : "bg-app-teal-light text-app-teal-dark",
                ].join(" ")}
              >
                {counts[tab.key] || 0}
              </span>
            </button>
          );
        })}
      </div>

      <div className="inline-flex w-fit rounded-full border border-app-border bg-app-card p-1">
        <button
          type="button"
          onClick={() => onChangeView("grid")}
          className={[
            "inline-flex h-8 w-9 items-center justify-center rounded-full text-app-slate transition",
            viewMode === "grid" ? "bg-app-teal text-white" : "hover:text-app-teal-dark",
          ].join(" ")}
          aria-label="Grid view"
        >
          <GridIcon />
        </button>
        <button
          type="button"
          onClick={() => onChangeView("list")}
          className={[
            "inline-flex h-8 w-9 items-center justify-center rounded-full text-app-slate transition",
            viewMode === "list" ? "bg-app-teal text-white" : "hover:text-app-teal-dark",
          ].join(" ")}
          aria-label="List view"
        >
          <ListIcon />
        </button>
      </div>
    </div>
  );
}
