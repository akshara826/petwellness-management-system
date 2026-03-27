import API from "../api";
import { getBookedAppointments, type AdminAppointment } from "./adminAppointmentService";
import { getAdminProducts } from "./adminProductService";
import type { AdminDashboardOverview, ActivityItem, AppointmentPoint, RegistrationPoint } from "../../types/adminDashboard";

type AdminUserRecord = {
  id: number;
  fullName?: string;
  email?: string;
  createdAt?: string;
  status?: "Pending" | "Approved";
};

function normalizeCount(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDate(value?: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

async function getPendingUsers(): Promise<AdminUserRecord[]> {
  const response = await API.get("/admin/pending-users", {
    params: { offset: 0, limit: 1000 },
  });

  return Array.isArray(response.data)
    ? response.data.map((item: any) => ({
        id: Number(item?.id || 0),
        fullName: item?.fullName || "",
        email: item?.email || "",
        createdAt: item?.createdAt || "",
        status: "Pending" as const,
      }))
    : [];
}

async function getApprovedUsers(): Promise<AdminUserRecord[]> {
  try {
    const response = await API.get("/admin/approved-users", {
      params: { offset: 0, limit: 1000 },
    });

    return Array.isArray(response.data)
      ? response.data.map((item: any) => ({
          id: Number(item?.id || 0),
          fullName: item?.fullName || "",
          email: item?.email || "",
          createdAt: item?.createdAt || "",
          status: "Approved" as const,
        }))
      : [];
  } catch (error) {
    const maybeStatus =
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      (error as { response?: { status?: number } }).response?.status;

    if (maybeStatus === 404) {
      return [];
    }

    throw error;
  }
}

function buildRegistrationTrend(users: AdminUserRecord[]): RegistrationPoint[] {
  const formatter = new Intl.DateTimeFormat("en-US", { month: "short" });
  const now = new Date();

  return Array.from({ length: 6 }, (_, index) => {
    const cursor = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const nextMonthStart = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);

    const count = users.filter((user) => {
      const createdAt = parseDate(user.createdAt);
      return createdAt ? createdAt < nextMonthStart : false;
    }).length;

    return {
      month: formatter.format(cursor),
      users: count,
    };
  });
}

function startOfWeek(date: Date) {
  const normalized = new Date(date);
  const day = normalized.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  normalized.setHours(0, 0, 0, 0);
  normalized.setDate(normalized.getDate() + diff);
  return normalized;
}

function buildWeeklyAppointments(appointments: AdminAppointment[]): AppointmentPoint[] {
  const now = new Date();
  const currentWeekStart = startOfWeek(now);
  const formatter = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" });

  return Array.from({ length: 6 }, (_, index) => {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(currentWeekStart.getDate() - (5 - index) * 7);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const count = appointments.filter((appointment) => {
      const date = parseDate(appointment.appointmentDate);
      if (!date) return false;
      return date >= weekStart && date <= weekEnd;
    }).length;

    return {
      week: formatter.format(weekStart),
      appointments: count,
    };
  });
}

function buildRecentActivities(
  users: AdminUserRecord[],
  appointments: AdminAppointment[],
  products: Awaited<ReturnType<typeof getAdminProducts>>
): ActivityItem[] {
  const userActivities = users
    .map((user) => {
      const createdAt = parseDate(user.createdAt);
      if (!createdAt) return null;

      return {
        id: `user-${user.id}`,
        text: `${user.status === "Approved" ? "Approved owner" : "Owner registered"}: ${user.fullName || user.email || `User #${user.id}`}`,
        time: createdAt.toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        tone: (user.status === "Approved" ? "success" : "info") as const,
        sortKey: createdAt.getTime(),
      };
    })
    .filter(Boolean);

  const appointmentActivities = appointments
    .map((appointment) => {
      const createdAt = parseDate(appointment.createdAt);
      if (!createdAt) return null;

      return {
        id: `appointment-${appointment.id}`,
        text: `Appointment booked with Dr. ${appointment.veterinarianName || "Unknown"}`,
        time: createdAt.toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        tone: "info" as const,
        sortKey: createdAt.getTime(),
      };
    })
    .filter(Boolean);

  const productActivities = products
    .map((product) => {
      const createdAt = parseDate(product.createdDate);
      if (!createdAt) return null;

      return {
        id: `product-${product.id}`,
        text: `Marketplace listing added: ${product.name || `Product #${product.id}`}`,
        time: createdAt.toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        tone: "success" as const,
        sortKey: createdAt.getTime(),
      };
    })
    .filter(Boolean);

  return [...userActivities, ...appointmentActivities, ...productActivities]
    .sort((a, b) => b.sortKey - a.sortKey)
    .slice(0, 8)
    .map(({ id, text, time, tone }) => ({ id, text, time, tone }));
}

async function buildFallbackOverview(): Promise<AdminDashboardOverview> {
  const [pendingUsers, approvedUsers, bookedAppointments, products] = await Promise.all([
    getPendingUsers(),
    getApprovedUsers(),
    getBookedAppointments(),
    getAdminProducts(),
  ]);

  const allUsers = [...approvedUsers, ...pendingUsers];

  return {
    totalRegisteredUsers: allUsers.length,
    pendingApprovalRequests: pendingUsers.length,
    appointmentsBooked: bookedAppointments.length,
    marketplaceListings: products.length,
    registrationTrend: buildRegistrationTrend(allUsers),
    weeklyAppointments: buildWeeklyAppointments(bookedAppointments),
    recentActivities: buildRecentActivities(allUsers, bookedAppointments, products),
  };
}

export async function getAdminDashboardOverview(): Promise<AdminDashboardOverview> {
  try {
    const response = await API.get("/admin/dashboard");
    const data = response.data || {};

    return {
      totalRegisteredUsers: normalizeCount(data.totalRegisteredUsers),
      pendingApprovalRequests: normalizeCount(data.pendingApprovalRequests),
      appointmentsBooked: normalizeCount(data.appointmentsBooked),
      marketplaceListings: normalizeCount(data.marketplaceListings),
      registrationTrend: Array.isArray(data.registrationTrend) ? data.registrationTrend : [],
      weeklyAppointments: Array.isArray(data.weeklyAppointments) ? data.weeklyAppointments : [],
      recentActivities: Array.isArray(data.recentActivities) ? data.recentActivities : [],
    };
  } catch (error) {
    const maybeStatus =
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      (error as { response?: { status?: number } }).response?.status;

    const maybeData =
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      (error as { response?: { data?: { message?: string } | string } }).response?.data;

    const maybeMessage =
      typeof maybeData === "string"
        ? maybeData
        : maybeData && typeof maybeData === "object" && typeof maybeData.message === "string"
        ? maybeData.message
        : error instanceof Error
        ? error.message
        : "";

    const missingDashboardEndpoint =
      maybeStatus === 404 ||
      /no static resource\s+api\/admin\/dashboard/i.test(maybeMessage) ||
      /\/api\/admin\/dashboard/i.test(maybeMessage);

    if (missingDashboardEndpoint) {
      return buildFallbackOverview();
    }

    throw error;
  }
}
