import { useEffect, useMemo, useState } from "react";

const EMPTY_FORM = {
  name: "",
  species: "",
  breed: "",
  gender: "",
  dateOfBirth: "",
  weight: "",
};

function SectionLabel({ text }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-[1.2px] text-app-slate">{text}</span>
      <span className="h-px flex-1 bg-app-border" />
    </div>
  );
}

function Field({ label, required, optional, error, children }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1 text-xs font-bold text-app-navy">
        <span>{label}</span>
        {required ? <span className="text-app-red text-sm">*</span> : null}
        {optional ? <span className="text-[11px] font-normal text-app-slate">(optional)</span> : null}
      </label>
      {children}
      {error ? <p className="mt-1 flex items-center gap-1 text-[11px] text-app-red">⚠ {error}</p> : null}
    </div>
  );
}

export default function AddEditPetModal({ isOpen, editingPet, petsCount, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileObj, setFileObj] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    if (editingPet) {
      setForm({
        name: editingPet.name || "",
        species: editingPet.species || "",
        breed: editingPet.breed || "",
        gender: editingPet.gender || "",
        dateOfBirth: editingPet.dateOfBirth || "",
        weight: editingPet.weight ?? "",
      });
      setPreviewUrl(editingPet.imageUrl || "");
      setFileName("");
      setFileObj(null);
    } else {
      setForm(EMPTY_FORM);
      setPreviewUrl("");
      setFileName("");
      setFileObj(null);
    }
  }, [isOpen, editingPet]);

  if (!isOpen) return null;

  const inputBase =
    "w-full rounded-xl border-[1.5px] border-app-border bg-app-bg px-3.5 py-2.5 text-[13px] text-app-navy outline-none transition duration-150 focus:border-app-teal focus:bg-white focus:shadow-[0_0_0_3px_rgba(45,212,160,0.12)]";

  const applyFile = (file) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type) || file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "Only JPG, PNG or WebP up to 5MB" }));
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setFileObj(file);
    setFileName(file.name);
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const validate = () => {
    const next = {};
    const dobDate = form.dateOfBirth ? new Date(form.dateOfBirth) : null;
    if (!form.name.trim()) next.name = "Pet name is required";
    if (!form.species.trim()) next.species = "Species is required";
    if (!form.gender) next.gender = "Gender is required";
    if (!form.dateOfBirth) next.dateOfBirth = "Date of birth is required";
    if (dobDate && dobDate > new Date()) next.dateOfBirth = "Cannot be a future date";
    if (form.weight !== "" && Number(form.weight) <= 0) next.weight = "Weight must be positive";
    if (!editingPet && !previewUrl) next.image = "Pet image is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSave(form, previewUrl, fileObj);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-app-navy/40 p-3 backdrop-blur-sm" onClick={onClose}>
      <form
        onClick={(event) => event.stopPropagation()}
        onSubmit={submit}
        className="max-h-[88vh] w-full max-w-[520px] overflow-y-auto rounded-2xl bg-white shadow-xl animate-[modalPop_0.25s_ease_forwards] md:max-h-[88vh]"
      >
        <div className="sticky top-0 z-10 border-b border-app-border bg-white px-6 py-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-xl font-extrabold text-app-navy">{editingPet ? "Edit Pet Profile" : "Add New Pet"}</h2>
              <p className="text-[13px] text-app-slate">Fill in your pet's basic details</p>
            </div>
            <div className="flex items-center gap-2">
              {!editingPet ? <span className="rounded-full bg-app-teal-light px-3 py-1 text-[11px] font-bold text-app-teal-dark">{petsCount}/5 pets</span> : null}
              <button type="button" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-app-bg text-lg text-app-slate transition hover:bg-app-red-light">
                ✕
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 px-6 py-6">
          <SectionLabel text="Image Upload" />
          <div>
            <label
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                applyFile(event.dataTransfer.files?.[0]);
              }}
              className={[
                "relative flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-app-bg transition duration-150",
                errors.image ? "border-app-red bg-[#FFF5F5]" : "border-app-border hover:border-app-teal hover:bg-app-teal-light",
                isDragging ? "scale-[1.01] border-app-teal bg-app-teal-light" : "",
              ].join(" ")}
            >
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => applyFile(event.target.files?.[0])} />
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Pet preview" className="h-full w-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/55 px-3 py-2 text-xs font-semibold text-white">✓ Photo selected · Click to change</div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setPreviewUrl("");
                      setFileObj(null);
                      setFileName("");
                    }}
                    className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm shadow-md"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-[40px] text-app-slate">📷</p>
                  <p className="mt-1 text-[15px] font-bold text-app-navy">Upload Pet Photo</p>
                  <p className="text-xs text-app-slate">Click to browse or drag & drop</p>
                  <p className="text-[11px] text-app-slate/70">JPG, PNG, WebP · Max 5MB</p>
                </div>
              )}
            </label>
            {fileName ? <p className="mt-1 text-[11px] text-app-slate">{fileName}</p> : null}
            {errors.image ? <p className="mt-1 text-[12px] text-app-red">⚠ {errors.image}</p> : null}
          </div>

          <SectionLabel text="Pet Details" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Pet Name" required error={errors.name}>
              <input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="e.g. Bruno"
                className={[inputBase, errors.name ? "border-app-red bg-[#FFF5F5] shadow-[0_0_0_3px_rgba(248,113,113,0.12)]" : ""].join(" ")}
              />
            </Field>
            <Field label="Species" required error={errors.species}>
              <input
                value={form.species}
                onChange={(event) => setForm((prev) => ({ ...prev, species: event.target.value }))}
                placeholder="e.g. Dog, Cat, Rabbit"
                className={[inputBase, errors.species ? "border-app-red bg-[#FFF5F5] shadow-[0_0_0_3px_rgba(248,113,113,0.12)]" : ""].join(" ")}
              />
            </Field>
            <Field label="Breed" optional>
              <input value={form.breed} onChange={(event) => setForm((prev) => ({ ...prev, breed: event.target.value }))} placeholder="e.g. Golden Retriever" className={inputBase} />
            </Field>
            <Field label="Gender" required error={errors.gender}>
              <select value={form.gender} onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))} className={[inputBase, errors.gender ? "border-app-red bg-[#FFF5F5] shadow-[0_0_0_3px_rgba(248,113,113,0.12)]" : ""].join(" ")}>
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </Field>
            <Field label="Date of Birth" required error={errors.dateOfBirth}>
              <input type="date" max={today} value={form.dateOfBirth} onChange={(event) => setForm((prev) => ({ ...prev, dateOfBirth: event.target.value }))} className={[inputBase, errors.dateOfBirth ? "border-app-red bg-[#FFF5F5] shadow-[0_0_0_3px_rgba(248,113,113,0.12)]" : ""].join(" ")} />
            </Field>
            <Field label="Weight" optional error={errors.weight}>
              <input type="number" min="0.1" step="0.1" value={form.weight} onChange={(event) => setForm((prev) => ({ ...prev, weight: event.target.value }))} placeholder="e.g. 4.5" className={[inputBase, errors.weight ? "border-app-red bg-[#FFF5F5] shadow-[0_0_0_3px_rgba(248,113,113,0.12)]" : ""].join(" ")} />
              <p className="mt-1 text-[11px] text-app-slate">Must be a positive number</p>
            </Field>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 flex gap-2 border-t border-app-border bg-white px-6 py-4">
          <button type="button" onClick={onClose} className="flex-1 rounded-full border border-app-border bg-white px-4 py-2 text-sm font-bold text-app-slate transition hover:border-app-slate">
            Cancel
          </button>
          <button type="submit" className="flex-[2] rounded-full bg-app-teal px-4 py-2 text-sm font-bold text-white transition hover:bg-app-teal-dark hover:shadow-[0_4px_14px_rgba(45,212,160,0.4)]">
            🐾 Save Pet
          </button>
        </div>
      </form>
    </div>
  );
}
