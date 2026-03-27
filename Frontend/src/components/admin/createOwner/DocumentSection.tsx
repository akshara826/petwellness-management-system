import { useMemo, useState } from "react";
import type { CreateOwnerData } from "../../../api/services/adminUserService";

type Props = {
  formData: CreateOwnerData;
  errors: Partial<Record<keyof CreateOwnerData, string>>;
  touched: Partial<Record<keyof CreateOwnerData, boolean>>;
  profileImagePreview: string;
  onBlur: (field: keyof CreateOwnerData) => void;
  onChange: (field: "idProofType", value: string) => void;
  onFileChange: (field: "idProof" | "profileImage", file: File | null) => void;
};

const inputBase =
  "w-full rounded-lg border border-teal-100 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10";

function fieldState(hasError: boolean, touched: boolean, hasValue: boolean) {
  if (touched && hasError) return "border-rose-400 bg-rose-50 focus:border-rose-500 focus:ring-rose-500/10";
  if (touched && hasValue) return "border-emerald-400";
  return "";
}

function ErrorText({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-[11px] font-medium text-rose-600">⚠ {message}</p> : null;
}

export default function DocumentSection({
  formData,
  errors,
  touched,
  profileImagePreview,
  onBlur,
  onChange,
  onFileChange,
}: Props) {
  const [dragging, setDragging] = useState(false);
  const idProofMeta = useMemo(() => {
    if (!formData.idProof) return null;
    const kb = Math.max(1, Math.round(formData.idProof.size / 1024));
    return `${formData.idProof.name} · ${kb} KB`;
  }, [formData.idProof]);

  return (
    <section
      className="rounded-2xl border border-teal-100 bg-white shadow-sm"
      style={{ animation: "fadeUp 0.3s ease 0.15s both" }}
    >
      <div className="flex items-start gap-3 border-b border-teal-100 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-base text-rose-700">🪪</div>
        <div>
          <h2 className="text-[15px] font-bold text-slate-900">Verification Documents</h2>
          <p className="mt-0.5 text-[11px] text-slate-500">Government ID and profile photo</p>
        </div>
      </div>

      <div className="space-y-5 px-5 py-5">
        <div data-error="idProofType">
          <label className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-slate-700">
            ID Proof Type
            <span className="text-sm text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              value={formData.idProofType}
              onChange={(event) => onChange("idProofType", event.target.value)}
              onBlur={() => onBlur("idProofType")}
              className={`${inputBase} appearance-none pr-9 ${fieldState(
                !!errors.idProofType,
                !!touched.idProofType,
                !!formData.idProofType
              )}`}
            >
              <option value="">Select ID proof type</option>
              <option value="AADHAR">🪪 Aadhaar Card</option>
              <option value="PAN">💳 PAN Card</option>
              <option value="PASSPORT">🛂 Passport</option>
              <option value="DRIVING_LICENSE">🚗 Driving License</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">▾</span>
          </div>
          {touched.idProofType ? <ErrorText message={errors.idProofType} /> : null}
        </div>

        <div data-error="idProof">
          <p className="text-[11px] font-semibold text-slate-700">Upload ID Proof <span className="text-sm text-rose-500">*</span></p>
          <p className="mt-0.5 text-[10px] text-slate-500">PDF, JPG, PNG accepted</p>
          <label
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              const file = event.dataTransfer.files?.[0] || null;
              onFileChange("idProof", file);
            }}
            className={`mt-2 flex min-h-[104px] cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed px-4 py-5 text-center transition ${
              touched.idProof && errors.idProof
                ? "border-rose-400 bg-rose-50"
                : formData.idProof
                ? "border-teal-500 bg-teal-50"
                : dragging
                ? "border-teal-500 bg-teal-50"
                : "border-teal-100 bg-[#F0FDFA]"
            }`}
          >
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(event) => onFileChange("idProof", event.target.files?.[0] || null)}
              onBlur={() => onBlur("idProof")}
            />
            {formData.idProof ? (
              <div className="flex w-full items-center justify-between gap-3 rounded-xl bg-white/80 px-3 py-3 text-left">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-xl">
                  {formData.idProof.type.startsWith("image/") ? "🖼️" : "📄"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{formData.idProof.name}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{idProofMeta}</p>
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    onFileChange("idProof", null);
                  }}
                  className="rounded-full px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-white hover:text-rose-600"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div>
                <div className="text-2xl text-slate-400">📎</div>
                <p className="mt-2 text-sm font-semibold text-slate-800">Click to upload or drag &amp; drop</p>
                <p className="mt-1 text-[11px] text-slate-500">PDF, JPG, PNG · Max 5MB</p>
              </div>
            )}
          </label>
          {touched.idProof ? <ErrorText message={errors.idProof} /> : null}
        </div>

        <div data-error="profileImage">
          <p className="text-[11px] font-semibold text-slate-700">Profile Photo <span className="text-sm text-rose-500">*</span></p>
          <p className="mt-0.5 text-[10px] text-slate-500">This will be the owner&apos;s avatar</p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
            <label className="group relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-teal-300 bg-teal-50 text-3xl text-teal-700">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={(event) => onFileChange("profileImage", event.target.files?.[0] || null)}
                onBlur={() => onBlur("profileImage")}
              />
              {profileImagePreview ? (
                <>
                  <img src={profileImagePreview} alt="Profile preview" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 hidden items-center justify-center bg-slate-900/45 text-xs font-semibold text-white group-hover:flex">
                    Change
                  </div>
                </>
              ) : (
                <span>👤</span>
              )}
            </label>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">Upload Profile Photo</p>
              <p className="mt-1 text-[11px] text-slate-500">JPG, PNG, WebP · Max 5MB</p>
              <label className="mt-3 inline-flex cursor-pointer items-center rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-semibold text-teal-700 transition hover:bg-teal-600 hover:text-white">
                📷 Choose Photo
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(event) => onFileChange("profileImage", event.target.files?.[0] || null)}
                />
              </label>
              {formData.profileImage ? <p className="mt-2 text-xs text-slate-500">{formData.profileImage.name}</p> : null}
            </div>
          </div>
          {touched.profileImage ? <ErrorText message={errors.profileImage} /> : null}
        </div>
      </div>
    </section>
  );
}
