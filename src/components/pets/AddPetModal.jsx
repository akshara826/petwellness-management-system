import { useEffect, useMemo, useState } from "react";

const typeOptions = [
  { key: "dog", label: "Dog", emoji: "🐕" },
  { key: "cat", label: "Cat", emoji: "🐈" },
  { key: "rabbit", label: "Rabbit", emoji: "🐇" },
  { key: "bird", label: "Bird", emoji: "🐦" },
  { key: "fish", label: "Fish", emoji: "🐠" },
  { key: "hamster", label: "Hamster", emoji: "🐹" },
  { key: "other", label: "Other", emoji: "➕" },
];

const colorOptions = [
  { key: "c1", label: "Teal", className: "bg-gradient-to-br from-app-teal-light to-[#A7EDD8]" },
  { key: "c2", label: "Blue", className: "bg-gradient-to-br from-app-blue-light to-[#B8D9F5]" },
  { key: "c3", label: "Pink", className: "bg-gradient-to-br from-app-red-light to-[#FECACA]" },
  { key: "c4", label: "Yellow", className: "bg-gradient-to-br from-app-yellow-light to-[#FDE68A]" },
  { key: "c5", label: "Purple", className: "bg-gradient-to-br from-[#E9D5FF] to-[#D8B4FE]" },
  { key: "c6", label: "Rose", className: "bg-gradient-to-br from-[#FBCFE8] to-[#F9A8D4]" },
];

const emptyForm = {
  type: "dog",
  name: "",
  breed: "",
  dob: "",
  gender: "Male",
  weight: "",
  bloodGroup: "Unknown",
  colour: "",
  microchipId: "",
  allergies: "",
  medication: "",
  notes: "",
  colorClass: "",
  neutered: false,
  vaccinationUpToDate: true,
  insuranceActive: false,
};

function FieldLabel({ children }) {
  return <p className="mb-1.5 text-xs font-semibold text-app-slate">{children}</p>;
}

function SectionTitle({ children }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span className="shrink-0 text-[11px] font-extrabold uppercase tracking-[0.16em] text-app-slate">{children}</span>
      <span className="h-px w-full bg-app-border" />
    </div>
  );
}

