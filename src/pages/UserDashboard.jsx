import { useMemo } from "react";
import { motion } from "framer-motion";

const sidebarItems = [
  { label: "Dashboard", icon: "🏠", active: true },
  { label: "My Pets", icon: "🐶" },
  { label: "Appointments", icon: "📅", badge: "2" },
  { label: "Vaccinations", icon: "💉", badge: "1" },
  { label: "Marketplace", icon: "🛒" },
  { label: "My Orders", icon: "📦" },
  { label: "Health Records", icon: "📋" },
  { label: "Settings", icon: "⚙️" },
];

const stats = [
  { icon: "🐾", value: "3", label: "Registered Pets", badge: "All Healthy", tone: "green" },
  { icon: "📅", value: "2", label: "Upcoming Appts", badge: "This Week", tone: "orange" },
  { icon: "💉", value: "1", label: "Vaccine Due", badge: "Overdue", tone: "rose" },
  { icon: "📦", value: "5", label: "Total Orders", badge: "1 In Transit", tone: "sky" },
];

const pets = [
  { name: "Bruno", meta: "Golden Retriever · 3 yrs", status: "Healthy", statusTone: "green", icon: "🐕", tone: "from-emerald-100 to-lime-100", active: true },
  { name: "Luna", meta: "Persian Cat · 2 yrs", status: "Vaccine Due", statusTone: "orange", icon: "🐈", tone: "from-amber-100 to-orange-100" },
  { name: "Coco", meta: "Holland Lop · 1 yr", status: "Healthy", statusTone: "green", icon: "🐇", tone: "from-pink-100 to-rose-100" },
];

const appointments = [
  { month: "Mar", day: "04", title: "General Checkup · Bruno", meta: "Dr. Anika Sharma · 10:30 AM", type: "Clinic", tone: "orange" },
  { month: "Mar", day: "08", title: "Dental Check · Luna", meta: "Dr. Raj Kumar · 3:00 PM", type: "Online", tone: "green" },
];

const vaccines = [
  { icon: "💉", name: "Rabies · Luna", date: "Was due Feb 10, 2026", tone: "rose", badge: "Overdue" },
  { icon: "🧬", name: "DHPP Booster · Bruno", date: "Due in 14 days", tone: "amber", badge: "Soon" },
  { icon: "🛡️", name: "Myxomatosis · Coco", date: "Due Apr 15, 2026", tone: "green", badge: "On Track" },
];

const products = [
  { icon: "🦴", name: "Dental Chews", price: "$9.99", tone: "bg-orange-100" },
  { icon: "🐱", name: "Cat Kibble", price: "$16.99", tone: "bg-amber-100" },
  { icon: "🧸", name: "Squeaky Toy", price: "$4.49", tone: "bg-emerald-100" },
  { icon: "💊", name: "Flea Drops", price: "$11.99", tone: "bg-rose-100" },
];

const orders = [
  { icon: "🦴", name: "Dental Chews × 2", date: "Feb 22, 2026", price: "$19.98", status: "Delivered", tone: "green" },
  { icon: "💊", name: "Flea Drops + Shampoo", date: "Feb 25, 2026", price: "$24.00", status: "In Transit", tone: "amber" },
];

const health = [
  { label: "Weight", value: "28 kg", width: "72%", tone: "bg-emerald-500" },
  { label: "Activity", value: "Good", width: "85%", tone: "bg-sky-500" },
  { label: "Vaccinations", value: "2/3", width: "66%", tone: "bg-amber-500" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

function toneClass(tone) {
  if (tone === "green") return "bg-emerald-100 text-emerald-700";
  if (tone === "orange") return "bg-orange-100 text-orange-700";
  if (tone === "rose") return "bg-rose-100 text-rose-700";
  if (tone === "sky") return "bg-sky-100 text-sky-700";
  if (tone === "amber") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") return {};
  try {
    const payload = token.split(".")[1];
    if (!payload) return {};
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalized));
  } catch {
    return {};
  }
}

function getDisplayName() {
  const manual = localStorage.getItem("userName");
  if (manual && manual.trim()) return manual.trim();

  const payload = decodeJwtPayload(localStorage.getItem("token"));
  const value =
    payload?.fullName ||
    payload?.name ||
    payload?.firstName ||
    payload?.username ||
    payload?.sub ||
    payload?.email ||
    "";

  if (!value) return "Pet Parent";
  if (value.includes("@")) return value.split("@")[0];
  return value;
}

