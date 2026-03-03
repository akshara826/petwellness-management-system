import { motion } from "framer-motion";
import { useMemo, useState } from "react";
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
import {
  appointments,
  brunoHealth,
  orders,
  pets,
  products,
  quickActions,
  user,
  vaccines,
} from "../data/dashboardData";

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

const navItems = [
  { label: "Dashboard", icon: "\uD83C\uDFE0", to: "/user-dashboard", activeRoute: true, section: "MAIN" },
  { label: "My Pets", icon: "\uD83D\uDC36", to: "/pets", section: "MAIN" },
  { label: "Appointments", icon: "\uD83D\uDCC5", to: "/user-dashboard", badge: "2", badgeTone: "teal", section: "MAIN" },
  { label: "Vaccinations", icon: "\uD83D\uDC89", to: "/user-dashboard", badge: "1", badgeTone: "red", section: "MAIN" },
  { label: "Marketplace", icon: "\uD83D\uDED2", to: "/marketplace", section: "MORE" },
  { label: "My Orders", icon: "\uD83D\uDCE6", to: "/user-dashboard", section: "MORE" },
  { label: "Health Records", icon: "\uD83D\uDCCB", to: "/user-dashboard", section: "MORE" },
  { label: "Settings", icon: "\u2699\uFE0F", to: "/user-dashboard", section: "MORE" },
];

const statItems = [
  { icon: "\uD83D\uDC3E", value: "3", label: "Registered Pets", badge: "All Healthy", badgeTone: "green", iconBg: "bg-app-teal-light" },
  { icon: "\uD83D\uDCC5", value: "2", label: "Upcoming Appts", badge: "This Week", badgeTone: "yellow", iconBg: "bg-app-blue-light" },
  { icon: "\uD83D\uDC89", value: "1", label: "Vaccine Due", badge: "Overdue", badgeTone: "red", iconBg: "bg-app-red-light" },
  { icon: "\uD83D\uDCE6", value: "5", label: "Total Orders", badge: "1 In Transit", badgeTone: "blue", iconBg: "bg-app-green-light" },
];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-app-bg font-sans text-app-navy">
      <Sidebar user={owner} navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="px-4 pb-7 pt-5 md:ml-[260px] md:p-7">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5">
          <TopBar userName={owner.name} petsCount={pets.length} dateText={dateText} onOpenSidebar={() => setSidebarOpen(true)} />

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
                <HealthSummary health={brunoHealth} />
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
