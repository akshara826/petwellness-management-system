import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import AppointmentCard from "../components/dashboard/AppointmentCard";
import HealthSummary from "../components/dashboard/HealthSummary";
import Marketplace from "../components/dashboard/Marketplace";
import MyPets from "../components/dashboard/MyPets";
import QuickActions from "../components/dashboard/QuickActions";
import RecentOrders from "../components/dashboard/RecentOrders";
import Sidebar from "../components/dashboard/Sidebar";
import StatsRow from "../components/dashboard/StatsRow";
import TopBar from "../components/dashboard/TopBar";
import VaccineReminders from "../components/dashboard/VaccineReminders";
import { orders, products, quickActions, user } from "../data/dashboardData";
import {
  fetchMyPets,
  fetchPetMedicalHistory,
  fetchPetVaccinations,
} from "../api/petsApi";

function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") return {};

  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return {};

    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalized));
  } catch {
    return {};
  }
}

function getLoggedInName() {
  const payload = decodeJwtPayload(localStorage.getItem("token"));
  const candidates = [
    localStorage.getItem("userName"),
    payload?.fullName,
    payload?.name,
    payload?.firstName,
    payload?.username,
    payload?.sub,
    payload?.email,
  ];

  const chosen = candidates.find((value) => typeof value === "string" && value.trim());
  if (!chosen) return user.name;

  const clean = chosen.trim();
  return clean.includes("@") ? clean.split("@")[0] : clean;
}

function gradientClass(index) {
  const classes = [
    "bg-gradient-to-br from-app-teal-light to-[#A7EDD8]",
    "bg-gradient-to-br from-app-blue-light to-[#B8D9F5]",
    "bg-gradient-to-br from-app-red-light to-[#FECACA]",
    "bg-gradient-to-br from-app-yellow-light to-[#FDE68A]",
    "bg-gradient-to-br from-app-purple-light to-[#D8B4FE]",
  ];
  return classes[index % classes.length];
}

function formatAge(dateOfBirth) {
  if (!dateOfBirth) return "-";
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return "-";
  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years <= 0) return `${months || 1} mo`;
  if (months <= 0) return `${years} yr`;
  return `${years}y ${months}m`;
}

