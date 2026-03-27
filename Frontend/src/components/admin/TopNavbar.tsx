import { BellIcon, MenuIcon, SearchIcon } from "./Icons";

type TopNavbarProps = {
  onOpenSidebar: () => void;
};

export default function TopNavbar({ onOpenSidebar }: TopNavbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-teal-100 bg-white/85 px-4 py-3 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg border border-teal-200 bg-teal-50 p-2 text-teal-700 lg:hidden"
          onClick={onOpenSidebar}
          aria-label="Open menu"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search users, pets, appointments..."
            className="w-full rounded-xl border border-teal-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-700 outline-none ring-teal-300 transition focus:ring-2"
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            className="relative rounded-xl border border-teal-200 bg-white p-2 text-slate-600 hover:bg-teal-50"
            aria-label="Notifications"
          >
            <BellIcon className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-rose-500" />
          </button>

          <div className="rounded-xl border border-teal-200 bg-white px-3 py-2">
            <p className="text-sm font-semibold text-slate-900">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}