function ToggleRow({ title, subtitle, checked, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-app-border bg-app-bg px-3 py-2.5">
      <div>
        <p className="text-sm font-bold text-app-navy">{title}</p>
        <p className="text-[11px] text-app-slate">{subtitle}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={[
          "relative h-6 w-11 rounded-full border transition",
          checked ? "border-app-teal bg-app-teal" : "border-app-border bg-white",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white transition",
            checked ? "left-[22px]" : "left-[2px]",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

export default function AddPetModal({ isOpen, pet, onClose, onSave }) {
  const [form, setForm] = useState(emptyForm);

  const selectedType = useMemo(() => typeOptions.find((item) => item.key === form.type), [form.type]);

  useEffect(() => {
    if (!isOpen) return;
    if (pet) {
      setForm({
        type: pet.type || "dog",
        name: pet.name || "",
        breed: pet.breed || "",
        dob: pet.dob || "",
        gender: pet.gender || "Male",
        weight: (pet.weight || "").replace(" kg", ""),
        bloodGroup: pet.bloodGroup || "Unknown",
        colour: pet.colour || "",
        microchipId: pet.microchipId || "",
        allergies: pet.allergies || "",
        medication: pet.medication || "",
        notes: pet.notes || "",
        colorClass: pet.colorClass || "",
        neutered: Boolean(pet.neutered),
        vaccinationUpToDate: pet.vaccinationUpToDate !== false,
        insuranceActive: Boolean(pet.insuranceActive),
      });
      return;
    }
    setForm(emptyForm);
  }, [isOpen, pet]);

  if (!isOpen) return null;

  const inputClass =
    "h-10 w-full rounded-xl border border-app-border bg-app-bg px-3 text-sm text-app-navy outline-none transition focus:border-app-teal focus:bg-white focus:ring-[0_0_0_3px_rgba(45,212,160,0.12)]";

  const submit = (event) => {
    event.preventDefault();
    onSave({
      ...form,
      id: pet?.id,
      emoji: selectedType?.emoji || "🐾",
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-app-navy/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-2xl bg-app-card shadow-xl animate-[modalPop_0.24s_ease_forwards]"
      >
        <div className="sticky top-0 z-10 border-b border-app-border bg-app-card px-6 pb-4 pt-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-app-navy">{pet ? "Edit Pet Profile" : "Add New Pet"}</h2>
              <p className="mt-1 text-sm text-app-slate">Fill in your pet's details below</p>
            </div>
            <button type="button" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-app-bg text-app-slate transition hover:bg-app-red-light hover:text-app-red">
              ✕
            </button>
          </div>
        </div>

        <div className="space-y-5 px-6 py-5">
          <section>
            <SectionTitle>Pet Type</SectionTitle>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {typeOptions.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, type: item.key }))}
                  className={[
                    "flex flex-col items-center rounded-xl border px-2 py-3 transition",
                    form.type === item.key
                      ? "border-app-teal bg-app-teal-light text-app-teal-dark"
                      : "border-app-border bg-app-card text-app-slate hover:border-app-teal",
                  ].join(" ")}
                >
                  <span className="text-[28px] leading-none">{item.emoji}</span>
                  <span className="mt-2 text-[11px] font-bold">{item.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <SectionTitle>Basic Information</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel>Pet Name *</FieldLabel>
                <input required value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} className={inputClass} />
              </div>
              <div>
                <FieldLabel>Breed *</FieldLabel>
                <input required value={form.breed} onChange={(event) => setForm((prev) => ({ ...prev, breed: event.target.value }))} className={inputClass} />
              </div>
              <div>
                <FieldLabel>Date of Birth</FieldLabel>
                <input type="date" value={form.dob} onChange={(event) => setForm((prev) => ({ ...prev, dob: event.target.value }))} className={inputClass} />
              </div>
              <div>
                <FieldLabel>Gender</FieldLabel>
                <select value={form.gender} onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))} className={inputClass}>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
              <div>
                <FieldLabel>Weight (kg)</FieldLabel>
                <input value={form.weight} onChange={(event) => setForm((prev) => ({ ...prev, weight: event.target.value }))} className={inputClass} />
              </div>
              <div>
                <FieldLabel>Blood Group</FieldLabel>
                <select value={form.bloodGroup} onChange={(event) => setForm((prev) => ({ ...prev, bloodGroup: event.target.value }))} className={inputClass}>
                  <option>A+</option>
                  <option>B+</option>
                  <option>O+</option>
                  <option>AB+</option>
                  <option>Unknown</option>
                </select>
              </div>
              <div>
                <FieldLabel>Colour</FieldLabel>
                <input value={form.colour} onChange={(event) => setForm((prev) => ({ ...prev, colour: event.target.value }))} className={inputClass} />
              </div>
              <div>
                <FieldLabel>Microchip ID (optional)</FieldLabel>
                <input value={form.microchipId} onChange={(event) => setForm((prev) => ({ ...prev, microchipId: event.target.value }))} className={inputClass} />
              </div>
            </div>
          </section>

          <section>
            <SectionTitle>Card Theme Colour</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  title={option.label}
                  onClick={() => setForm((prev) => ({ ...prev, colorClass: option.key }))}
                  className={[
                    "h-[30px] w-[30px] rounded-full border transition",
                    option.className,
                    form.colorClass === option.key ? "scale-110 border-2 border-app-navy" : "border-white",
                  ].join(" ")}
                />
              ))}
            </div>
          </section>

          <section>
            <SectionTitle>Medical Details</SectionTitle>
            <div className="space-y-3">
              <div>
                <FieldLabel>Known Allergies</FieldLabel>
                <input value={form.allergies} onChange={(event) => setForm((prev) => ({ ...prev, allergies: event.target.value }))} className={inputClass} />
              </div>
              <div>
                <FieldLabel>Current Medications</FieldLabel>
                <input value={form.medication} onChange={(event) => setForm((prev) => ({ ...prev, medication: event.target.value }))} className={inputClass} />
              </div>
              <div>
                <FieldLabel>Additional Notes</FieldLabel>
                <textarea
                  value={form.notes}
                  onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                  className="min-h-[80px] w-full resize-y rounded-xl border border-app-border bg-app-bg px-3 py-2 text-sm text-app-navy outline-none transition focus:border-app-teal focus:bg-white focus:ring-[0_0_0_3px_rgba(45,212,160,0.12)]"
                />
              </div>
            </div>
          </section>

          <section>
            <SectionTitle>Status</SectionTitle>
            <div className="space-y-2.5">
              <ToggleRow
                title="Spayed / Neutered"
                subtitle="Mark if the procedure is completed"
                checked={form.neutered}
                onChange={(checked) => setForm((prev) => ({ ...prev, neutered: checked }))}
              />
              <ToggleRow
                title="Vaccination Up to Date"
                subtitle="Keep this on if all core vaccines are current"
                checked={form.vaccinationUpToDate}
                onChange={(checked) => setForm((prev) => ({ ...prev, vaccinationUpToDate: checked }))}
              />
              <ToggleRow
                title="Insurance Active"
                subtitle="Turn on if this pet has an active policy"
                checked={form.insuranceActive}
                onChange={(checked) => setForm((prev) => ({ ...prev, insuranceActive: checked }))}
              />
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 z-10 flex justify-end gap-2 border-t border-app-border bg-app-card px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-full border border-app-border bg-app-card px-4 py-2 text-sm font-bold text-app-slate transition hover:text-app-navy">
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-app-teal px-5 py-2 text-sm font-bold text-white transition hover:bg-app-teal-dark hover:shadow-[0_8px_16px_rgba(45,212,160,0.35)]"
          >
            🐾 Save Pet Profile
          </button>
        </div>
      </form>
    </div>
  );
}
