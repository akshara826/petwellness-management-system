import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../api/api";
import { getAdminDashboardOverview } from "../api/services/adminDashboardService";
import ActivityFeed from "../components/admin/ActivityFeed";
import ApprovedUsersPanel from "../components/admin/ApprovedUsersPanel";
import ChartsPanel from "../components/admin/ChartsPanel";
import PendingApprovalsPanel from "../components/admin/PendingApprovalsPanel";
import Sidebar from "../components/admin/Sidebar";
import StatsCard from "../components/admin/StatsCard";
import ToastStack from "../components/admin/ToastStack";
import TopNavbar from "../components/admin/TopNavbar";
import type {
  AdminDashboardOverview,
  AdminMetric,
  ApprovedUser,
  DashboardMenuKey,
  PendingApproval,
  ToastItem,
  ToastType,
} from "../types/adminDashboard";
import { logoutUser } from "../utils/logout";

type PendingUserApi = {
  id: number;
  email: string;
  fullName: string;
  createdAt?: string;
};

type ApprovedUserApi = {
  id: number;
  fullName: string;
  email: string;
  createdAt?: string;
};

const EMPTY_OVERVIEW: AdminDashboardOverview = {
  totalRegisteredUsers: 0,
  pendingApprovalRequests: 0,
  appointmentsBooked: 0,
  marketplaceListings: 0,
  registrationTrend: [],
  weeklyAppointments: [],
  recentActivities: [],
};

