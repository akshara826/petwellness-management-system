function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "-";
  const [hour, minute] = String(value).split(":");
  const date = new Date();
  date.setHours(Number(hour || 0), Number(minute || 0), 0, 0);
  return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

const TYPE_STYLES = {
  ONLINE: {
    top: "bg-[#D0F5EB]",
    badge: "bg-[#B6EEDC] text-[#1BAF82]",
    label: "🖥️ Online",
  },
  CLINIC: {
    top: "bg-[#DAEAF8]",
    badge: "bg-[#CBE0F6] text-[#1E6FD9]",
    label: "🏥 Clinic",
  },
};

export default function AppointmentCard({ appointment, onBook }) {
  const typeConfig = TYPE_STYLES[appointment.appointmentType] || TYPE_STYLES.ONLINE;

  return (
    <article className="overflow-hidden rounded-[20px] border border-[#E2EBF0] bg-white shadow-[0_2px_8px_rgba(26,35,50,0.06)]">
      <div className={`relative px-[18px] py-4 ${typeConfig.top}`}>
        <span className={`absolute right-4 top-4 rounded-full px-3 py-1 text-[11px] font-bold ${typeConfig.badge}`}>
          {typeConfig.label}
        </span>
        <h3 className="pr-24 text-[16px] font-bold text-[#1A2332]">{formatDate(appointment.appointmentDate)}</h3>
      </div>

      <div className="px-[18px] py-[14px]">
        <p className="text-[14px] font-semibold text-[#1A2332]">
          🕐 {formatTime(appointment.startTime)} – {formatTime(appointment.endTime)}
        </p>
        <p className="mt-1.5 text-[13px] text-[#6B7A8D]">👨‍⚕️ Dr. {appointment.veterinarianName}</p>

        <div className="mt-[10px] border-t border-[#E2EBF0] pt-[10px]">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#D1FAE5] px-3 py-1 text-[12px] font-semibold text-[#065F46]">
            <span className="h-2 w-2 rounded-full bg-[#34D399]" />
            Available
          </span>
        </div>
      </div>

      <div className="border-t border-[#E2EBF0] px-[18px] py-3">
        <button
          type="button"
          onClick={onBook}
          className="inline-flex w-full items-center justify-center rounded-full bg-[#2DD4A0] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#1BAF82]"
        >
          Book Appointment
        </button>
      </div>
    </article>
  );
}
