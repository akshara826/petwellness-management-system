import { useEffect, useMemo, useState } from "react";

function SectionLabel({ text }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-[1.2px] text-app-slate">{text}</span>
      <span className="h-px flex-1 bg-app-border" />
    </div>
  );
}

function statusBadge(status) {
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

function leftBorder(status) {
  if (status === "done") return "border-l-app-green";
  if (status === "soon") return "border-l-app-yellow";
  if (status === "overdue") return "border-l-app-red";
  return "border-l-app-slate";
}

export default function VaccinationModal({ isOpen, pet, onClose, onSaveVaccination, onDeleteVaccination }) {
  const [expanded, setExpanded] = useState(true);
  const [savedState, setSavedState] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "",
    date: "",
    nextDueDate: "",
    doctor: "",
    batchNo: "",
    clinic: "",
    notes: "",
  });
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    if (!isOpen || !pet) return;
    setExpanded(!pet.vaccinations?.length);
    setSavedState(false);
    setErrors({});
  }, [isOpen, pet]);

  if (!isOpen || !pet) return null;

  const doneCount = pet.vaccinations.filter((item) => item.status === "done").length;
  const soonCount = pet.vaccinations.filter((item) => item.status === "soon" || item.status === "upcoming").length;
  const overdueCount = pet.vaccinations.filter((item) => item.status === "overdue").length;

  const inputCls =
    "w-full rounded-xl border-[1.5px] border-app-border bg-app-bg px-3.5 py-2.5 text-[13px] text-app-navy outline-none transition focus:border-app-teal focus:bg-white focus:shadow-[0_0_0_3px_rgba(45,212,160,0.12)]";

  const save = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Vaccine name is required";
    if (!form.date) next.date = "Date is required";
    setErrors(next);
    if (Object.keys(next).length) return;
    onSaveVaccination(pet.id, {
      id: `v-${Date.now()}`,
      name: form.name.trim(),
      date: form.date,
      nextDueDate: form.nextDueDate || null,
      doctor: form.doctor.trim() || null,
      batchNo: form.batchNo.trim() || null,
      clinic: form.clinic.trim() || null,
      notes: form.notes.trim() || null,
    });
    setForm({ name: "", date: "", nextDueDate: "", doctor: "", batchNo: "", clinic: "", notes: "" });
    setSavedState(true);
    setTimeout(() => setSavedState(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-[82] flex items-center justify-center bg-app-navy/40 p-3 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(event) => event.stopPropagation()} className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-2xl bg-white shadow-xl animate-[modalPop_0.25s_ease_forwards]">
        <div className="sticky top-0 z-10 border-b border-app-border bg-white px-7 py-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 overflow-hidden rounded-full border-2 border-app-teal">
                  {pet.imageUrl ? <img src={pet.imageUrl} alt={pet.name} className="h-full w-full object-cover" /> : <div className={["h-full w-full", pet.gradientClass].join(" ")} />}
                </div>
                <div>
                  <p className="text-base font-extrabold text-app-navy">{pet.name}</p>
                  <p className="text-xs text-app-slate">{pet.species}</p>
                </div>
              </div>
              <h3 className="mt-2 text-xl font-extrabold text-app-navy">Vaccination Records</h3>
              <p className="text-[13px] text-app-slate">Manage vaccine history and upcoming schedules</p>
            </div>
            <button type="button" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-app-bg text-lg text-app-slate transition hover:bg-app-red-light">✕</button>
          </div>
        </div>

        <div className="space-y-5 px-7 py-6">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="flex items-center gap-1 rounded-xl bg-app-green-light px-3 py-2 text-xs font-bold text-[#065F46]">✅ {doneCount} Completed</div>
            <div className="flex items-center gap-1 rounded-xl bg-app-yellow-light px-3 py-2 text-xs font-bold text-[#92400E]">⏰ {soonCount} Upcoming</div>
            <div className="flex items-center gap-1 rounded-xl bg-app-red-light px-3 py-2 text-xs font-bold text-app-red">⚠️ {overdueCount} Overdue</div>
          </div>

          <SectionLabel text="Vaccination History" />
          {pet.vaccinations?.length ? (
            <div className="space-y-2.5">
              {pet.vaccinations.map((item) => (
                <div key={item.id} className={["flex items-center gap-2 rounded-xl border border-app-border border-l-[3px] bg-white px-3.5 py-3", leftBorder(item.status)].join(" ")}>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-app-navy">{item.name}</p>
                    <p className="text-xs text-app-slate">{item.date || "Not administered"} {item.nextDueDate ? `· Next ${item.nextDueDate}` : ""}</p>
                  </div>
                  <span className={["rounded-full px-2 py-0.5 text-[10px] font-bold", statusBadge(item.status)].join(" ")}>{statusLabel(item.status)}</span>
                  <button type="button" onClick={() => onDeleteVaccination(pet.id, item.id)} className="inline-flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-app-red-light">🗑</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="animate-[pulse_2s_infinite] text-[40px]">💉</p>
              <p className="mt-2 text-base font-bold text-app-navy">No vaccination records</p>
              <p className="text-[13px] text-app-slate">Add the first vaccination below</p>
            </div>
          )}

          <button type="button" onClick={() => setExpanded((prev) => !prev)} className="flex w-full items-center justify-between border-b border-app-border pb-2 text-left text-sm font-bold text-app-teal">
            ＋ Add Vaccination Record
            <span className={["transition", expanded ? "rotate-180" : ""].join(" ")}>⌄</span>
          </button>

          <div className={["overflow-hidden transition-[max-height] duration-300", expanded ? "max-h-[1200px]" : "max-h-0"].join(" ")}>
            <div className="space-y-4 pt-1">
              <SectionLabel text="New Vaccination" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-app-navy">Vaccine Name <span className="text-app-red">*</span></label>
                  <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="e.g. Rabies, DHPP, Bordetella" className={inputCls} />
                  {errors.name ? <p className="mt-1 text-[11px] text-app-red">⚠ {errors.name}</p> : null}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-app-navy">Date Given <span className="text-app-red">*</span></label>
                  <input type="date" max={today} value={form.date} onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))} className={inputCls} />
                  {errors.date ? <p className="mt-1 text-[11px] text-app-red">⚠ {errors.date}</p> : null}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-app-navy">Next Due Date <span className="text-[11px] font-normal text-app-slate">(optional)</span></label>
                  <input type="date" min={today} value={form.nextDueDate} onChange={(event) => setForm((prev) => ({ ...prev, nextDueDate: event.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-app-navy">Administered By <span className="text-[11px] font-normal text-app-slate">(optional)</span></label>
                  <input value={form.doctor} onChange={(event) => setForm((prev) => ({ ...prev, doctor: event.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-app-navy">Batch No. <span className="text-[11px] font-normal text-app-slate">(optional)</span></label>
                  <input value={form.batchNo} onChange={(event) => setForm((prev) => ({ ...prev, batchNo: event.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-app-navy">Clinic <span className="text-[11px] font-normal text-app-slate">(optional)</span></label>
                  <input value={form.clinic} onChange={(event) => setForm((prev) => ({ ...prev, clinic: event.target.value }))} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-app-navy">Notes <span className="text-[11px] font-normal text-app-slate">(optional)</span></label>
                <textarea value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} className={`${inputCls} min-h-[70px] resize-y`} />
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 flex gap-2 border-t border-app-border bg-white px-7 py-4">
          <button type="button" onClick={onClose} className="flex-1 rounded-full border border-app-border px-4 py-2 text-sm font-bold text-app-slate">Cancel</button>
          <button type="button" onClick={save} className={["flex-[1.6] rounded-full px-4 py-2 text-sm font-bold text-white transition", savedState ? "bg-app-green" : "bg-app-teal hover:bg-app-teal-dark"].join(" ")}>
            {savedState ? "✓ Saved!" : "💉 Save Vaccination"}
          </button>
        </div>
      </div>
    </div>
  );
}
