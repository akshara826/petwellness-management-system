import { useEffect, useMemo, useState } from "react";

export default function HealthSummary({ health }) {
  const [animateBars, setAnimateBars] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateBars(true), 80);
    return () => clearTimeout(timer);
  }, []);

  const bars = useMemo(
    () => [
      { ...health.weight, fill: "bg-gradient-to-r from-app-teal to-app-teal-dark" },
      { ...health.activity, fill: "bg-gradient-to-r from-app-teal to-app-teal-dark" },
      { ...health.vaccines, fill: "bg-gradient-to-r from-app-yellow to-[#F59E0B]" },
    ],
    [health]
  );

  return (
    <section className="rounded-2xl border border-app-border bg-app-card shadow-sm">
      <div className="flex items-center justify-between px-5 pb-0 pt-5">
        <h3 className="text-base font-bold text-app-navy">{health.petName}&apos;s Health</h3>
        <button
          type="button"
          className="rounded-full border border-app-teal px-3 py-1 text-xs font-bold text-app-teal transition duration-200 hover:bg-app-teal hover:text-white"
        >
          Full Report
        </button>
      </div>
      <div className="px-5 pb-5 pt-4">
        <div className="mb-4 text-center">
          <p className="text-5xl">{health.petIcon}</p>
          <p className="mt-1 text-xs text-app-slate">Last check: {health.lastCheck}</p>
        </div>

        <div className="space-y-3">
          {bars.map((bar) => (
            <div key={bar.label}>
              <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-app-slate">
                <span>{bar.label}</span>
                <span>{bar.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full border border-app-border bg-app-bg">
                <div
                  className={["h-full rounded-full transition-all duration-1000 ease-out", bar.fill].join(" ")}
                  style={{ width: animateBars ? `${bar.pct}%` : "0%" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
