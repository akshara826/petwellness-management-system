import type {
  ActivityItem,
  AdminMetric,
  AppointmentPoint,
  DashboardMenuItem,
  RegistrationPoint,
} from "../types/adminDashboard";

export const dashboardMenu: DashboardMenuItem[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "approvals", label: "Approvals" },
  { key: "pets", label: "Pets" },
  { key: "appointments", label: "Appointments" },
  { key: "marketplace", label: "Marketplace" },
  { key: "settings", label: "Settings" },
  { key: "logout", label: "Logout" },
];

export const adminMetrics: AdminMetric[] = [
  {
    key: "users",
    label: "Total Registered Users",
    value: 2384,
    colorClass: "from-cyan-500 to-sky-600",
  },
  {
    key: "pending",
    label: "Pending Approval Requests",
    value: 34,
    colorClass: "from-amber-400 to-orange-500",
  },
  {
    key: "pets",
    label: "Total Pets Registered",
    value: 1760,
    colorClass: "from-emerald-400 to-teal-600",
  },
  {
    key: "appointments",
    label: "Appointments Booked",
    value: 428,
    colorClass: "from-indigo-400 to-sky-600",
  },
  {
    key: "listings",
    label: "Marketplace Listings",
    value: 295,
    colorClass: "from-teal-400 to-cyan-600",
  },
];

export const registrationTrend: RegistrationPoint[] = [
  { month: "Aug", users: 120 },
  { month: "Sep", users: 168 },
  { month: "Oct", users: 215 },
  { month: "Nov", users: 242 },
  { month: "Dec", users: 286 },
  { month: "Jan", users: 312 },
  { month: "Feb", users: 355 },
];

export const weeklyAppointments: AppointmentPoint[] = [
  { week: "W1", appointments: 62 },
  { week: "W2", appointments: 78 },
  { week: "W3", appointments: 70 },
  { week: "W4", appointments: 95 },
  { week: "W5", appointments: 84 },
];

export const recentActivities: ActivityItem[] = [
  { id: "A-1", text: "New pet registered: Bruno (Golden Retriever)", time: "2 min ago", tone: "info" },
  { id: "A-2", text: "Appointment booked with Dr. Kavya Menon", time: "8 min ago", tone: "success" },
  { id: "A-3", text: "Marketplace product listed: Premium Cat Diet", time: "14 min ago", tone: "info" },
  { id: "A-4", text: "User approved: Aarya Sharma", time: "21 min ago", tone: "success" },
  { id: "A-5", text: "Vaccination reminder sent for Daisy", time: "31 min ago", tone: "warning" },
  { id: "A-6", text: "Appointment rescheduled by owner: Rahul Verma", time: "49 min ago", tone: "warning" },
];