function formatDate(dateText) {
  if (!dateText) return "-";
  const d = new Date(dateText);
  if (Number.isNaN(d.getTime())) return dateText;
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function monthDay(dateText) {
  const d = new Date(dateText);
  if (Number.isNaN(d.getTime())) return { month: "-", day: "--" };
  return {
    month: d.toLocaleDateString("en-US", { month: "short" }),
    day: d.toLocaleDateString("en-US", { day: "2-digit" }),
  };
}

function derivePetStatus(vaccinations) {
  const hasOverdue = vaccinations.some((v) => String(v.status || "").toLowerCase() === "overdue");
  if (hasOverdue) return { status: "\u26A0 Attention", statusType: "warning" };
  const hasDue = vaccinations.some((v) => ["soon", "upcoming"].includes(String(v.status || "").toLowerCase()));
  if (hasDue) return { status: "\u26A0 Vaccine Due", statusType: "warning" };
  return { status: "\u2713 Healthy", statusType: "healthy" };
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [healthSummary, setHealthSummary] = useState({
    petName: "Pet",
    petIcon: "\uD83D\uDC3E",
    lastCheck: "No record",
    weight: { label: "Weight", value: "-", pct: 0 },
    activity: { label: "Activity", value: "N/A", pct: 0 },
    vaccines: { label: "Vaccinations", value: "0/0", pct: 0 },
  });
  const [pageError, setPageError] = useState("");

  const ownerName = useMemo(() => getLoggedInName(), []);
  const owner = useMemo(
    () => ({
      name: ownerName,
      avatar: (ownerName?.charAt(0) || user.avatar).toUpperCase(),
    }),
    [ownerName]
  );

  const dateText = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "2-digit",
        year: "numeric",
      }),
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setPageError("");
        const basePets = await fetchMyPets();

        const hydrated = await Promise.all(
          basePets.map(async (pet, index) => {
            const [medicalHistory, petVaccinations] = await Promise.all([
              fetchPetMedicalHistory(pet.id),
              fetchPetVaccinations(pet.id),
            ]);
            const statusData = derivePetStatus(petVaccinations);
            return {
              ...pet,
              gradientClass: gradientClass(index),
              age: formatAge(pet.dateOfBirth),
              status: statusData.status,
              statusType: statusData.statusType,
              medicalHistory,
              vaccinations: petVaccinations,
            };
          })
        );

        const upcomingAppointments = [];

        const vaxReminders = hydrated
          .flatMap((pet) =>
            (pet.vaccinations || [])
              .filter((vax) => ["overdue", "soon", "upcoming"].includes(String(vax.status || "").toLowerCase()))
              .map((vax) => ({
                id: `${pet.id}-${vax.id}`,
                icon: "\uD83D\uDC89",
                name: vax.name || "Vaccine",
                pet: pet.name,
                dueText: vax.nextDueDate ? formatDate(vax.nextDueDate) : "Upcoming",
                status:
                  String(vax.status || "").toLowerCase() === "overdue"
                    ? "Overdue"
                    : String(vax.status || "").toLowerCase() === "soon"
                    ? "Soon"
                    : "On Track",
              }))
          )
          .slice(0, 5);

        const primaryPet = hydrated[0] || null;
        const completedVaccines = primaryPet
          ? primaryPet.vaccinations.filter((vax) => String(vax.status || "").toLowerCase() === "done").length
          : 0;
        const totalVaccines = primaryPet ? primaryPet.vaccinations.length : 0;
        const latestVisit = primaryPet?.medicalHistory?.[0]?.visitDate || null;

        if (cancelled) return;
        setPets(hydrated);
        setAppointments(upcomingAppointments);
        setVaccines(vaxReminders);
        setHealthSummary({
          petName: primaryPet?.name || "Pet",
          petIcon: primaryPet
            ? primaryPet.species?.toLowerCase() === "dog"
              ? "\uD83D\uDC15"
              : primaryPet.species?.toLowerCase() === "cat"
              ? "\uD83D\uDC08"
              : "\uD83D\uDC3E"
            : "\uD83D\uDC3E",
          lastCheck: latestVisit ? formatDate(latestVisit) : "No record",
          weight: {
            label: "Weight",
            value: primaryPet?.weight ? `${primaryPet.weight}kg` : "-",
            pct: primaryPet?.weight ? Math.min(100, Math.round(Number(primaryPet.weight) * 2.5)) : 0,
          },
          activity: {
            label: "Activity",
            value: primaryPet?.statusType === "healthy" ? "Good" : primaryPet ? "Needs Care" : "N/A",
            pct: primaryPet?.statusType === "healthy" ? 82 : primaryPet ? 58 : 0,
          },
          vaccines: {
            label: "Vaccinations",
            value: `${completedVaccines}/${totalVaccines}`,
            pct: totalVaccines ? Math.round((completedVaccines / totalVaccines) * 100) : 0,
          },
        });
      } catch (error) {
        if (cancelled) return;
        setPageError(error?.response?.data?.message || "Failed to load dashboard data.");
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  const dueVaccinesCount = useMemo(
    () => pets.filter((pet) => String(pet.statusType || "").toLowerCase() === "warning").length,
    [pets]
  );

  const statItems = useMemo(
    () => [
      {
        icon: "\uD83D\uDC3E",
        value: String(pets.length),
        label: "Registered Pets",
        badge: pets.length ? "Live from backend" : "No pets yet",
        badgeTone: pets.length ? "green" : "blue",
        iconBg: "bg-app-teal-light",
      },
      {
        icon: "\uD83D\uDCC5",
        value: String(appointments.length),
        label: "Upcoming Appts",
        badge: appointments.length ? "From checkup dates" : "No upcoming",
        badgeTone: appointments.length ? "yellow" : "blue",
        iconBg: "bg-app-blue-light",
      },
      {
        icon: "\uD83D\uDC89",
        value: String(dueVaccinesCount),
        label: "Vaccine Due",
        badge: dueVaccinesCount ? "Needs attention" : "All clear",
        badgeTone: dueVaccinesCount ? "red" : "green",
        iconBg: "bg-app-red-light",
      },
      {
        icon: "\uD83D\uDCE6",
        value: String(pets.reduce((sum, pet) => sum + Number(pet.orders || 0), 0)),
        label: "Total Orders",
        badge: "Based on available data",
        badgeTone: "blue",
        iconBg: "bg-app-green-light",
      },
    ],
    [appointments.length, dueVaccinesCount, pets]
  );

  const navItems = useMemo(
    () => [
      { label: "Dashboard", icon: "\uD83C\uDFE0", to: "/user-dashboard", activeRoute: true, section: "MAIN" },
      { label: "My Pets", icon: "\uD83D\uDC36", to: "/pets", section: "MAIN" },
      {
        label: "Appointments",
        icon: "\uD83D\uDCC5",
        to: "/user-dashboard",
        badge: String(appointments.length),
        badgeTone: "teal",
        section: "MAIN",
      },
      {
        label: "Vaccinations",
        icon: "\uD83D\uDC89",
        to: "/user-dashboard",
        badge: String(dueVaccinesCount),
        badgeTone: dueVaccinesCount ? "red" : "teal",
        section: "MAIN",
      },
      { label: "Marketplace", icon: "\uD83D\uDED2", to: "/marketplace", section: "MORE" },
      { label: "My Orders", icon: "\uD83D\uDCE6", to: "/user-dashboard", section: "MORE" },
      { label: "Health Records", icon: "\uD83D\uDCCB", to: "/user-dashboard", section: "MORE" },
      { label: "Settings", icon: "\u2699\uFE0F", to: "/user-dashboard", section: "MORE" },
    ],
    [appointments.length, dueVaccinesCount]
  );

  return (
    <div className="min-h-screen bg-app-bg font-sans text-app-navy">
      <Sidebar user={owner} navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="px-4 pb-7 pt-5 md:ml-[260px] md:p-7">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5">
          <TopBar userName={owner.name} petsCount={pets.length} dateText={dateText} onOpenSidebar={() => setSidebarOpen(true)} />

          {pageError ? (
            <div className="rounded-2xl border border-app-red bg-app-red-light px-4 py-3 text-sm font-semibold text-app-red">
              {pageError}
            </div>
          ) : null}

          <StatsRow items={statItems} />

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.2 }}>
            <MyPets pets={pets} />
          </motion.div>

          <div className="grid gap-5 xl:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.2 }}>
              <AppointmentCard appointments={appointments} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.2 }}>
              <VaccineReminders vaccines={vaccines} />
            </motion.div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
            <div className="space-y-5">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.2 }}>
                <Marketplace products={products} />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.2 }}>
                <RecentOrders orders={orders} />
              </motion.div>
            </div>

            <div className="space-y-5">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.2 }}>
                <HealthSummary health={healthSummary} />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.2 }}>
                <QuickActions actions={quickActions} />
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
