import { useState } from "react";

function statusPill(status) {
  if (status === "healthy") return "bg-app-green-light text-[#065F46]";
  if (status === "vaccine-due") return "bg-app-yellow-light text-[#92400E]";
  return "bg-app-red-light text-app-red";
}

function vaxBadge(status) {
  if (status === "done") return "bg-app-green-light text-[#065F46]";
  if (status === "soon") return "bg-app-yellow-light text-[#92400E]";
  if (status === "overdue") return "bg-app-red-light text-app-red";
  return "bg-app-bg text-app-slate";
}

function statusLabel(status) {
  if (status === "done") return "✓ Done";
  if (status === "soon") return "⏰ Due Soon";
  if (status === "overdue") return "⚠ Overdue";
  return "Scheduled";
}

export default function PetDetailPanel({ pet, onClose, onEdit, onOpenMedical, onOpenVaccination, onDelete }) {
  const [tab, setTab] = useState("info");

  const doneCount = pet?.vaccinations?.filter((item) => item.status === "done").length || 0;
  const upcomingCount = pet?.vaccinations?.filter((item) => item.status === "soon" || item.status === "upcoming").length || 0;
  const overdueCount = pet?.vaccinations?.filter((item) => item.status === "overdue").length || 0;

  return (
    <>
      <div onClick={onClose} className={["fixed inset-0 z-[70] bg-app-navy/20 transition-opacity", pet ? "opacity-100" : "pointer-events-none opacity-0"].join(" ")} />

      <aside className={["fixed right-0 top-0 z-[75] h-full w-full max-w-[400px] border-l border-app-border bg-white shadow-xl transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]", pet ? "translate-x-0" : "translate-x-full"].join(" ")}>
        {pet ? (
          <div className="flex h-full flex-col">
            <div className="relative h-[200px] overflow-hidden">
              {pet.imageUrl ? (
                <>
                  <img src={pet.imageUrl} alt={pet.name} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-4 text-white">
                    <p className="text-xl font-extrabold">{pet.name}</p>
                    <p className="text-xs text-white/85">{pet.species} · {pet.breed}</p>
                  </div>
                </>
              ) : (
                <div className={["flex h-full items-center justify-center", pet.gradientClass].join(" ")}>📷</div>
              )}
              <button type="button" onClick={onEdit} className="absolute left-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/85">✏️</button>
              <button type="button" onClick={onClose} className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/85">✕</button>
            </div>

            <div className="flex border-b border-app-border">
              {["info", "medical", "vaccines"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  className={[
                    "flex-1 border-b-2 px-3 py-2 text-sm font-semibold capitalize transition",
                    tab === item ? "border-app-teal text-app-teal" : "border-transparent text-app-slate hover:text-app-navy",
                  ].join(" ")}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 animate-[fadeIn_0.15s_ease]">
              {tab === "info" ? (
                <div>
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-app-bg px-2.5 py-1 text-[11px] font-semibold text-app-slate">{pet.species}</span>
                    <span className="rounded-full bg-app-bg px-2.5 py-1 text-[11px] font-semibold text-app-slate">{pet.gender}</span>
                    <span className="rounded-full bg-app-bg px-2.5 py-1 text-[11px] font-semibold text-app-slate">{pet.dateOfBirth}</span>
                    <span className="rounded-full bg-app-bg px-2.5 py-1 text-[11px] font-semibold text-app-slate">{pet.weight} kg</span>
                    <span className={["rounded-full px-2.5 py-1 text-[11px] font-semibold", statusPill(pet.status)].join(" ")}>{pet.statusLabel}</span>
                  </div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-app-slate">Pet Details</p>
                  <div className="rounded-xl border border-app-border px-3">
                    {[
                      ["Species", pet.species],
                      ["Breed", pet.breed],
                      ["Gender", pet.gender],
                      ["Date of Birth", pet.dateOfBirth],
                      ["Weight", `${pet.weight} kg`],
                      ["Pet ID", pet.id],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between border-b border-app-border py-2 last:border-b-0">
                        <span className="text-xs font-semibold text-app-slate">{label}</span>
                        <span className="text-sm font-bold text-app-navy">{value}</span>
                      </div>
                    ))}
                  </div>

                  <p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-app-slate">Quick Stats</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-app-bg py-2 text-center">
                      <p className="text-[15px] font-extrabold text-app-navy">{pet.vetVisits}</p>
                      <p className="text-[10px] text-app-slate">Vet Visits</p>
                    </div>
                    <div className="rounded-xl bg-app-bg py-2 text-center">
                      <p className="text-[15px] font-extrabold text-app-navy">{pet.vaccines}</p>
                      <p className="text-[10px] text-app-slate">Vaccines</p>
                    </div>
                    <div className="rounded-xl bg-app-bg py-2 text-center">
                      <p className="text-[15px] font-extrabold text-app-navy">{pet.orders}</p>
                      <p className="text-[10px] text-app-slate">Orders</p>
                    </div>
                  </div>
                </div>
              ) : null}

              {tab === "medical" ? (
                <div>
                  <div className="space-y-2">
                    {pet.medicalHistory?.length ? (
                      pet.medicalHistory.map((item) => (
                        <div key={item.id} className="rounded-xl border-l-[3px] border-app-teal bg-white p-3 shadow-[0_1px_4px_rgba(26,35,50,0.06)]">
                          <p className="text-xs font-bold text-app-navy">{item.visitDate}</p>
                          <p className="text-xs text-app-slate">{item.doctorName}</p>
                          <p className="mt-1 text-sm font-semibold text-app-navy">{item.diagnosis}</p>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-app-slate">No medical records yet.</div>
                    )}
                  </div>
                  <button type="button" onClick={onOpenMedical} className="mt-3 w-full rounded-full border border-app-teal px-4 py-2 text-sm font-bold text-app-teal">＋ Add Record</button>
                </div>
              ) : null}

              {tab === "vaccines" ? (
                <div>
                  <div className="mb-3 grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-app-green-light px-2 py-2 text-center text-[11px] font-bold text-[#065F46]">✅ {doneCount}</div>
                    <div className="rounded-xl bg-app-yellow-light px-2 py-2 text-center text-[11px] font-bold text-[#92400E]">⏰ {upcomingCount}</div>
                    <div className="rounded-xl bg-app-red-light px-2 py-2 text-center text-[11px] font-bold text-app-red">⚠️ {overdueCount}</div>
                  </div>
                  <div className="space-y-2">
                    {pet.vaccinations?.length ? (
                      pet.vaccinations.map((item) => (
                        <div key={item.id} className="rounded-xl border border-app-border p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-app-navy">{item.name}</p>
                            <span className={["rounded-full px-2 py-0.5 text-[10px] font-bold", vaxBadge(item.status)].join(" ")}>{statusLabel(item.status)}</span>
                          </div>
                          <p className="text-xs text-app-slate">{item.date || "Not administered"} {item.nextDueDate ? `· Next ${item.nextDueDate}` : ""}</p>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-app-slate">No vaccination records yet.</div>
                    )}
                  </div>
                  <button type="button" onClick={onOpenVaccination} className="mt-3 w-full rounded-full border border-app-teal px-4 py-2 text-sm font-bold text-app-teal">＋ Add Vaccination</button>
                </div>
              ) : null}
            </div>

            <div className="space-y-2 border-t border-app-border p-4">
              <button type="button" className="w-full rounded-full bg-app-teal px-4 py-2.5 text-sm font-bold text-white">📅 Book Appointment</button>
              <button type="button" onClick={onDelete} className="w-full rounded-full border border-app-red bg-white px-4 py-2.5 text-sm font-bold text-app-red">🗑 Remove Pet</button>
            </div>
          </div>
        ) : null}
      </aside>
    </>
  );
}
