function badgeClass(status) {
  if (status === "Overdue") return "bg-app-red-light text-[#B91C1C]";
  if (status === "Soon") return "bg-app-yellow-light text-[#92400E]";
  return "bg-app-green-light text-[#047857]";
}

export default function VaccineReminders({ vaccines }) {
  return (
    <section className="rounded-2xl border border-app-border bg-app-card shadow-sm">
      <div className="flex items-center justify-between px-5 pb-0 pt-5">
        <h3 className="text-base font-bold text-app-navy">Vaccine Reminders</h3>
        <button
          type="button"
          className="rounded-full border border-app-teal px-3 py-1 text-xs font-bold text-app-teal transition duration-200 hover:bg-app-teal hover:text-white"
        >
          View All
        </button>
      </div>
      <div className="space-y-2.5 px-5 pb-5 pt-4">
        {vaccines.map((vax) => (
          <article key={vax.id} className="flex items-center gap-3 rounded-xl border border-app-border bg-app-bg p-3">
            <span className="text-xl">{vax.icon}</span>
            <div>
              <p className="text-[13px] font-bold text-app-navy">{vax.name} – {vax.pet}</p>
              <p className="text-[11px] text-app-slate">{vax.dueText}</p>
            </div>
            <span className={["ml-auto rounded-full px-2.5 py-1 text-[10px] font-bold", badgeClass(vax.status)].join(" ")}>
              {vax.status}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
