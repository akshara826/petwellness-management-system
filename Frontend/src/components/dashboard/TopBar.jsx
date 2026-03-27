export default function TopBar({
  userName,
  petsCount,
  dateText,
  onOpenSidebar,
  variant = "dashboard",
  petsSearchValue = "",
  onPetsSearchChange,
  onPrimaryAction,
  addDisabled = false,
  addTooltip = "",
  title,
  subtitle,
  actions,
}) {
  if (variant === "pets") {
    return (
      <div className="rounded-2xl border border-app-border bg-app-card px-4 py-4 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={onOpenSidebar}
              className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-app-border bg-app-card text-app-navy md:hidden"
            >
              {"\u2630"}
            </button>
            <div>
              <h1 className="text-[22px] font-extrabold text-app-navy">
                {"\uD83D\uDC36"} My Pets
              </h1>
              <p className="mt-1 text-[13px] text-app-slate">Manage all your pet profiles in one place</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Search pets..."
              value={petsSearchValue}
              onChange={(event) => onPetsSearchChange?.(event.target.value)}
              className="h-10 w-full rounded-full border border-transparent bg-app-bg px-4 text-sm text-app-navy placeholder:text-app-slate focus:border-app-teal focus:outline-none sm:w-60"
            />
            <button
              type="button"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-app-border bg-app-card text-base text-app-navy"
            >
              {"\uD83D\uDD14"}
              <span className="absolute right-3 top-2 h-2 w-2 rounded-full bg-app-red" />
            </button>
            <button
              type="button"
              onClick={onPrimaryAction}
              disabled={addDisabled}
              title={addTooltip}
              className={[
                "inline-flex h-10 items-center rounded-full px-5 text-sm font-bold text-white shadow-sm transition duration-200",
                addDisabled
                  ? "cursor-not-allowed bg-slate-400"
                  : "bg-app-teal hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(45,212,160,0.35)]",
              ].join(" ")}
            >
              {"\uFF0B"} Add New Pet
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "page") {
    return (
      <div className="rounded-2xl border border-app-border bg-app-card px-4 py-4 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={onOpenSidebar}
              className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-app-border bg-app-card text-app-navy md:hidden"
            >
              {"\u2630"}
            </button>
            <div>
              <h1 className="text-[22px] font-extrabold text-app-navy">{title}</h1>
              <p className="mt-1 text-[13px] text-app-slate">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">{actions}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-app-border bg-app-card px-4 py-4 shadow-sm sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-app-border bg-app-card text-app-navy md:hidden"
          >
            {"\u2630"}
          </button>
          <div>
            <h1 className="text-2xl font-bold text-app-navy sm:text-3xl">
              Welcome, <span className="text-app-teal">{userName}</span> {"\uD83C\uDF3F"}
            </h1>
            <p className="mt-1 text-sm text-app-slate">
              {dateText} - {petsCount} pets registered
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search..."
            className="h-10 w-full rounded-full bg-app-bg px-4 text-sm text-app-navy placeholder:text-app-slate focus:outline-none sm:w-56"
          />
          <button type="button" className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-app-border bg-app-card text-base">
            {"\uD83D\uDD14"}
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-app-red" />
          </button>
          <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-app-teal text-sm font-bold text-white">
            {userName?.charAt(0)?.toUpperCase() || "P"}
          </button>
        </div>
      </div>
    </div>
  );
}
