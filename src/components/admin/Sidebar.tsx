import { motion } from "framer-motion";
import { dashboardMenu } from "../../data/adminDashboardData";
import type { DashboardMenuKey } from "../../types/adminDashboard";
import {
  CalendarIcon,
  ChevronLeftIcon,
  DashboardIcon,
  LogoutIcon,
  PawIcon,
  SettingsIcon,
  StoreIcon,
  UserCheckIcon,
} from "./Icons";

type SidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  selected: DashboardMenuKey;
  onSelect: (key: DashboardMenuKey) => void;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
};

function getIcon(key: DashboardMenuKey) {
  const className = "h-5 w-5";
  if (key === "dashboard") return <DashboardIcon className={className} />;
  if (key === "approvals") return <UserCheckIcon className={className} />;
  if (key === "pets") return <PawIcon className={className} />;
  if (key === "appointments") return <CalendarIcon className={className} />;
  if (key === "marketplace") return <StoreIcon className={className} />;
  if (key === "settings") return <SettingsIcon className={className} />;
  return <LogoutIcon className={className} />;
}

export default function Sidebar({
  collapsed,
  mobileOpen,
  selected,
  onSelect,
  onToggleCollapse,
  onCloseMobile,
}: SidebarProps) {
  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={onCloseMobile}
        />
      ) : null}

      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? 92 : 270,
          x: mobileOpen ? 0 : -300,
        }}
        transition={{ type: "spring", stiffness: 220, damping: 25 }}
        className="fixed left-0 top-0 z-40 h-screen border-r border-teal-200/60 bg-gradient-to-b from-teal-50 via-cyan-50 to-white shadow-xl lg:!translate-x-0"
      >
        <div className="flex h-full flex-col px-3 py-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-sky-600 text-white">
                <PawIcon className="h-6 w-6" />
              </div>
              {!collapsed ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">PetCare</p>
                  <p className="text-sm font-bold text-slate-900">Admin Hub</p>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              className="hidden rounded-lg border border-teal-200 bg-white p-1 text-slate-600 hover:bg-teal-50 lg:block"
              onClick={onToggleCollapse}
              aria-label="Toggle sidebar width"
            >
              <motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
                <ChevronLeftIcon className="h-5 w-5" />
              </motion.div>
            </button>
          </div>

          <nav className="flex-1 space-y-1">
            {dashboardMenu.map((item) => {
              const active = selected === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    onSelect(item.key);
                    onCloseMobile();
                  }}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                    active
                      ? "bg-teal-600 text-white shadow-md shadow-teal-300/60"
                      : "text-slate-700 hover:bg-teal-100/70"
                  }`}
                >
                  {getIcon(item.key)}
                  {!collapsed ? <span className="font-medium">{item.label}</span> : null}
                </button>
              );
            })}
          </nav>
        </div>
      </motion.aside>
    </>
  );
}
