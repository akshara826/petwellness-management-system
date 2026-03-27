import { useEffect, useMemo, useState } from "react";

function SectionLabel({ text }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-[1.2px] text-app-slate">{text}</span>
      <span className="h-px flex-1 bg-app-border" />
    </div>
  );
}

function InputField({ label, required, optional, error, children }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1 text-xs font-bold text-app-navy">
        {label}
        {required ? <span className="text-app-red">*</span> : null}
        {optional ? <span className="text-[11px] font-normal text-app-slate">(optional)</span> : null}
      </label>
      {children}
      {error ? <p className="mt-1 text-[11px] text-app-red">{error}</p> : null}
    </div>
  );
}

const initialForm = {
  visitDate: "",
  doctorName: "",
  clinicName: "",
  weight: "",
  symptoms: "",
  diagnosis: "",
  treatment: "",
  medication: "",
  nextVisitDate: "",
  patchNotes: "",
  prescriptionName: "",
  prescriptionFile: null,
};

export default function MedicalHistoryModal({ isOpen, pet, onClose, onSaveRecord, onDeleteRecord }) {
  const [expanded, setExpanded] = useState(true);
  const [savedState, setSavedState] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    if (!isOpen || !pet) return;
    setExpanded(!pet.medicalHistory?.length);
    setSavedState(false);
    setErrors({});
    setIsEditing(false);
    setEditId(null);
    setForm(initialForm);
  }, [isOpen, pet]);

  if (!isOpen || !pet) return null;

  const inputCls =
    "w-full rounded-xl border-[1.5px] border-app-border bg-app-bg px-3.5 py-2.5 text-[13px] text-app-navy outline-none transition focus:border-app-teal focus:bg-white focus:shadow-[0_0_0_3px_rgba(45,212,160,0.12)]";

  const startEdit = (item) => {
    setIsEditing(true);
    setEditId(item.id);
    setExpanded(true);
    setErrors({});
    setForm({
      visitDate: item.visitDate || "",
      doctorName: item.doctorName || "",
      clinicName: item.clinicName || "",
      weight: item.weight ? String(item.weight) : "",
      symptoms: item.symptoms || "",
      diagnosis: item.diagnosis || "",
      treatment: item.treatment || "",
      medication: item.medication || "",
      nextVisitDate: item.nextVisitDate || "",
      patchNotes: item.notes || "",
      prescriptionName: "",
      prescriptionFile: null,
    });
  };

  const validate = () => {
    const next = {};
    if (!form.visitDate) next.visitDate = "Visit date is required";
    if (form.visitDate && new Date(form.visitDate) > new Date()) next.visitDate = "Cannot be future date";
    if (!form.doctorName.trim()) next.doctorName = "Doctor name is required";
    if (!form.symptoms.trim()) next.symptoms = "Symptoms is required";
    if (!form.diagnosis.trim()) next.diagnosis = "Diagnosis is required";
    if (!form.treatment.trim()) next.treatment = "Treatment is required";
    if (!form.weight) next.weight = "Weight is required";
    if (form.weight && Number(form.weight) <= 0) next.weight = "Must be positive";
    if (!isEditing && !form.prescriptionFile) next.prescriptionFile = "Prescription file is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async () => {
    if (!validate()) return;

    const isSaved = await onSaveRecord(pet.id, {
      id: isEditing ? editId : `m-${Date.now()}`,
      visitDate: form.visitDate,
      doctorName: form.doctorName.trim(),
      clinicName: form.clinicName.trim(),
      symptoms: form.symptoms.trim(),
      diagnosis: form.diagnosis.trim(),
      treatment: form.treatment.trim(),
      medication: form.medication.trim(),
      weight: Number(form.weight),
      nextVisitDate: form.nextVisitDate || "",
      prescriptionName: form.prescriptionName || "",
      prescriptionFile: form.prescriptionFile,
      isEditing,
      editId,
      conditionName: form.diagnosis.trim(),
      diagnosisDate: form.visitDate,
      notes: form.patchNotes || "",
    });
    if (isSaved === false) return;

    if (isEditing) {
      onClose();
      return;
    }

    setForm(initialForm);
    setSavedState(true);
    setTimeout(() => setSavedState(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-[82] flex items-center justify-center bg-app-navy/40 p-3 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(event) => event.stopPropagation()} className="max-h-[90vh] w-full max-w-[600px] overflow-y-auto rounded-2xl bg-white shadow-xl animate-[modalPop_0.25s_ease_forwards]">
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
              <h3 className="mt-2 text-xl font-extrabold text-app-navy">Medical History</h3>
              <p className="text-[13px] text-app-slate">Track vet visits, diagnoses and treatments</p>
            </div>
            <button type="button" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-app-bg text-lg text-app-slate transition hover:bg-app-red-light">x</button>
          </div>
        </div>

        <div className="space-y-5 px-7 py-6">
          <SectionLabel text="Previous Records" />
          {pet.medicalHistory?.length ? (
            <div className="space-y-3">
              {pet.medicalHistory.map((item) => (
                <div key={item.id} className="rounded-xl border-l-[3px] border-app-teal bg-white px-4 py-3 shadow-[0_1px_4px_rgba(26,35,50,0.06)]">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-bold text-app-navy">{item.visitDate}</p>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => startEdit(item)} className="rounded-full border border-app-border px-3 py-1 text-xs font-bold text-app-teal transition hover:bg-app-teal-light">Edit</button>
                      <button type="button" onClick={() => onDeleteRecord(pet.id, item.id)} className="rounded-full border border-app-border px-3 py-1 text-xs font-bold text-app-red transition hover:bg-app-red-light">Delete</button>
                    </div>
                  </div>
                  <p className="text-[13px] text-app-slate">{item.doctorName}{item.clinicName ? ` - ${item.clinicName}` : ""}</p>
                  <p className="mt-2 text-sm font-bold text-app-navy">{item.diagnosis}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.treatment ? <span className="rounded-full bg-app-teal-light px-2.5 py-1 text-[11px] text-app-teal-dark">Treatment: {item.treatment}</span> : null}
                    {item.medication ? <span className="rounded-full bg-app-blue-light px-2.5 py-1 text-[11px] text-app-blue">Medication: {item.medication}</span> : null}
                    {item.nextVisitDate ? <span className="rounded-full bg-app-yellow-light px-2.5 py-1 text-[11px] text-[#92400E]">Next: {item.nextVisitDate}</span> : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="mt-2 text-base font-bold text-app-navy">No medical records yet</p>
              <p className="text-[13px] text-app-slate">Add the first vet visit record below</p>
            </div>
          )}

          <button type="button" onClick={() => setExpanded((prev) => !prev)} className="flex w-full items-center justify-between border-b border-app-border pb-2 text-left text-sm font-bold text-app-teal">
            {isEditing ? "Edit Record" : "Add New Record"}
            <span className={["transition", expanded ? "rotate-180" : ""].join(" ")}>^</span>
          </button>

          <div className={["overflow-hidden transition-[max-height] duration-300", expanded ? "max-h-[1400px]" : "max-h-0"].join(" ")}>
            <div className="space-y-4 pt-1">
              <SectionLabel text="Visit Details" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InputField label="Visit Date" required error={errors.visitDate}>
                  <input type="date" max={today} value={form.visitDate} onChange={(event) => setForm((prev) => ({ ...prev, visitDate: event.target.value }))} className={inputCls} />
                </InputField>
                <InputField label="Doctor Name" required error={errors.doctorName}>
                  <input value={form.doctorName} onChange={(event) => setForm((prev) => ({ ...prev, doctorName: event.target.value }))} placeholder="e.g. Dr. Anika Sharma" className={inputCls} />
                </InputField>
                <InputField label="Clinic Name" optional>
                  <input value={form.clinicName} onChange={(event) => setForm((prev) => ({ ...prev, clinicName: event.target.value }))} placeholder="e.g. PawCare Clinic (optional)" className={inputCls} />
                </InputField>
                <InputField label="Weight at Visit" required error={errors.weight}>
                  <input type="number" min="0.1" step="0.1" value={form.weight} onChange={(event) => setForm((prev) => ({ ...prev, weight: event.target.value }))} className={inputCls} />
                </InputField>
              </div>

              <InputField label="Symptoms" required error={errors.symptoms}>
                <textarea value={form.symptoms} onChange={(event) => setForm((prev) => ({ ...prev, symptoms: event.target.value }))} placeholder="Describe symptoms observed..." className={`${inputCls} min-h-[80px] resize-y`} />
              </InputField>
              <InputField label="Diagnosis" required error={errors.diagnosis}>
                <textarea value={form.diagnosis} onChange={(event) => setForm((prev) => ({ ...prev, diagnosis: event.target.value }))} placeholder="Veterinarian diagnosis..." className={`${inputCls} min-h-[80px] resize-y`} />
              </InputField>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InputField label="Treatment" required error={errors.treatment}>
                  <input value={form.treatment} onChange={(event) => setForm((prev) => ({ ...prev, treatment: event.target.value }))} placeholder="Treatment given" className={inputCls} />
                </InputField>
                <InputField label="Medication" optional>
                  <input value={form.medication} onChange={(event) => setForm((prev) => ({ ...prev, medication: event.target.value }))} placeholder="Prescribed medication" className={inputCls} />
                </InputField>
                <InputField label="Next Visit Date" optional>
                  <input type="date" min={isEditing ? undefined : today} value={form.nextVisitDate} onChange={(event) => setForm((prev) => ({ ...prev, nextVisitDate: event.target.value }))} className={inputCls} />
                </InputField>
                <InputField label="Prescription" required={!isEditing} optional={isEditing} error={errors.prescriptionFile}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border-[1.5px] border-dashed border-app-border bg-app-bg px-3.5 py-2.5 text-sm text-app-slate">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          prescriptionName: event.target.files?.[0]?.name || "",
                          prescriptionFile: event.target.files?.[0] || null,
                        }))
                      }
                    />
                    {form.prescriptionName || "Upload Prescription (PDF/Image)"}
                  </label>
                  <p className="mt-1 text-[11px] text-app-slate">PDF, JPG, PNG</p>
                </InputField>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 flex gap-2 border-t border-app-border bg-white px-7 py-4">
          <button type="button" onClick={onClose} className="flex-1 rounded-full border border-app-border px-4 py-2 text-sm font-bold text-app-slate">Cancel</button>
          <button type="button" onClick={save} className={["flex-[1.6] rounded-full px-4 py-2 text-sm font-bold text-white transition", savedState ? "bg-app-green" : "bg-app-teal hover:bg-app-teal-dark"].join(" ")}>
            {savedState ? "Saved!" : isEditing ? "Update Record" : "Save Record"}
          </button>
        </div>
      </div>
    </div>
  );
}
