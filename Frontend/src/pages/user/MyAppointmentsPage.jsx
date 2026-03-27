import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyAppointments } from "../../api/services/appointmentService";
import Sidebar from "../../components/dashboard/Sidebar";
import TopBar from "../../components/dashboard/TopBar";
import { useToast } from "../../components/shared/Toast";

function getLoggedInName() {
  return localStorage.getItem("userName") || "Pet Parent";
}

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

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(value) {
  if (!value) return "-";
  const [hour, minute] = String(value).split(":");
  const date = new Date();
  date.setHours(Number(hour || 0), Number(minute || 0), 0, 0);
  return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

const TYPE_BADGES = {
  ONLINE: "bg-[#D0F5EB] text-[#1BAF82]",
  CLINIC: "bg-[#DAEAF8] text-[#1E6FD9]",
};

const STATUS_BADGES = {
  AVAILABLE: "bg-[#D1FAE5] text-[#065F46]",
  BOOKED: "bg-[#FEF3C7] text-[#92400E]",
};

function SkeletonCard() {
  return (
    <div className="rounded-[20px] border border-[#E2EBF0] bg-white p-4 shadow-[0_2px_8px_rgba(26,35,50,0.06)]">
      <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-slate-200" />
      <div className="mt-2 h-4 w-2/5 animate-pulse rounded bg-slate-200" />
    </div>
  );
}

export default function MyAppointmentsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const ownerName = useMemo(() => getLoggedInName(), []);
  const owner = useMemo(
    () => ({ name: ownerName, avatar: ownerName.charAt(0).toUpperCase() || "P" }),
    [ownerName]
  );

  const navItems = useMemo(
    () => [
      { label: "Dashboard", icon: "🏠", to: "/user-dashboard", section: "MAIN" },
      { label: "My Pets", icon: "🐶", to: "/pets", section: "MAIN" },
      { label: "Appointments", icon: "📅", to: "/appointments", section: "MAIN" },
      { label: "Marketplace", icon: "🛍️", to: "/marketplace", section: "MORE" },
      { label: "Cart", icon: "🛒", to: "/cart", section: "MORE" },
      { label: "My Orders", icon: "📦", to: "/my-orders", section: "MORE" },
    ],
    []
  );

  useEffect(() => {
    let active = true;
    getMyAppointments()
      .then((data) => {
        if (!active) return;
        const sorted = [...data].sort(
          (a, b) =>
            new Date(`${b.appointmentDate}T${b.startTime || "00:00:00"}`).getTime() -
            new Date(`${a.appointmentDate}T${a.startTime || "00:00:00"}`).getTime()
        );
        setAppointments(sorted);
      })
      .catch((error) => {
        if (active) showToast(error?.response?.data?.message || "Failed to load appointments", "error");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [showToast]);

  return (
    <div className="min-h-screen bg-[#EBF4F8] text-[#1A2332]">
      <Sidebar user={owner} navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="px-4 pb-8 pt-5 md:ml-[260px] md:p-7">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5">
          <TopBar
            variant="page"
            title="My Appointments"
            subtitle="Your scheduled vet consultations"
            onOpenSidebar={() => setSidebarOpen(true)}
            actions={
              <Link
                to="/appointments"
                className="inline-flex items-center rounded-full bg-[#2DD4A0] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#1BAF82]"
              >
                Book New →
              </Link>
            }
          />

          {loading ? (
            <section className="mx-auto flex w-full max-w-[700px] flex-col gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </section>
          ) : appointments.length === 0 ? (
            <section className="rounded-[20px] border border-[#E2EBF0] bg-white px-6 py-16 text-center shadow-[0_2px_8px_rgba(26,35,50,0.06)]">
              <div className="text-[48px]">📅</div>
              <h2 className="mt-3 text-[18px] font-extrabold text-[#1A2332]">No appointments booked yet</h2>
              <p className="mt-2 text-sm text-[#6B7A8D]">Book your first vet consultation</p>
              <button
                type="button"
                onClick={() => navigate("/appointments")}
                className="mt-5 rounded-full bg-[#2DD4A0] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1BAF82]"
              >
                Browse Slots
              </button>
            </section>
          ) : (
            <section className="mx-auto flex w-full max-w-[700px] flex-col gap-3">
              {appointments.map((appointment) => (
                <article
                  key={appointment.id}
                  className="rounded-[20px] border border-[#E2EBF0] bg-white shadow-[0_2px_8px_rgba(26,35,50,0.06)]"
                >
                  <div className={`rounded-l-[20px] border-l-4 ${appointment.appointmentType === "ONLINE" ? "border-[#2DD4A0]" : "border-[#1E6FD9]"} px-[18px] py-4`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <p className="text-[14px] font-bold text-[#1A2332]">{formatDate(appointment.appointmentDate)}</p>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${TYPE_BADGES[appointment.appointmentType] || TYPE_BADGES.ONLINE}`}>
                        {appointment.appointmentType === "ONLINE" ? "🖥️ Online" : "🏥 Clinic"}
                      </span>
                    </div>

                    <p className="mt-1.5 text-[13px] text-[#6B7A8D]">🕐 {formatTime(appointment.startTime)} – {formatTime(appointment.endTime)}</p>
                    <p className="mt-1 text-[13px] text-[#6B7A8D]">👨‍⚕️ Dr. {appointment.veterinarianName}</p>

                    <div className="mt-[10px] flex flex-wrap items-center justify-between gap-3 border-t border-[#E2EBF0] pt-[10px]">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${STATUS_BADGES[appointment.status] || STATUS_BADGES.BOOKED}`}>
                        {appointment.status}
                      </span>
                      <span className="text-[10px] text-[#6B7A8D]">Booked on {formatDateTime(appointment.createdAt)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