function formatRegistrationDate(value?: string) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const maybeResponse = error as { response?: { data?: { message?: string } | string } };
    const data = maybeResponse.response?.data;
    if (typeof data === "string" && data.trim()) {
      return data;
    }
    if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
      return data.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Request failed";
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionFromUrl = searchParams.get("section");
  const initialMenu: DashboardMenuKey = sectionFromUrl === "approvals" ? sectionFromUrl : "dashboard";
  const [selectedMenu, setSelectedMenu] = useState<DashboardMenuKey>(initialMenu);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<ApprovedUser[]>([]);
  const [loadingApprovals, setLoadingApprovals] = useState(true);
  const [loadingApprovedUsers, setLoadingApprovedUsers] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const [deletingApprovedUserId, setDeletingApprovedUserId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [dashboardOverview, setDashboardOverview] = useState<AdminDashboardOverview>(EMPTY_OVERVIEW);

  const metrics = useMemo(
    (): AdminMetric[] => [
      {
        key: "users",
        label: "Total Registered Users",
        value: dashboardOverview.totalRegisteredUsers,
        colorClass: "from-cyan-500 to-sky-600",
      },
      {
        key: "pending",
        label: "Pending Approval Requests",
        value: dashboardOverview.pendingApprovalRequests,
        colorClass: "from-amber-400 to-orange-500",
      },
      {
        key: "appointments",
        label: "Appointments Booked",
        value: dashboardOverview.appointmentsBooked,
        colorClass: "from-indigo-400 to-sky-600",
      },
      {
        key: "listings",
        label: "Marketplace Listings",
        value: dashboardOverview.marketplaceListings,
        colorClass: "from-teal-400 to-cyan-600",
      },
    ],
    [dashboardOverview]
  );

  const pushToast = (message: string, type: ToastType) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2500);
  };

  const loadAdminUsers = async () => {
    setLoadingApprovals(true);
    setLoadingApprovedUsers(true);
    try {
      const pendingRes = await API.get<PendingUserApi[]>("/admin/pending-users", {
        params: { offset: 0, limit: 1000 },
      });
      let approvedUsersFromApi: ApprovedUser[] = [];

      try {
        const approvedRes = await API.get<ApprovedUserApi[]>("/admin/approved-users", {
          params: { offset: 0, limit: 1000 },
        });
        approvedUsersFromApi = (approvedRes.data || []).map((user) => ({
          id: user.id,
          name: user.fullName,
          email: user.email,
          role: "Pet Owner",
          registrationDate: formatRegistrationDate(user.createdAt),
          status: "Approved",
        }));
      } catch (error) {
        // Backend returns 404 when no approved users exist; treat it as zero.
        const maybeStatus =
          typeof error === "object" &&
          error !== null &&
          "response" in error &&
          (error as { response?: { status?: number } }).response?.status;

        if (maybeStatus !== 404) {
          throw error;
        }
      }

      const mappedPending: PendingApproval[] = (pendingRes.data || []).map((user) => ({
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: "Pet Owner",
        registrationDate: formatRegistrationDate(user.createdAt),
        status: "Pending",
      }));

      setPendingApprovals(mappedPending);
      setApprovedUsers(approvedUsersFromApi);
    } catch (error) {
      pushToast(getErrorMessage(error), "error");
    } finally {
      setLoadingApprovals(false);
      setLoadingApprovedUsers(false);
    }
  };

  const loadDashboardOverview = async () => {
    setLoadingDashboard(true);
    try {
      const overview = await getAdminDashboardOverview();
      setDashboardOverview(overview);
    } catch (error) {
      pushToast(getErrorMessage(error), "error");
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    void loadAdminUsers();
    void loadDashboardOverview();
  }, []);

  useEffect(() => {
    const nextMenu: DashboardMenuKey = sectionFromUrl === "approvals" ? sectionFromUrl : "dashboard";
    setSelectedMenu(nextMenu);
  }, [sectionFromUrl]);

  const handleApprovalAction = async (item: PendingApproval, action: "approve" | "reject") => {
    setProcessingIds((prev) => [...prev, item.id]);
    try {
      if (action === "approve") {
        await API.post(`/admin/approve/${item.id}`);
      } else {
        await API.post(`/admin/reject/${item.id}`, {
          rejectionReason: "Rejected by administrator",
        });
      }

      setPendingApprovals((prev) => prev.filter((approval) => approval.id !== item.id));
      if (action === "approve") {
        setApprovedUsers((prev) => [
          {
            id: item.id,
            name: item.name,
            email: item.email,
            role: item.role,
            registrationDate: item.registrationDate,
            status: "Approved",
          },
          ...prev,
        ]);
        pushToast(`${item.name} approved successfully`, "success");
      } else {
        pushToast(`${item.name} rejected`, "error");
      }
      void loadDashboardOverview();
    } catch (error) {
      pushToast(getErrorMessage(error), "error");
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== item.id));
    }
  };

  const handleDeleteApprovedUser = async (user: ApprovedUser, reason: string) => {
    setDeletingApprovedUserId(user.id);
    try {
      await API.delete(`/admin/approved-users/${user.id}`, {
        data: { rejectionReason: reason },
      });
      setApprovedUsers((prev) => prev.filter((item) => item.id !== user.id));
      pushToast(`${user.name} deleted successfully`, "success");
      void loadDashboardOverview();
    } catch (error) {
      pushToast(getErrorMessage(error), "error");
    } finally {
      setDeletingApprovedUserId(null);
    }
  };

  const handleSidebarSelect = (key: DashboardMenuKey) => {
    if (key === "logout") {
      logoutUser();
      navigate("/", { replace: true });
      return;
    }

    setSelectedMenu(key);
    if (key === "dashboard" || key === "approvals") {
      setSearchParams({ section: key });
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#d9fdf2_0%,_#eff9ff_48%,_#f9fffe_100%)] text-slate-900">
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        selected={selectedMenu}
        onSelect={handleSidebarSelect}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div
        className={`min-h-screen transition-[margin] duration-300 ${
          sidebarCollapsed ? "lg:ml-[92px]" : "lg:ml-[270px]"
        }`}
      >
        <TopNavbar onOpenSidebar={() => setMobileSidebarOpen(true)} />

        <motion.main
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-5 px-4 py-5 sm:px-6"
        >
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <StatsCard key={metric.key} metric={metric} />
            ))}
          </section>

          {selectedMenu === "approvals" ? (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}>
              <ApprovedUsersPanel
                users={approvedUsers}
                loading={loadingApprovedUsers}
                deletingId={deletingApprovedUserId}
                onDelete={(user, reason) => void handleDeleteApprovedUser(user, reason)}
              />
            </motion.section>
          ) : (
            <>
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}>
                <PendingApprovalsPanel
                  approvals={pendingApprovals}
                  loading={loadingApprovals}
                  processingIds={processingIds}
                  onApprove={(item) => void handleApprovalAction(item, "approve")}
                  onReject={(item) => void handleApprovalAction(item, "reject")}
                />
              </motion.section>

              <ChartsPanel
                registrationTrend={dashboardOverview.registrationTrend}
                weeklyAppointments={dashboardOverview.weeklyAppointments}
                loading={loadingDashboard}
              />
              <ActivityFeed items={dashboardOverview.recentActivities} loading={loadingDashboard} />
            </>
          )}
        </motion.main>
      </div>

      <ToastStack toasts={toasts} />
    </div>
  );
}
