import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";

const initialForm = {
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
  fatherName: "",
  motherName: "",
  dateOfBirth: "",
};

function getErrorMessage(error) {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data && typeof data === "object" && data.message) {
    return data.message;
  }

  return error?.message || "Request failed";
}

function isPastDate(value) {
  if (!value) {
    return false;
  }

  const selected = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return selected < today;
}

function isBlank(value) {
  return !String(value || "").trim();
}

function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [idProofFile, setIdProofFile] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [loadingAction, setLoadingAction] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [maxDate, setMaxDate] = useState("");

  const canSubmit = useMemo(() => {
    return otpVerified && idProofFile && profileImageFile;
  }, [otpVerified, idProofFile, profileImageFile]);

  const profilePreview = useMemo(() => {
    if (!profileImageFile) {
      return "";
    }

    return URL.createObjectURL(profileImageFile);
  }, [profileImageFile]);

  useEffect(() => {
    setMaxDate(new Date().toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    if (otpVerified) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [otpVerified]);

  useEffect(() => {
    return () => {
      if (profilePreview) {
        URL.revokeObjectURL(profilePreview);
      }
    };
  }, [profilePreview]);

  const handleSendOtp = async () => {
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email is required.");
      return;
    }

    setLoadingAction("sendOtp");

    try {
      const response = await API.post("/auth/send-otp", { email });
      setOtpSent(true);
      setSuccess(typeof response.data === "string" ? response.data : "OTP sent successfully");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingAction("");
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(otp)) {
      setError("OTP must be exactly 6 digits.");
      return;
    }

    setLoadingAction("verifyOtp");

    try {
      const response = await API.post("/auth/verify-otp", { email, otp });
      setOtpVerified(true);
      setSuccess(typeof response.data === "string" ? response.data : "OTP verified successfully");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingAction("");
    }
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegistrationSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!otpVerified) {
      setError("Verify OTP before submitting registration.");
      return;
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      setError("Pincode must be exactly 6 digits.");
      return;
    }

    if (
      isBlank(form.fullName) ||
      isBlank(form.phoneNumber) ||
      isBlank(form.highestQualification) ||
      isBlank(form.occupation) ||
      isBlank(form.street) ||
      isBlank(form.city) ||
      isBlank(form.state) ||
      isBlank(form.idProofType) ||
      isBlank(form.gender)
    ) {
      setError("Please fill all required registration details.");
      return;
    }

    if (!isPastDate(form.dateOfBirth)) {
      setError("Date of birth is required and must be a past date.");
      return;
    }

    if (!idProofFile || !profileImageFile) {
      setError("Both idProof and profileImage files are required.");
      return;
    }

    const formData = new FormData();

    formData.append("email", email);
    formData.append("fullName", form.fullName);
    formData.append("phoneNumber", form.phoneNumber);
    formData.append("highestQualification", form.highestQualification);
    formData.append("occupation", form.occupation);
    formData.append("street", form.street);
    formData.append("city", form.city);
    formData.append("state", form.state);
    formData.append("pincode", form.pincode);
    formData.append("idProofType", form.idProofType);
    formData.append("gender", form.gender);
    formData.append("dateOfBirth", form.dateOfBirth);

    if (form.fatherName) {
      formData.append("fatherName", form.fatherName);
    }

    if (form.motherName) {
      formData.append("motherName", form.motherName);
    }

    formData.append("idProof", idProofFile);
    formData.append("profileImage", profileImageFile);

    setLoadingAction("register");

    try {
      const response = await API.post("/auth/registration", formData);
      const payload = response?.data;
      const message =
        typeof payload === "string"
          ? payload
          : payload?.message || "Profile completed successfully. Await admin approval.";

      setSuccess(message);
      setForm(initialForm);
      setOtp("");
      setIdProofFile(null);
      setProfileImageFile(null);
      setOtpSent(false);
      setOtpVerified(false);
      setEmail("");
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      navigate("/approval-pending", {
        replace: true,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingAction("");
    }
  };

  const inputBase =
    "w-full rounded-xl border-[1.5px] border-[#E2EBF0] bg-[#EBF4F8] px-4 py-3 text-[13px] text-[#1A2332] outline-none transition-all duration-200 placeholder:text-[#6B7A8D] focus:border-[#2DD4A0] focus:bg-white focus:shadow-[0_0_0_3px_rgba(45,212,160,0.12)]";
  const iconInput = `${inputBase} pl-10`;
  const fieldClass = (value, withIcon = false) =>
    `${withIcon ? iconInput : inputBase} ${value ? "border-[#34D399]" : ""}`;

  return (
    <div
      className="relative min-h-screen overflow-hidden px-4 py-6 text-[#1A2332] sm:px-6 sm:py-8"
      style={{
        background: "linear-gradient(135deg, #EBF4F8 0%, #D0F5EB 50%, #DAEAF8 100%)",
        fontFamily: '"Plus Jakarta Sans", sans-serif',
      }}
    >
      <style>{`
        @keyframes cardEntrance {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div
        className="pointer-events-none absolute left-[-60px] top-[-40px] h-[300px] w-[300px] rounded-full"
        style={{ background: "rgba(45, 212, 160, 0.08)", filter: "blur(60px)" }}
      />
      <div
        className="pointer-events-none absolute bottom-[-100px] right-[-60px] h-[400px] w-[400px] rounded-full"
        style={{ background: "rgba(30, 111, 217, 0.06)", filter: "blur(80px)" }}
      />
      <div
        className="pointer-events-none absolute right-[12%] top-[34%] h-[200px] w-[200px] rounded-full"
        style={{ background: "rgba(45, 212, 160, 0.05)", filter: "blur(40px)" }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div
          className="w-full max-w-[540px] overflow-hidden rounded-2xl border border-[#E2EBF0] bg-white shadow-[0_20px_60px_rgba(26,35,50,0.12),0_4px_16px_rgba(26,35,50,0.06)] sm:rounded-[24px]"
          style={{ animation: "cardEntrance 0.5s ease forwards" }}
        >
          <div
            className="border-b border-[#E2EBF0] px-5 py-6 text-center sm:px-8 sm:py-7"
            style={{ background: "linear-gradient(135deg, #D0F5EB 0%, #DAEAF8 100%)" }}
          >
            <div className="mb-3 flex items-center justify-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2DD4A0] text-[22px] text-white">
                🐾
              </div>
              <div className="text-left">
                <p className="text-[20px] font-extrabold text-[#1A2332]">PetCare</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B7A8D]">
                  Admin Hub
                </p>
              </div>
            </div>
            <h1 className="text-[22px] font-extrabold text-[#1A2332]">Create Your Account</h1>
            <p className="mx-auto mt-2 max-w-md text-[13px] leading-6 text-[#6B7A8D]">
              Join PetCare and manage your pets in one place
            </p>
          </div>

          <div className="px-5 pb-1 pt-5 sm:px-8">
            <div className="flex items-start gap-3">
              <div className="flex min-w-[84px] flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    otpVerified
                      ? "bg-[#2DD4A0] text-white"
                      : "bg-[#2DD4A0] text-white shadow-[0_0_0_4px_rgba(45,212,160,0.2)]"
                  }`}
                >
                  {otpVerified ? "✓" : "1"}
                </div>
                <p className="mt-2 text-center text-[11px] font-bold text-[#1BAF82]">OTP Verification</p>
              </div>
              <div className={`mt-4 h-[2px] flex-1 rounded-full ${otpVerified ? "bg-[#2DD4A0]" : "bg-[#E2EBF0]"}`} />
              <div className="flex min-w-[96px] flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${
                    otpVerified
                      ? "border-[#2DD4A0] bg-[#2DD4A0] text-white shadow-[0_0_0_4px_rgba(45,212,160,0.2)]"
                      : "border-[#E2EBF0] bg-white text-[#6B7A8D]"
                  }`}
                >
                  2
                </div>
                <p className={`mt-2 text-center text-[11px] font-bold ${otpVerified ? "text-[#1BAF82]" : "text-[#6B7A8D]"}`}>
                  Registration Details
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 pb-7 pt-6 sm:px-8">
            {error ? (
              <p className="mb-4 rounded-xl border border-[#FECACA] bg-[#FFF8F8] px-4 py-3 text-sm text-[#F87171]">
                {error}
              </p>
            ) : null}
            {success && !otpVerified ? (
              <p className="mb-4 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#15803D]">
                {success}
              </p>
            ) : null}

            <div className="mb-6">
              <div className="mb-4 flex items-center gap-3 text-[15px] font-extrabold text-[#1A2332]">
                <span className="h-[18px] w-[3px] rounded-full bg-[#2DD4A0]" />
                <span>Step 1: OTP Verification</span>
              </div>
              <div className="space-y-4">
                <div style={{ animation: "fadeUp 0.3s ease 0.1s both" }}>
                  <label className="mb-1.5 block text-[11px] font-bold text-[#1A2332]">Email Address</label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-[#6B7A8D]">✉️</span>
                      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass(email, true)} disabled={otpVerified} />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-[10px] bg-[#2DD4A0] px-5 py-3 text-[13px] font-bold text-white transition-all hover:bg-[#1BAF82] hover:shadow-[0_4px_12px_rgba(45,212,160,0.35)] disabled:cursor-not-allowed disabled:bg-[#A8E8D5] disabled:shadow-none"
                      disabled={loadingAction === "sendOtp" || otpVerified}
                    >
                      {loadingAction === "sendOtp" ? (
                        <>
                          <span className="h-[14px] w-[14px] rounded-full border-2 border-white/30 border-t-white" style={{ animation: "spin 0.7s linear infinite" }} />
                          Sending...
                        </>
                      ) : (
                        "Send OTP"
                      )}
                    </button>
                  </div>
                </div>

                {otpSent ? (
                  <div style={{ animation: "fadeUp 0.3s ease forwards" }}>
                    <label className="mb-1.5 block text-[11px] font-bold text-[#1A2332]">Enter OTP</label>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <div className="relative flex-1">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-[#6B7A8D]">🔐</span>
                        <input type="text" inputMode="numeric" maxLength={6} placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} className={`${fieldClass(otp, true)} text-base font-bold tracking-[0.25em]`} disabled={!otpSent || otpVerified} />
                      </div>
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className={`inline-flex min-w-[132px] items-center justify-center gap-2 rounded-[10px] px-5 py-3 text-[13px] font-bold text-white transition-all ${
                          !otpSent || otpVerified || loadingAction === "verifyOtp"
                            ? "cursor-not-allowed bg-[#E2EBF0] text-[#6B7A8D]"
                            : "bg-[#1E6FD9] hover:shadow-[0_4px_12px_rgba(30,111,217,0.25)]"
                        }`}
                        disabled={!otpSent || otpVerified || loadingAction === "verifyOtp"}
                      >
                        {loadingAction === "verifyOtp" ? (
                          <>
                            <span className="h-[14px] w-[14px] rounded-full border-2 border-white/30 border-t-white" style={{ animation: "spin 0.7s linear infinite" }} />
                            Verifying...
                          </>
                        ) : otpVerified ? (
                          "Verified"
                        ) : (
                          "Verify OTP"
                        )}
                      </button>
                    </div>
                  </div>
                ) : null}

                {otpVerified ? (
                  <div className="rounded-[10px] border border-[#34D399] bg-[#D1FAE5] px-4 py-3 text-[13px] font-semibold text-[#065F46]" style={{ animation: "slideDown 0.25s ease forwards" }}>
                    ✓ Email verified successfully!
                  </div>
                ) : null}
              </div>
            </div>

            <form
              noValidate
              onSubmit={handleRegistrationSubmit}
              className="space-y-5"
              style={otpVerified ? { animation: "slideInRight 0.35s ease forwards" } : undefined}
            >
              <div className="mb-4 flex items-center gap-3 text-[15px] font-extrabold text-[#1A2332]">
                <span className="h-[18px] w-[3px] rounded-full bg-[#2DD4A0]" />
                <span>Step 2: Registration Details</span>
              </div>

              <section style={{ animation: "fadeUp 0.3s ease 0.05s both" }}>
                <div className="mb-3 flex items-center gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6B7A8D]">Personal Information</p>
                  <div className="h-px flex-1 bg-[#E2EBF0]" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="relative">
                    <label className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-[#1A2332]">Full Name <span className="text-[#F87171]">*</span></label>
                    <span className="pointer-events-none absolute left-3 top-[38px] text-sm text-[#6B7A8D]">👤</span>
                    <input name="fullName" placeholder="Your full name" value={form.fullName} onChange={handleFieldChange} className={fieldClass(form.fullName, true)} />
                  </div>

                  <div className="relative">
                    <label className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-[#1A2332]">Phone Number <span className="text-[#F87171]">*</span></label>
                    <span className="pointer-events-none absolute left-3 top-[38px] text-sm text-[#6B7A8D]">📱</span>
                    <input name="phoneNumber" type="tel" placeholder="Phone number" value={form.phoneNumber} onChange={handleFieldChange} className={fieldClass(form.phoneNumber, true)} />
                  </div>

                  <div className="relative">
                    <label className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-[#1A2332]">Highest Qualification <span className="text-[#F87171]">*</span></label>
                    <span className="pointer-events-none absolute left-3 top-[38px] text-sm text-[#6B7A8D]">🎓</span>
                    <input name="highestQualification" placeholder="e.g. Bachelor of Science" value={form.highestQualification} onChange={handleFieldChange} className={fieldClass(form.highestQualification, true)} />
                  </div>

                  <div className="relative">
                    <label className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-[#1A2332]">Occupation <span className="text-[#F87171]">*</span></label>
                    <span className="pointer-events-none absolute left-3 top-[38px] text-sm text-[#6B7A8D]">💼</span>
                    <input name="occupation" placeholder="e.g. Software Engineer" value={form.occupation} onChange={handleFieldChange} className={fieldClass(form.occupation, true)} />
                  </div>

                  <div className="relative">
                    <label className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-[#1A2332]">Date of Birth <span className="text-[#F87171]">*</span></label>
                    <span className="pointer-events-none absolute left-3 top-[38px] text-sm text-[#6B7A8D]">🎂</span>
                    <input name="dateOfBirth" type="date" max={maxDate} value={form.dateOfBirth} onChange={handleFieldChange} className={fieldClass(form.dateOfBirth, true)} />
                    <p className="mt-1 text-[10px] text-[#6B7A8D]">Must be a past date</p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-[#1A2332]">Gender <span className="text-[#F87171]">*</span></label>
                    <div className="flex flex-wrap gap-2">
                      {["MALE", "FEMALE", "OTHER"].map((option) => {
                        const active = form.gender === option;
                        const icon = option === "MALE" ? "♂" : option === "FEMALE" ? "♀" : "⚧";

                        return (
                          <label
                            key={option}
                            className={`flex cursor-pointer items-center gap-2 rounded-[10px] border-[1.5px] px-4 py-2 text-xs font-semibold transition-all ${
                              active
                                ? "border-[#2DD4A0] bg-[#2DD4A0] text-white"
                                : "border-[#E2EBF0] bg-[#EBF4F8] text-[#6B7A8D] hover:border-[#2DD4A0] hover:bg-[#D0F5EB] hover:text-[#1BAF82]"
                            }`}
                          >
                            <input type="radio" name="gender" value={option} checked={active} onChange={handleFieldChange} className="sr-only" />
                            <span>{icon}</span>
                            <span>{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="relative">
                    <label className="mb-1.5 flex items-center gap-2 text-[11px] font-bold text-[#1A2332]">
                      Father&apos;s Name
                      <span className="rounded-full bg-[#D0F5EB] px-2 py-0.5 text-[9px] font-bold text-[#1BAF82]">Optional</span>
                    </label>
                    <span className="pointer-events-none absolute left-3 top-[38px] text-sm text-[#6B7A8D]">👨</span>
                    <input name="fatherName" placeholder="Father Name (Optional)" value={form.fatherName} onChange={handleFieldChange} className={fieldClass(form.fatherName, true)} />
                  </div>

                  <div className="relative">
                    <label className="mb-1.5 flex items-center gap-2 text-[11px] font-bold text-[#1A2332]">
                      Mother&apos;s Name
                      <span className="rounded-full bg-[#D0F5EB] px-2 py-0.5 text-[9px] font-bold text-[#1BAF82]">Optional</span>
                    </label>
                    <span className="pointer-events-none absolute left-3 top-[38px] text-sm text-[#6B7A8D]">👩</span>
                    <input name="motherName" placeholder="Mother Name (Optional)" value={form.motherName} onChange={handleFieldChange} className={fieldClass(form.motherName, true)} />
                  </div>
                </div>
              </section>

              <section style={{ animation: "fadeUp 0.3s ease 0.1s both" }}>
                <div className="mb-3 flex items-center gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6B7A8D]">Address Details</p>
                  <div className="h-px flex-1 bg-[#E2EBF0]" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="relative sm:col-span-2">
                    <label className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-[#1A2332]">Street <span className="text-[#F87171]">*</span></label>
                    <span className="pointer-events-none absolute left-3 top-[38px] text-sm text-[#6B7A8D]">🏠</span>
                    <input name="street" placeholder="Street address" value={form.street} onChange={handleFieldChange} className={fieldClass(form.street, true)} />
                  </div>

                  <div className="relative">
                    <label className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-[#1A2332]">City <span className="text-[#F87171]">*</span></label>
                    <span className="pointer-events-none absolute left-3 top-[38px] text-sm text-[#6B7A8D]">🏙️</span>
                    <input name="city" placeholder="City" value={form.city} onChange={handleFieldChange} className={fieldClass(form.city, true)} />
                  </div>

                  <div className="relative">
                    <label className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-[#1A2332]">State <span className="text-[#F87171]">*</span></label>
                    <span className="pointer-events-none absolute left-3 top-[38px] text-sm text-[#6B7A8D]">🗺️</span>
                    <input name="state" placeholder="State" value={form.state} onChange={handleFieldChange} className={fieldClass(form.state, true)} />
                  </div>

                  <div className="relative">
                    <label className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-[#1A2332]">Pincode <span className="text-[#F87171]">*</span></label>
                    <span className="pointer-events-none absolute left-3 top-[38px] text-sm text-[#6B7A8D]">📌</span>
                    <input name="pincode" placeholder="Pincode (6 digits)" value={form.pincode} onChange={handleFieldChange} className={fieldClass(form.pincode, true)} />
                    <p className="mt-1 text-[10px] text-[#6B7A8D]">Exactly 6 digits</p>
                  </div>
                </div>
              </section>

              <section style={{ animation: "fadeUp 0.3s ease 0.15s both" }}>
                <div className="mb-3 flex items-center gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6B7A8D]">Identity &amp; Documents</p>
                  <div className="h-px flex-1 bg-[#E2EBF0]" />
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <label className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-[#1A2332]">ID Proof Type <span className="text-[#F87171]">*</span></label>
                    <span className="pointer-events-none absolute left-3 top-[38px] text-sm text-[#6B7A8D]">🪪</span>
                    <input name="idProofType" placeholder="ID Proof Type" value={form.idProofType} onChange={handleFieldChange} className={fieldClass(form.idProofType, true)} />
                  </div>

                  <div>
                    <label className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-[#1A2332]">Upload ID Proof <span className="text-[#F87171]">*</span></label>
                    <p className="mb-2 text-[10px] text-[#6B7A8D]">PDF, JPG, PNG</p>
                    <label
                      className={`flex min-h-[90px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed px-4 py-4 transition-all ${
                        idProofFile
                          ? "border-[#2DD4A0] bg-[#D0F5EB]"
                          : "border-[#E2EBF0] bg-[#EBF4F8] hover:border-[#2DD4A0] hover:bg-[#D0F5EB]"
                      }`}
                    >
                      <input type="file" onChange={(e) => setIdProofFile(e.target.files?.[0] || null)} className="hidden" />
                      {idProofFile ? (
                        <div className="flex w-full items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-lg">
                            {idProofFile.type.startsWith("image/") ? "🖼️" : "📄"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[12px] font-semibold text-[#1A2332]">{idProofFile.name}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="text-xl text-[#6B7A8D]">📎</div>
                          <p className="mt-1 text-[12px] font-semibold text-[#1A2332]">Click to upload ID Proof</p>
                          <p className="mt-1 text-[10px] text-[#6B7A8D]">PDF, JPG, PNG · Max 5MB</p>
                        </div>
                      )}
                    </label>
                  </div>

                  <div>
                    <label className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-[#1A2332]">Profile Photo <span className="text-[#F87171]">*</span></label>
                    <div className="flex flex-col gap-4 rounded-xl border border-[#E2EBF0] bg-white p-4 sm:flex-row sm:items-start">
                      <label
                        className={`flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 text-xl ${
                          profilePreview
                            ? "border-[#2DD4A0]"
                            : "border-dashed border-[#E2EBF0] bg-[#EBF4F8]"
                        }`}
                      >
                        <input type="file" onChange={(e) => setProfileImageFile(e.target.files?.[0] || null)} className="hidden" />
                        {profilePreview ? (
                          <img src={profilePreview} alt="Profile preview" className="h-full w-full object-cover" />
                        ) : (
                          <span>👤</span>
                        )}
                      </label>

                      <div className="flex-1">
                        <p className="text-[13px] font-bold text-[#1A2332]">Upload your photo</p>
                        <p className="mt-1 text-[10px] text-[#6B7A8D]">JPG, PNG, WebP · Max 5MB</p>
                        <label className="mt-3 inline-flex cursor-pointer items-center rounded-full bg-[#D0F5EB] px-4 py-2 text-[11px] font-bold text-[#1BAF82] transition-all hover:bg-[#2DD4A0] hover:text-white">
                          📷 Choose Photo
                          <input type="file" onChange={(e) => setProfileImageFile(e.target.files?.[0] || null)} className="hidden" />
                        </label>
                        {profileImageFile ? <p className="mt-2 text-[11px] text-[#6B7A8D]">{profileImageFile.name}</p> : null}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <button
                type="submit"
                disabled={!canSubmit || loadingAction === "register"}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border-0 px-4 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(45,212,160,0.4)] disabled:cursor-not-allowed disabled:transform-none disabled:bg-[#A8E8D5] disabled:shadow-none"
                style={{
                  background:
                    !canSubmit || loadingAction === "register"
                      ? "#A8E8D5"
                      : "linear-gradient(135deg, #2DD4A0, #1BAF82)",
                }}
              >
                {loadingAction === "register" ? (
                  <>
                    <span className="h-[14px] w-[14px] rounded-full border-2 border-white/30 border-t-white" style={{ animation: "spin 0.7s linear infinite" }} />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-[13px] text-[#6B7A8D]">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-[#2DD4A0] transition-colors hover:text-[#1BAF82]">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
