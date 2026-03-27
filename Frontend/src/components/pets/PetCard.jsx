import { useState } from "react";

function statusClasses(status) {
  if (status === "healthy") return "bg-app-green-light text-[#065F46]";
  if (status === "vaccine-due") return "bg-app-yellow-light text-[#92400E]";
  return "bg-app-red-light text-[#991B1B]";
}

function calcAge(dateOfBirth) {
  if (!dateOfBirth) return "-";
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return "-";
  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();
  if (now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())) years -= 1;
  return years <= 0 ? "<1 yr" : `${years} yrs`;
}

export default function PetCard({
  pet,
  viewMode,
  index,
  onOpen,
  onEdit,
  onOpenMedical,
  onOpenVaccination,
  onDelete,
  onDownloadReport,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isList = viewMode === "list";
  const hasImage = Boolean(pet.imageUrl);
  const weightText = pet.weight ? `${pet.weight} kg` : "-";
  const ageText = calcAge(pet.dateOfBirth);

  return (
    <article
      className={[
        "group overflow-visible rounded-2xl border border-app-border bg-app-card shadow-sm transition duration-[220ms] hover:-translate-y-1 hover:shadow-md",
        isList ? "flex min-h-[320px]" : "",
        "opacity-0 animate-[fadeSlideUp_0.35s_ease_forwards]",
      ].join(" ")}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") onOpen();
        }}
        className={isList ? "flex w-full" : ""}
      >
        <header className={["relative h-[150px] overflow-hidden rounded-t-2xl", isList ? "w-[220px] shrink-0 rounded-l-2xl rounded-tr-none" : ""].join(" ")}>
          {hasImage ? (
            <>
              <img src={pet.imageUrl} alt={pet.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-[10px] left-[14px]">
                <p className="text-base font-extrabold text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]">{pet.name}</p>
                <p className="text-[11px] font-medium text-white/85">
                  {pet.species} · {pet.breed}
                </p>
              </div>
            </>
          ) : (
            <div className={["flex h-full items-center justify-center", pet.gradientClass].join(" ")}>
              <span className="text-[40px] text-app-slate">📷</span>
            </div>
          )}

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            className="absolute left-2 top-2 inline-flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white/85 text-base text-app-navy backdrop-blur transition hover:bg-white"
          >
            ⋯
          </button>

          {menuOpen ? (
            <div
              onClick={(event) => event.stopPropagation()}
              className="absolute left-2 top-8 z-50 min-w-[170px] overflow-hidden rounded-xl border border-app-border bg-app-card shadow-md"
            >
              <button type="button" onClick={() => { setMenuOpen(false); onEdit(); }} className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[13px] text-app-navy transition hover:bg-app-bg">
                ✏️ Edit Pet Profile
              </button>
              <button type="button" onClick={() => { setMenuOpen(false); onOpen(); }} className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[13px] text-app-navy transition hover:bg-app-bg">
                📋 View Full Records
              </button>
              <div className="h-px bg-app-border" />
              <button type="button" onClick={() => { setMenuOpen(false); onDelete(); }} className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[13px] text-app-red transition hover:bg-app-red-light">
                🗑 Delete Pet
              </button>
            </div>
          ) : null}

          <span className={["absolute right-[10px] top-[10px] rounded-full px-2.5 py-1 text-[10px] font-bold backdrop-blur", statusClasses(pet.status)].join(" ")}>
            {pet.statusLabel}
          </span>
        </header>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="px-[18px] pb-0 pt-4">
            {!hasImage ? (
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="truncate text-base font-extrabold text-app-navy">{pet.name}</h3>
                <span className="rounded-full bg-app-bg px-2 py-0.5 text-[10px] font-bold text-app-slate">#{pet.id}</span>
              </div>
            ) : null}

            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-app-bg px-3 py-1 text-[11px] font-semibold text-app-slate">🐾 {pet.species}</span>
              <span className="rounded-full bg-app-bg px-3 py-1 text-[11px] font-semibold text-app-slate">⚖️ {weightText}</span>
              <span className="rounded-full bg-app-bg px-3 py-1 text-[11px] font-semibold text-app-slate">🎂 {ageText}</span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-app-bg py-2 text-center">
                <p className="text-[15px] font-extrabold text-app-navy">{pet.vetVisits}</p>
                <p className="text-[10px] font-medium text-app-slate">Vet Visits</p>
              </div>
              <div className="rounded-xl bg-app-bg py-2 text-center">
                <p className="text-[15px] font-extrabold text-app-navy">{pet.vaccines}</p>
                <p className="text-[10px] font-medium text-app-slate">Vaccines</p>
              </div>
              <div className="rounded-xl bg-app-bg py-2 text-center">
                <p className="text-[15px] font-extrabold text-app-navy">{pet.orders}</p>
                <p className="text-[10px] font-medium text-app-slate">Orders</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-[18px] mt-3 h-px bg-app-border" />
      <div className="flex gap-2 px-[18px] pb-2 pt-3">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpenMedical();
          }}
          className="flex-1 rounded-xl border border-app-border bg-app-bg py-2 text-[11px] font-bold text-app-navy transition duration-200 hover:border-app-blue hover:bg-app-blue-light hover:text-app-blue"
        >
          📋 Medical History
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpenVaccination();
          }}
          className="flex-1 rounded-xl border border-app-border bg-app-bg py-2 text-[11px] font-bold text-app-navy transition duration-200 hover:border-app-teal hover:bg-app-teal-light hover:text-app-teal-dark"
        >
          💉 Vaccination
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onEdit();
          }}
          className="flex-1 rounded-xl bg-app-teal py-2 text-[11px] font-bold text-white transition duration-200 hover:bg-app-teal-dark"
        >
          ✏️ Edit
        </button>
      </div>
      <div className="px-[18px] pb-3">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDownloadReport();
          }}
          className="w-full rounded-xl border border-app-blue bg-app-blue-light py-2 text-[11px] font-bold text-app-blue transition duration-200 hover:bg-app-blue hover:text-white"
        >
          ⬇️ Download Health Report
        </button>
      </div>
    </article>
  );
}
