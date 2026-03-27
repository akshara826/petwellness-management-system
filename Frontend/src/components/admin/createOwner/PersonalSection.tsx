import type { ReactNode } from "react";
import type { CreateOwnerData } from "../../../api/services/adminUserService";

type FieldName =
  | "fullName"
  | "email"
  | "phoneNumber"
  | "dateOfBirth"
  | "gender"
  | "fatherName"
  | "motherName"
  | "highestQualification"
  | "occupation";

type Props = {
  formData: CreateOwnerData;
  errors: Partial<Record<keyof CreateOwnerData, string>>;
  touched: Partial<Record<keyof CreateOwnerData, boolean>>;
  maxDate: string;
  onBlur: (field: keyof CreateOwnerData) => void;
  onChange: (field: FieldName, value: string) => void;
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

function Label({ children, optional }: { children: ReactNode; optional?: boolean }) {
  return (
    <label className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-slate-700">
      {children}
      {optional ? (
        <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-teal-700">
          Optional
        </span>
      ) : (
        <span className="text-sm text-rose-500">*</span>
      )}
    </label>
  );
}

export default function PersonalSection({ formData, errors, touched, maxDate, onBlur, onChange }: Props) {
  const genderOptions = [
    { value: "MALE", label: "Male", icon: "♂" },
    { value: "FEMALE", label: "Female", icon: "♀" },
    { value: "OTHER", label: "Other", icon: "⚧" },
  ] as const;

  return (
    <section
      className="rounded-2xl border border-teal-100 bg-white shadow-sm"
      style={{ animation: "fadeUp 0.3s ease 0.05s both" }}
    >
      <div className="flex items-start gap-3 border-b border-teal-100 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-base text-teal-700">👤</div>
        <div>
          <h2 className="text-[15px] font-bold text-slate-900">Personal Details</h2>
          <p className="mt-0.5 text-[11px] text-slate-500">Basic account information</p>
        </div>
      </div>

      <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
        <div data-error="fullName">
          <Label>Full Name</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">👤</span>
            <input
              type="text"
              value={formData.fullName}
              onChange={(event) => onChange("fullName", event.target.value)}
              onBlur={() => onBlur("fullName")}
              placeholder="e.g. Priya Sharma"
              className={`${iconInput} ${fieldState(!!errors.fullName, !!touched.fullName, !!formData.fullName.trim())}`}
            />
          </div>
          {touched.fullName ? <ErrorText message={errors.fullName} /> : null}
        </div>

        <div data-error="email">
          <Label>Email Address</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">✉️</span>
            <input
              type="email"
              value={formData.email}
              onChange={(event) => onChange("email", event.target.value)}
              onBlur={() => onBlur("email")}
              placeholder="e.g. priya@example.com"
              className={`${iconInput} ${fieldState(!!errors.email, !!touched.email, !!formData.email.trim())}`}
            />
          </div>
          {touched.email ? <ErrorText message={errors.email} /> : null}
        </div>

        <div data-error="phoneNumber">
          <Label>Phone Number</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">📱</span>
            <input
              type="tel"
              maxLength={15}
              value={formData.phoneNumber}
              onChange={(event) => onChange("phoneNumber", event.target.value)}
              onBlur={() => onBlur("phoneNumber")}
              placeholder="e.g. 9876543210"
              className={`${iconInput} ${fieldState(!!errors.phoneNumber, !!touched.phoneNumber, !!formData.phoneNumber.trim())}`}
            />
          </div>
          {touched.phoneNumber ? <ErrorText message={errors.phoneNumber} /> : null}
        </div>

        <div data-error="dateOfBirth">
          <Label>Date of Birth</Label>
          <input
            type="date"
            max={maxDate}
            value={formData.dateOfBirth}
            onChange={(event) => onChange("dateOfBirth", event.target.value)}
            onBlur={() => onBlur("dateOfBirth")}
            className={`${inputBase} ${fieldState(!!errors.dateOfBirth, !!touched.dateOfBirth, !!formData.dateOfBirth)}`}
          />
          <p className="mt-1 text-[10px] text-slate-500">Must be a past date</p>
          {touched.dateOfBirth ? <ErrorText message={errors.dateOfBirth} /> : null}
        </div>

        <div className="md:col-span-2" data-error="gender">
          <Label>Gender</Label>
          <div className="flex flex-wrap gap-2.5">
            {genderOptions.map((option) => {
              const active = formData.gender === option.value;
              return (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "border-teal-600 bg-teal-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={option.value}
                    checked={active}
                    onChange={(event) => onChange("gender", event.target.value)}
                    onBlur={() => onBlur("gender")}
                    className="sr-only"
                  />
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
          {touched.gender ? <ErrorText message={errors.gender} /> : null}
        </div>

        <div>
          <Label optional>Father&apos;s Name</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">👨</span>
            <input
              type="text"
              value={formData.fatherName}
              onChange={(event) => onChange("fatherName", event.target.value)}
              onBlur={() => onBlur("fatherName")}
              placeholder="e.g. Ramesh Sharma"
              className={iconInput}
            />
          </div>
        </div>

        <div>
          <Label optional>Mother&apos;s Name</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">👩</span>
            <input
              type="text"
              value={formData.motherName}
              onChange={(event) => onChange("motherName", event.target.value)}
              onBlur={() => onBlur("motherName")}
              placeholder="e.g. Sunita Sharma"
              className={iconInput}
            />
          </div>
        </div>

        <div data-error="highestQualification">
          <Label>Highest Qualification</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">🎓</span>
            <input
              type="text"
              value={formData.highestQualification}
              onChange={(event) => onChange("highestQualification", event.target.value)}
              onBlur={() => onBlur("highestQualification")}
              placeholder="e.g. Bachelor of Science, MBA"
              className={`${iconInput} ${fieldState(!!errors.highestQualification, !!touched.highestQualification, !!formData.highestQualification.trim())}`}
            />
          </div>
          {touched.highestQualification ? <ErrorText message={errors.highestQualification} /> : null}
        </div>

        <div data-error="occupation">
          <Label>Occupation</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">💼</span>
            <input
              type="text"
              value={formData.occupation}
              onChange={(event) => onChange("occupation", event.target.value)}
              onBlur={() => onBlur("occupation")}
              placeholder="e.g. Software Engineer, Doctor"
              className={`${iconInput} ${fieldState(!!errors.occupation, !!touched.occupation, !!formData.occupation.trim())}`}
            />
          </div>
          {touched.occupation ? <ErrorText message={errors.occupation} /> : null}
        </div>
      </div>
    </section>
  );
}
