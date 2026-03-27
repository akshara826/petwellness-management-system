function typeClass(type) {
  if (type === "Clinic") return "bg-app-blue-light text-app-blue";
  return "bg-app-teal-light text-app-teal-dark";
}

export default function AppointmentCard({ appointments }) {
  return (
    <section className="rounded-2xl border border-app-border bg-app-card shadow-sm">
      <div className="flex items-center justify-between px-5 pb-0 pt-5">
        <h3 className="text-base font-bold text-app-navy">Upcoming Appointments</h3>
        <button
          type="button"
          className="rounded-full border border-app-teal px-3 py-1 text-xs font-bold text-app-teal transition duration-200 hover:bg-app-teal hover:text-white"
        >
          Book New
        </button>
      </div>
      <div className="space-y-2.5 px-5 pb-5 pt-4">
        {appointments.map((appt) => (
          <article
            key={appt.id}
            className="flex items-center gap-3 rounded-xl border border-app-border bg-app-bg p-3 transition duration-200 hover:bg-app-teal-light"
          >
            <div className="w-12 rounded-xl border border-app-border bg-app-card py-1 text-center">
              <p className="text-[9px] font-bold uppercase tracking-wide text-app-teal">{appt.month}</p>
              <p className="text-2xl font-bold leading-none text-app-navy">{appt.day}</p>
            </div>
            <div>
              <p className="text-[13px] font-bold text-app-navy">{appt.title} – {appt.pet}</p>
              <p className="text-[11px] text-app-slate">{"\uD83C\uDFE5"} {appt.doctor} · {appt.time}</p>
            </div>
            <span className={["ml-auto rounded-full px-2.5 py-1 text-[10px] font-bold", typeClass(appt.type)].join(" ")}>
              {appt.type}
            </span>
          </article>
        ))}

        <article className="flex items-center gap-3 rounded-xl border border-dashed border-app-border bg-app-bg/70 p-3 text-app-slate opacity-70">
          <div className="w-12 rounded-xl border border-dashed border-app-border bg-app-card py-2 text-center">
            <p className="text-[9px] font-bold uppercase">-</p>
            <p className="text-xs font-bold">Free</p>
          </div>
          <div>
            <p className="text-[13px] font-bold">No more appointments</p>
          </div>
        </article>
      </div>
    </section>
  );
}