export default function UserDashboard() {
  const userName = useMemo(() => getDisplayName(), []);
  const userInitial = useMemo(() => userName.trim().charAt(0).toUpperCase() || "P", [userName]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-br from-sky-100 via-emerald-50 to-rose-50 p-4 text-slate-800 sm:p-6"
    >
      <div className="mx-auto w-full max-w-[1700px] overflow-x-auto">
        <div className="grid min-w-[1100px] gap-5" style={{ gridTemplateColumns: "280px minmax(0, 1fr)" }}>
          <aside className="rounded-[28px] bg-slate-900 p-5 text-slate-200 shadow-xl shadow-slate-900/20">
            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-400 text-lg">🐾</div>
              <div>
                <p className="text-lg font-bold text-white">PawCare</p>
                <p className="text-xs text-slate-400">Owner Dashboard</p>
              </div>
            </div>

            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Main</p>
            <nav className="space-y-1.5">
              {sidebarItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={[
                    "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200",
                    item.active ? "bg-orange-400 text-white shadow-md shadow-orange-900/25" : "hover:bg-white/10 hover:text-white",
                  ].join(" ")}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="ml-auto rounded-full bg-amber-300 px-2 py-0.5 text-[10px] font-bold text-slate-800">{item.badge}</span>
                  ) : null}
                </button>
              ))}
            </nav>

            <div className="mt-8 border-t border-white/10 pt-4">
              <div className="flex items-center gap-3 rounded-xl px-2 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 font-semibold text-white">{userInitial}</div>
                <div>
                  <p className="text-sm font-semibold text-white">{userName}</p>
                  <p className="text-xs text-slate-400">Pet Owner</p>
                </div>
              </div>
            </div>
          </aside>

          <main className="min-w-0 rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-xl shadow-slate-200/60 backdrop-blur sm:p-6">
            <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                  Good morning, <span className="text-orange-500">{userName}</span>
                </h1>
                <p className="mt-1 text-sm text-slate-500">Saturday, February 28, 2026 · 3 pets registered</p>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-500 shadow-sm">
                  <span>🔍</span>
                  <span className="hidden sm:inline">Search anything...</span>
                </div>
                <button type="button" className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
                  🔔
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
                </button>
                <button type="button" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">👤</button>
              </div>
            </header>

            <motion.section variants={stagger} initial="hidden" animate="show" className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <motion.article
                  key={stat.label}
                  variants={fadeUp}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <div className="absolute -right-7 -top-7 h-20 w-20 rounded-full bg-slate-200/40" />
                  <div className="flex items-start gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${toneClass(stat.tone)}`}>{stat.icon}</div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                      <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                    </div>
                  </div>
                  <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${toneClass(stat.tone)}`}>{stat.badge}</span>
                </motion.article>
              ))}
            </motion.section>

            <motion.section variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }} className="mb-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">My Pets</h2>
                <button type="button" className="rounded-full border border-orange-200 px-3 py-1 text-xs font-semibold text-orange-600 transition hover:bg-orange-500 hover:text-white">
                  Manage All
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {pets.map((pet) => (
                  <motion.article
                    key={pet.name}
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.2 }}
                    className={`rounded-2xl bg-gradient-to-br ${pet.tone} p-4 ${pet.active ? "ring-2 ring-emerald-500/50" : ""}`}
                  >
                    <p className="text-3xl">{pet.icon}</p>
                    <p className="mt-2 font-bold text-slate-900">{pet.name}</p>
                    <p className="text-xs text-slate-600">{pet.meta}</p>
                    <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${toneClass(pet.statusTone)}`}>{pet.status}</span>
                  </motion.article>
                ))}
                <button
                  type="button"
                  className="flex min-h-[150px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-500 transition hover:border-emerald-400 hover:text-emerald-600"
                >
                  <span className="text-3xl">＋</span>
                  <span className="mt-1 text-sm font-semibold">Add Pet</span>
                </button>
              </div>
            </motion.section>

            <div className="grid gap-5 xl:grid-cols-2">
              <motion.section variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.15 }} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Upcoming Appointments</h3>
                  <button type="button" className="rounded-full border border-orange-200 px-3 py-1 text-xs font-semibold text-orange-600 transition hover:bg-orange-500 hover:text-white">
                    Book New
                  </button>
                </div>
                <div className="space-y-2.5">
                  {appointments.map((appt) => (
                    <article key={appt.title} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="w-11 rounded-lg border border-slate-200 bg-white py-1 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-orange-500">{appt.month}</p>
                        <p className="text-lg font-bold text-slate-900">{appt.day}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{appt.title}</p>
                        <p className="text-xs text-slate-500">{appt.meta}</p>
                      </div>
                      <span className={`ml-auto rounded-full px-2.5 py-1 text-[10px] font-bold ${toneClass(appt.tone)}`}>{appt.type}</span>
                    </article>
                  ))}
                </div>
              </motion.section>

              <motion.section variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Vaccine Reminders</h3>
                  <button type="button" className="rounded-full border border-orange-200 px-3 py-1 text-xs font-semibold text-orange-600 transition hover:bg-orange-500 hover:text-white">
                    View All
                  </button>
                </div>
                <div className="space-y-2.5">
                  {vaccines.map((vax) => (
                    <article key={vax.name} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <span className="text-xl">{vax.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{vax.name}</p>
                        <p className="text-xs text-slate-500">{vax.date}</p>
                      </div>
                      <span className={`ml-auto rounded-full px-2.5 py-1 text-[10px] font-bold ${toneClass(vax.tone)}`}>{vax.badge}</span>
                    </article>
                  ))}
                </div>
              </motion.section>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[2fr_1fr]">
              <div className="space-y-5">
                <motion.section variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.25 }} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">Shop Products</h3>
                    <button type="button" className="rounded-full border border-orange-200 px-3 py-1 text-xs font-semibold text-orange-600 transition hover:bg-orange-500 hover:text-white">
                      Marketplace
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {products.map((product) => (
                      <article key={product.name} className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className={`flex h-20 items-center justify-center text-4xl ${product.tone}`}>{product.icon}</div>
                        <div className="p-3">
                          <p className="text-xs font-semibold text-slate-800">{product.name}</p>
                          <div className="mt-1 flex items-center justify-between">
                            <p className="font-bold text-orange-600">{product.price}</p>
                            <button type="button" className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                              +
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </motion.section>

                <motion.section variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.3 }} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">Recent Orders</h3>
                    <button type="button" className="rounded-full border border-orange-200 px-3 py-1 text-xs font-semibold text-orange-600 transition hover:bg-orange-500 hover:text-white">
                      All Orders
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {orders.map((order) => (
                      <article key={order.name} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <span className="text-2xl">{order.icon}</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{order.name}</p>
                          <p className="text-xs text-slate-500">{order.date}</p>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="font-bold text-slate-900">{order.price}</p>
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${toneClass(order.tone)}`}>{order.status}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </motion.section>
              </div>

              <div className="space-y-5">
                <motion.section variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.35 }} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">Bruno's Health</h3>
                    <button type="button" className="rounded-full border border-orange-200 px-3 py-1 text-xs font-semibold text-orange-600 transition hover:bg-orange-500 hover:text-white">
                      Full Report
                    </button>
                  </div>
                  <div className="mb-3 text-center">
                    <p className="text-4xl">🐕</p>
                    <p className="mt-1 text-xs text-slate-500">Last check: Feb 15, 2026</p>
                  </div>
                  <div className="space-y-3">
                    {health.map((item) => (
                      <div key={item.label}>
                        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-600">
                          <span>{item.label}</span>
                          <span>{item.value}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className={`h-full rounded-full ${item.tone}`} style={{ width: item.width }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>

                <motion.section variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.4 }} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="mb-3 text-base font-bold text-slate-900">Quick Actions</h3>
                  <div className="space-y-2.5">
                    <button type="button" className="flex w-full items-center rounded-xl bg-orange-500 px-3.5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600">
                      <span className="mr-2">📅</span> Book Appointment <span className="ml-auto">→</span>
                    </button>
                    <button type="button" className="flex w-full items-center rounded-xl bg-emerald-100 px-3.5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-500 hover:text-white">
                      <span className="mr-2">🐾</span> Add New Pet <span className="ml-auto">→</span>
                    </button>
                    <button type="button" className="flex w-full items-center rounded-xl bg-amber-100 px-3.5 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-400 hover:text-slate-900">
                      <span className="mr-2">🛒</span> Shop Products <span className="ml-auto">→</span>
                    </button>
                  </div>
                </motion.section>
              </div>
            </div>
          </main>
        </div>
      </div>
    </motion.div>
  );
}
