import type { ReactNode } from "react";
import type { CreateOwnerData } from "../../../api/services/adminUserService";

type Props = {
  formData: CreateOwnerData;
  errors: Partial<Record<keyof CreateOwnerData, string>>;
  touched: Partial<Record<keyof CreateOwnerData, boolean>>;
  onBlur: (field: keyof CreateOwnerData) => void;
  onChange: (field: "street" | "city" | "state" | "pincode", value: string) => void;
};

const inputBase =
  "w-full rounded-lg border border-teal-100 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10";
const iconInput = `${inputBase} pl-10`;

function fieldState(hasError: boolean, touched: boolean, hasValue: boolean) {
  if (touched && hasError) return "border-rose-400 bg-rose-50 focus:border-rose-500 focus:ring-rose-500/10";
  if (touched && hasValue) return "border-emerald-400";
  return "";
}

function ErrorText({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-[11px] font-medium text-rose-600">⚠ {message}</p> : null;
}

function Label({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-slate-700">
      {children}
      <span className="text-sm text-rose-500">*</span>
    </label>
  );
}

export default function AddressSection({ formData, errors, touched, onBlur, onChange }: Props) {
  return (
    <section
      className="rounded-2xl border border-teal-100 bg-white shadow-sm"
      style={{ animation: "fadeUp 0.3s ease 0.1s both" }}
    >
      <div className="flex items-start gap-3 border-b border-teal-100 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-base text-sky-700">📍</div>
        <div>
          <h2 className="text-[15px] font-bold text-slate-900">Address Details</h2>
          <p className="mt-0.5 text-[11px] text-slate-500">Residential address of the owner</p>
        </div>
      </div>

      <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
        <div className="md:col-span-2" data-error="street">
          <Label>Street Address</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">🏠</span>
            <input
              type="text"
              value={formData.street}
              onChange={(event) => onChange("street", event.target.value)}
              onBlur={() => onBlur("street")}
              placeholder="e.g. 12, MG Road, Koramangala"
              className={`${iconInput} ${fieldState(!!errors.street, !!touched.street, !!formData.street.trim())}`}
            />
          </div>
          {touched.street ? <ErrorText message={errors.street} /> : null}
        </div>

        <div data-error="city">
          <Label>City</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">🏙️</span>
            <input
              type="text"
              value={formData.city}
              onChange={(event) => onChange("city", event.target.value)}
              onBlur={() => onBlur("city")}
              placeholder="e.g. Bengaluru"
              className={`${iconInput} ${fieldState(!!errors.city, !!touched.city, !!formData.city.trim())}`}
            />
          </div>
          {touched.city ? <ErrorText message={errors.city} /> : null}
        </div>

        <div data-error="state">
          <Label>State</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">🗺️</span>
            <input
              type="text"
              value={formData.state}
              onChange={(event) => onChange("state", event.target.value)}
              onBlur={() => onBlur("state")}
              placeholder="e.g. Karnataka"
              className={`${iconInput} ${fieldState(!!errors.state, !!touched.state, !!formData.state.trim())}`}
            />
          </div>
          {touched.state ? <ErrorText message={errors.state} /> : null}
        </div>

        <div data-error="pincode">
          <Label>Pincode</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">📌</span>
            <input
              type="text"
              maxLength={6}
              value={formData.pincode}
              onChange={(event) => onChange("pincode", event.target.value)}
              onBlur={() => onBlur("pincode")}
              placeholder="e.g. 560001"
              className={`${iconInput} ${fieldState(!!errors.pincode, !!touched.pincode, !!formData.pincode.trim())}`}
            />
          </div>
          <p className="mt-1 text-[10px] text-slate-500">Exactly 6 digits</p>
          {touched.pincode ? <ErrorText message={errors.pincode} /> : null}
        </div>
      </div>
    </section>
  );
}
