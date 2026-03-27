import { NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { logoutUser } from "../../utils/logout";

function NavList({ items, onClose }) {
  const { cartItemCount = 0 } = useCart();

  return (
    <nav className="space-y-1.5">
      {items.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          onClick={onClose}
          className={({ isActive }) =>
            [
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-200",
              isActive && item.activeRoute
                ? "bg-app-teal text-white"
                : "text-app-slate hover:bg-app-teal-light hover:text-app-teal-dark",
            ].join(" ")
          }
        >
          <span className="relative text-base">
            {item.icon}
            {item.to === "/cart" && cartItemCount > 0 ? (
              <span className="absolute -right-3 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2DD4A0] px-1 text-[10px] font-bold leading-none text-white">
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            ) : null}
          </span>
          <span>{item.label}</span>
          {item.badge ? (
            <span
              className={[
                "ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold",
                item.badgeTone === "red" ? "bg-app-red text-white" : "bg-app-teal text-white",
              ].join(" ")}
            >
              {item.badge}
            </span>
          ) : null}
        </NavLink>
      ))}
    </nav>
  );
}

export default function Sidebar({ user, navItems, isOpen, onClose }) {
  const navigate = useNavigate();
  const { clearCartState } = useCart();
  const mainItems = navItems.filter((item) => item.section === "MAIN");
  const moreItems = navItems.filter((item) => item.section === "MORE");

  const handleLogout = () => {
    clearCartState();
    logoutUser();
    onClose?.();
    navigate("/", { replace: true });
  };

  return (
    <>
      <div
        className={[
          "fixed inset-0 z-40 bg-app-navy/30 transition-opacity md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={onClose}
      />

      <aside
        className={[
          "fixed left-0 top-0 z-50 h-screen w-[260px] border-r border-app-border bg-app-card px-4 py-5 transition-transform duration-200",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        <div className="mb-6 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-app-teal text-lg">{"\uD83D\uDC3E"}</div>
          <div>
            <p className="text-base font-bold text-app-navy">Pet Wellness</p>
            <p className="text-xs text-app-slate">Owner Dashboard</p>
          </div>
        </div>

        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-app-slate">MAIN</p>
        <NavList items={mainItems} onClose={onClose} />

        <div className="mt-4 border-t border-app-border pt-3">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-app-slate">MORE</p>
          <NavList items={moreItems} onClose={onClose} />
        </div>

        <div className="mt-5 border-t border-app-border pt-4">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-app-teal text-sm font-bold text-white">{user.avatar}</div>
            <div>
              <p className="text-sm font-semibold text-app-navy">{user.name}</p>
              <p className="text-xs text-app-slate">Pet Owner</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-app-border bg-white px-4 py-3 text-sm font-semibold text-app-navy transition hover:border-app-red hover:bg-app-red-light hover:text-app-red"
          >
            <span>{"\u21AA"}</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
