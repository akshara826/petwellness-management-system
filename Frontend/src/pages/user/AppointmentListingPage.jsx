import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAvailableAppointments } from "../../api/services/appointmentService";
import Sidebar from "../../components/dashboard/Sidebar";
import TopBar from "../../components/dashboard/TopBar";
import { useToast } from "../../components/shared/Toast";
import AppointmentCard from "../../components/user/appointments/AppointmentCard";
import BookingModal from "../../components/user/appointments/BookingModal";

function getLoggedInName() {
  return localStorage.getItem("userName") || "Pet Parent";
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-[#E2EBF0] bg-white shadow-[0_2px_8px_rgba(26,35,50,0.06)]">
      <div className="h-24 animate-pulse bg-slate-200" />
      <div className="space-y-3 px-4 py-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="border-t border-[#E2EBF0] px-4 py-3">
        <div className="h-10 animate-pulse rounded-full bg-slate-200" />
      </div>
    </div>
  );
}

export default function AppointmentListingPage() {
  const { showToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const ownerName = useMemo(() => getLoggedInName(), []);
  const owner = useMemo(
    () => ({ name: ownerName, avatar: ownerName.charAt(0).toUpperCase() || "P" }),
    [ownerName]
  );

  const navItems = useMemo(
    () => [
      { label: "Dashboard", icon: "🏠", to: "/user-dashboard", section: "MAIN" },
      { label: "My Pets", icon: "🐶", to: "/pets", section: "MAIN" },
      { label: "Appointments", icon: "📅", to: "/appointments", activeRoute: true, section: "MAIN" },
      { label: "Marketplace", icon: "🛍️", to: "/marketplace", section: "MORE" },
      { label: "Cart", icon: "🛒", to: "/cart", section: "MORE" },
      { label: "My Orders", icon: "📦", to: "/my-orders", section: "MORE" },
    ],
    []
  );

  const loadAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAvailableAppointments({ offset: 0, limit: 20 });
      setAppointments(data);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAppointments();
  }, []);

  const filteredAppointments = useMemo(
    () =>
      appointments.filter((appointment) => {
        const dateMatch = !dateFilter || appointment.appointmentDate === dateFilter;
        const typeMatch = typeFilter === "ALL" || appointment.appointmentType === typeFilter;
        return dateMatch && typeMatch;
      }),
    [appointments, dateFilter, typeFilter]
  );

  const hasFilter = Boolean(dateFilter || typeFilter !== "ALL");

  return (
    <div className="min-h-screen bg-[#EBF4F8] text-[#1A2332]">
      <Sidebar user={owner} navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="px-4 pb-8 pt-5 md:ml-[260px] md:p-7">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5">
          <TopBar
            variant="page"
            title="Book an Appointment"
            subtitle="Schedule a vet consultation for your pet"
            onOpenSidebar={() => setSidebarOpen(true)}
            actions={
              <Link to="/my-appointments" className="text-sm font-bold text-[#1BAF82] transition hover:text-[#15956E]">
                My Appointments →
              </Link>
            }
          />

          <section className="rounded-[20px] border border-[#E2EBF0] bg-white px-5 py-4 shadow-[0_2px_8px_rgba(26,35,50,0.06)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-end">
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-[#1A2332]">Filter by Date</label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(event) => setDateFilter(event.target.value)}
                    className="rounded-xl border border-[#E2EBF0] bg-[#EBF4F8] px-3 py-2 text-sm outline-none transition focus:border-[#2DD4A0] focus:bg-white focus:shadow-[0_0_0_3px_rgba(45,212,160,0.12)]"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "All", value: "ALL" },
                    { label: "🖥️ Online", value: "ONLINE" },
                    { label: "🏥 Clinic", value: "CLINIC" },
                  ].map((option) => {
                    const active = typeFilter === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setTypeFilter(option.value)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          active ? "bg-[#2DD4A0] text-white" : "border border-[#E2EBF0] bg-white text-[#6B7A8D] hover:border-[#BFE7DB]"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {hasFilter ? (
                <button
                  type="button"
                  onClick={() => {
                    setDateFilter("");
                    setTypeFilter("ALL");
                  }}
                  className="text-sm font-bold text-[#1BAF82] transition hover:text-[#15956E]"
                >
                  Clear Filters
                </button>
              ) : null}
            </div>
          </section>

          {loading ? (
            <section className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </section>
          ) : error ? (
            <section className="rounded-[20px] border border-[#E2EBF0] bg-white px-6 py-10 text-center shadow-[0_2px_8px_rgba(26,35,50,0.06)]">
              <div className="text-4xl">😕</div>
              <p className="mt-3 text-sm font-semibold text-[#1A2332]">{error}</p>
              <button
                type="button"
                onClick={() => void loadAppointments()}
                className="mt-4 rounded-full bg-[#2DD4A0] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#1BAF82]"
              >
                Try Again
              </button>
            </section>
          ) : filteredAppointments.length === 0 ? (
            <section className="rounded-[20px] border border-[#E2EBF0] bg-white px-6 py-12 text-center shadow-[0_2px_8px_rgba(26,35,50,0.06)]">
              <div className="text-5xl">📅</div>
              <p className="mt-3 text-base font-bold text-[#1A2332]">No appointment slots available right now. Check back later.</p>
            </section>
          ) : (
            <section className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
              {filteredAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onBook={() => setSelectedAppointment(appointment)}
                />
              ))}
            </section>
          )}
        </div>
      </main>

      <BookingModal
        appointment={selectedAppointment}
        isOpen={Boolean(selectedAppointment)}
        onClose={() => setSelectedAppointment(null)}
        onBooked={(bookedAppointment) => {
          setAppointments((current) => current.filter((item) => item.id !== bookedAppointment.id));
        }}
      />
    </div>
  );
}
