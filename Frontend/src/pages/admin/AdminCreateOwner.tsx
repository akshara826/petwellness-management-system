import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { CreateOwnerData } from "../../api/services/adminUserService";
import { createOwner } from "../../api/services/adminUserService";
import AddressSection from "../../components/admin/createOwner/AddressSection";
import DocumentSection from "../../components/admin/createOwner/DocumentSection";
import PersonalSection from "../../components/admin/createOwner/PersonalSection";
import Sidebar from "../../components/admin/Sidebar";
import ToastStack from "../../components/admin/ToastStack";
import TopNavbar from "../../components/admin/TopNavbar";
import type { DashboardMenuKey, ToastItem, ToastType } from "../../types/adminDashboard";

type Errors = Partial<Record<keyof CreateOwnerData, string>>;
type Touched = Partial<Record<keyof CreateOwnerData, boolean>>;

const initialForm: CreateOwnerData = {
  email: "",
  fullName: "",
  phoneNumber: "",
  highestQualification: "",
  occupation: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  idProofType: "",
  gender: "",
  dateOfBirth: "",
  fatherName: "",
  motherName: "",
  idProof: null,
  profileImage: null,
};

const requiredFields: (keyof CreateOwnerData)[] = [
  "email",
  "fullName",
  "phoneNumber",
  "highestQualification",
  "occupation",
  "street",
  "city",
  "state",
  "pincode",
  "idProofType",
  "gender",
  "dateOfBirth",
  "idProof",
  "profileImage",
];

const idTypeLabels: Record<string, string> = {
  AADHAR: "Aadhaar Card",
  PAN: "PAN Card",
  PASSPORT: "Passport",
  DRIVING_LICENSE: "Driving License",
};

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const maybeResponse = error as { response?: { data?: { message?: string } | string } };
    const data = maybeResponse.response?.data;
    if (typeof data === "string" && data.trim()) return data;
    if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
      return data.message;
    }
  }
  if (error instanceof Error) return error.message;
  return "Failed to create owner. Please try again.";
}

function isPastDate(value: string) {
  if (!value) return false;
  const selected = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected < today;
}

function validateField(field: keyof CreateOwnerData, formData: CreateOwnerData): string {
  switch (field) {
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()) ? "" : "Please enter a valid email address";
    case "fullName":
      return formData.fullName.trim() ? "" : "Full name is required";
    case "phoneNumber":
      return formData.phoneNumber.trim() ? "" : "Phone number is required";
    case "highestQualification":
      return formData.highestQualification.trim() ? "" : "Highest qualification is required";
    case "occupation":
      return formData.occupation.trim() ? "" : "Occupation is required";
    case "street":
      return formData.street.trim() ? "" : "Street address is required";
    case "city":
      return formData.city.trim() ? "" : "City is required";
    case "state":
      return formData.state.trim() ? "" : "State is required";
    case "pincode":
      return /^\d{6}$/.test(formData.pincode.trim()) ? "" : "Pincode must be exactly 6 digits";
    case "idProofType":
      return formData.idProofType ? "" : "Please select an ID proof type";
    case "gender":
      return ["MALE", "FEMALE", "OTHER"].includes(formData.gender) ? "" : "Please select a gender";
    case "dateOfBirth":
      return isPastDate(formData.dateOfBirth) ? "" : "Date of birth must be a valid past date";
    case "idProof":
      return formData.idProof ? "" : "ID proof document is required";
    case "profileImage":
      return formData.profileImage ? "" : "Profile photo is required";
    default:
      return "";
  }
}

function validateAll(formData: CreateOwnerData): Errors {
  return requiredFields.reduce<Errors>((acc, field) => {
    const message = validateField(field, formData);
    if (message) acc[field] = message;
    return acc;
  }, {});
}

export default function AdminCreateOwner() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [formData, setFormData] = useState<CreateOwnerData>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Touched>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [maxDate, setMaxDate] = useState("");

  useEffect(() => {
    setMaxDate(todayValue());
  }, []);

  useEffect(() => {
    return () => {
      if (profileImagePreview) URL.revokeObjectURL(profileImagePreview);
    };
  }, [profileImagePreview]);

  const completionPercent = useMemo(() => {
    const currentErrors = validateAll(formData);
    const filledCount = requiredFields.filter((field) => {
      const value = formData[field];
      const hasValue =
        value instanceof File ? true : typeof value === "string" ? value.trim().length > 0 : Boolean(value);
      return hasValue && !currentErrors[field];
    }).length;
    return Math.round((filledCount / requiredFields.length) * 100);
  }, [formData]);

  const dirty = useMemo(
    () =>
      Object.entries(formData).some(([key, value]) =>
        key === "idProof" || key === "profileImage" ? value !== null : String(value).trim().length > 0
      ),
    [formData]
  );

  const pushToast = (message: string, type: ToastType) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2600);
  };

  const updateTouchedValidation = (field: keyof CreateOwnerData, nextForm: CreateOwnerData) => {
    if (!touched[field]) return;
    setErrors((prev) => {
      const next = { ...prev };
      const message = validateField(field, nextForm);
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  };

  const handleChange = (field: keyof CreateOwnerData, value: string) => {
    const normalizedValue = field === "pincode" ? value.replace(/\D/g, "") : value;
    setFormData((prev) => {
      const next = { ...prev, [field]: normalizedValue };
      updateTouchedValidation(field, next);
      return next;
    });
  };

  const handleBlur = (field: keyof CreateOwnerData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => {
      const next = { ...prev };
      const message = validateField(field, formData);
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  };

  const handleFileChange = (field: "idProof" | "profileImage", file: File | null) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: file };
      updateTouchedValidation(field, next);
      return next;
    });
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === "profileImage") {
      setProfileImagePreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return file ? URL.createObjectURL(file) : "";
      });
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setErrors({});
    setTouched({});
    setSubmitSuccess(false);
    setProfileImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return "";
    });
  };

  const handleSubmit = async () => {
    const allTouched = requiredFields.reduce<Touched>((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    setTouched((prev) => ({ ...prev, ...allTouched }));

    const nextErrors = validateAll(formData);
    setErrors(nextErrors);
    const firstInvalidField = requiredFields.find((field) => nextErrors[field]);
    if (firstInvalidField) {
      document.querySelector<HTMLElement>(`[data-error="${firstInvalidField}"]`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createOwner(formData);
      setSubmitSuccess(true);
      pushToast(
        "Owner created successfully! Temporary password has been emailed to the owner.",
        "success"
      );
    } catch (error) {
      pushToast(getErrorMessage(error), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (dirty && !window.confirm("Leave without saving?")) return;
    navigate(-1);
  };

  const infoRows = [
    { icon: "📱", label: "Phone", value: formData.phoneNumber || "—" },
    { icon: "🎂", label: "DOB", value: formData.dateOfBirth || "—" },
    {
      icon: "⚧",
      label: "Gender",
      value: formData.gender ? formData.gender.charAt(0) + formData.gender.slice(1).toLowerCase() : "—",
    },
    {
      icon: "📍",
      label: "Location",
      value: formData.city && formData.state ? `${formData.city}, ${formData.state}` : "—",
    },
    { icon: "📌", label: "Pincode", value: formData.pincode || "—" },
    { icon: "🎓", label: "Qualification", value: formData.highestQualification || "—" },
    { icon: "💼", label: "Occupation", value: formData.occupation || "—" },
    { icon: "🪪", label: "ID Type", value: idTypeLabels[formData.idProofType] || "—" },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#d9fdf2_0%,_#eff9ff_48%,_#f9fffe_100%)] text-slate-900">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        selected={"createOwner" as DashboardMenuKey}
        onSelect={() => {}}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div
        className={`min-h-screen pb-28 transition-[margin] duration-300 ${
          sidebarCollapsed ? "lg:ml-[92px]" : "lg:ml-[270px]"
        }`}
      >
        <TopNavbar onOpenSidebar={() => setMobileSidebarOpen(true)} />

        <main className="space-y-5 px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link to="/dashboard" className="font-medium text-teal-700 hover:text-teal-800">
              Dashboard
            </Link>
            <span className="text-slate-400">›</span>
            <span className="font-semibold text-slate-700">Create Owner</span>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-teal-100 bg-white p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Create Owner Account</h1>
              <p className="mt-1 text-sm text-slate-500">
                Create an approved owner account and send temporary login credentials via email
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-teal-300 hover:text-teal-700"
            >
              ← Back
            </button>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-5">
              <PersonalSection
                formData={formData}
                errors={errors}
                touched={touched}
                maxDate={maxDate}
                onBlur={handleBlur}
                onChange={handleChange}
              />
              <AddressSection
                formData={formData}
                errors={errors}
                touched={touched}
                onBlur={handleBlur}
                onChange={handleChange}
              />
              <DocumentSection
                formData={formData}
                errors={errors}
                touched={touched}
                profileImagePreview={profileImagePreview}
                onBlur={handleBlur}
                onChange={handleChange}
                onFileChange={handleFileChange}
              />
            </div>

            <aside
              className="rounded-2xl border border-teal-100 bg-white shadow-sm xl:sticky xl:top-[88px] xl:h-fit"
              style={{ animation: "fadeUp 0.3s ease 0.2s both" }}
            >
              <div className="rounded-t-2xl bg-gradient-to-br from-teal-50 to-sky-50 px-4 py-4">
                <p className="text-sm font-bold text-slate-900">Owner Preview</p>
                <p className="mt-1 text-[10px] text-slate-500">Updates as you fill the form</p>
              </div>

              <div className="px-4 py-4 text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-teal-300 bg-teal-50 text-3xl text-teal-700">
                  {profileImagePreview ? (
                    <img src={profileImagePreview} alt="Owner preview" className="h-full w-full object-cover" />
                  ) : (
                    <span>👤</span>
                  )}
                </div>
                <p className="mt-3 text-sm font-bold text-slate-900">{formData.fullName.trim() || "—"}</p>
                <p className="mt-1 text-xs text-slate-500">{formData.email.trim() || "—"}</p>
              </div>

              <div className="mx-4 border-t border-teal-100" />

              <div className="space-y-3 px-4 py-4">
                {infoRows.map((row) => (
                  <div key={row.label} className="flex gap-3">
                    <span className="mt-0.5 text-sm">{row.icon}</span>
                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        {row.label}
                      </p>
                      <p
                        className={`mt-0.5 text-sm font-semibold ${
                          row.value === "—" ? "italic text-slate-400" : "text-slate-800"
                        }`}
                      >
                        {row.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mx-4 border-t border-teal-100" />

              <div className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Form Completion</span>
                  <span className={`text-xs font-bold ${completionPercent === 100 ? "text-emerald-600" : "text-teal-700"}`}>
                    {completionPercent}%
                  </span>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-teal-50">
                  <div
                    className={`h-full rounded-full transition-[width] duration-300 ${
                      completionPercent === 100 ? "bg-emerald-500" : "bg-teal-600"
                    }`}
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
                <p className={`mt-3 text-xs ${completionPercent === 100 ? "text-emerald-600" : "text-slate-500"}`}>
                  {completionPercent === 100
                    ? "✓ Ready to submit"
                    : `${requiredFields.length - Math.round((completionPercent / 100) * requiredFields.length)} fields remaining`}
                </p>
              </div>
            </aside>
          </div>
        </main>
      </div>

      <div
        className={`fixed bottom-0 right-0 z-30 border-t border-teal-100 bg-white/95 px-4 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] backdrop-blur sm:px-6 ${
          sidebarCollapsed ? "lg:left-[92px]" : "lg:left-[270px]"
        } left-0`}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-500">* Required fields</span>
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
              {completionPercent}% Complete
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-teal-300 hover:text-teal-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-600/20 disabled:cursor-not-allowed disabled:bg-teal-300"
            >
              {isSubmitting ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Creating Account...
                </>
              ) : (
                "Create Owner Account"
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {submitSuccess ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="w-full max-w-md rounded-2xl border border-teal-100 bg-white px-7 py-8 text-center shadow-2xl"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl text-emerald-600">
                ✅
              </div>
              <h3 className="mt-4 text-xl font-bold text-slate-900">Owner Created Successfully!</h3>
              <p className="mt-3 text-sm text-slate-500">Temporary login credentials have been sent to:</p>
              <p className="mt-2 text-sm font-bold text-teal-700">{formData.email}</p>
              <p className="mt-1 text-sm text-slate-500">via email.</p>

              <div className="mt-5 flex items-center gap-3 rounded-xl bg-teal-50 px-4 py-3 text-left">
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-teal-500 bg-white text-lg">
                  {profileImagePreview ? (
                    <img src={profileImagePreview} alt="Owner" className="h-full w-full object-cover" />
                  ) : (
                    "👤"
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{formData.fullName}</p>
                  <p className="truncate text-xs text-slate-500">{formData.email}</p>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="w-full rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700"
                >
                  Back to Dashboard
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-teal-300 hover:text-teal-700"
                >
                  Create Another Owner
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <ToastStack toasts={toasts} />
    </div>
  );
}
