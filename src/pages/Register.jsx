import React, { useMemo, useState } from "react";
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

  const canSubmit = useMemo(() => {
    return otpVerified && idProofFile && profileImageFile;
  }, [otpVerified, idProofFile, profileImageFile]);

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

      if (payload && typeof payload === "object" && payload.token) {
        localStorage.setItem("token", payload.token);
        navigate("/set-password");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingAction("");
    }
  };

  return (
    <div className="min-h-screen bg-sky-100 px-4 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 rounded-3xl bg-white px-6 py-8 shadow-[0_24px_60px_rgba(0,0,0,0.25)] sm:px-8">
        <h1 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          Create your PetCare account
        </h1>

        {error ? <p className="rounded-lg bg-red-100 px-4 py-2 text-sm text-red-700">{error}</p> : null}
        {success ? <p className="rounded-lg bg-green-100 px-4 py-2 text-sm text-green-700">{success}</p> : null}

        <div className="rounded-xl border border-slate-200 p-4">
          <h2 className="mb-3 text-lg font-semibold">Step 1: OTP Verification</h2>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2"
              disabled={otpVerified}
            />
            <button
              type="button"
              onClick={handleSendOtp}
              className="rounded-lg bg-sky-700 px-4 py-2 font-semibold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={loadingAction === "sendOtp" || otpVerified}
            >
              {loadingAction === "sendOtp" ? "Sending..." : "Send OTP"}
            </button>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="rounded-lg border border-slate-300 px-3 py-2"
              disabled={!otpSent || otpVerified}
            />
            <button
              type="button"
              onClick={handleVerifyOtp}
              className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={!otpSent || otpVerified || loadingAction === "verifyOtp"}
            >
              {loadingAction === "verifyOtp" ? "Verifying..." : otpVerified ? "Verified" : "Verify OTP"}
            </button>
          </div>
        </div>

        <form onSubmit={handleRegistrationSubmit} className="grid gap-3">
          <h2 className="text-lg font-semibold">Step 2: Registration Details</h2>

          <input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleFieldChange} className="rounded-lg border border-slate-300 px-3 py-2" required />
          <input name="phoneNumber" placeholder="Phone Number" value={form.phoneNumber} onChange={handleFieldChange} className="rounded-lg border border-slate-300 px-3 py-2" required />
          <input name="highestQualification" placeholder="Highest Qualification" value={form.highestQualification} onChange={handleFieldChange} className="rounded-lg border border-slate-300 px-3 py-2" required />
          <input name="occupation" placeholder="Occupation" value={form.occupation} onChange={handleFieldChange} className="rounded-lg border border-slate-300 px-3 py-2" required />
          <input name="street" placeholder="Street" value={form.street} onChange={handleFieldChange} className="rounded-lg border border-slate-300 px-3 py-2" required />
          <input name="city" placeholder="City" value={form.city} onChange={handleFieldChange} className="rounded-lg border border-slate-300 px-3 py-2" required />
          <input name="state" placeholder="State" value={form.state} onChange={handleFieldChange} className="rounded-lg border border-slate-300 px-3 py-2" required />
          <input name="pincode" placeholder="Pincode (6 digits)" value={form.pincode} onChange={handleFieldChange} className="rounded-lg border border-slate-300 px-3 py-2" required />
          <input name="idProofType" placeholder="ID Proof Type" value={form.idProofType} onChange={handleFieldChange} className="rounded-lg border border-slate-300 px-3 py-2" required />

          <select
            name="gender"
            value={form.gender}
            onChange={handleFieldChange}
            className="rounded-lg border border-slate-300 px-3 py-2"
            required
          >
            <option value="">Select Gender</option>
            <option value="MALE">MALE</option>
            <option value="FEMALE">FEMALE</option>
            <option value="OTHER">OTHER</option>
          </select>

          <input name="fatherName" placeholder="Father Name (Optional)" value={form.fatherName} onChange={handleFieldChange} className="rounded-lg border border-slate-300 px-3 py-2" />
          <input name="motherName" placeholder="Mother Name (Optional)" value={form.motherName} onChange={handleFieldChange} className="rounded-lg border border-slate-300 px-3 py-2" />

          <label className="text-sm font-medium">Date of Birth</label>
          <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleFieldChange} className="rounded-lg border border-slate-300 px-3 py-2" required />

          <label className="text-sm font-medium">ID Proof File (required)</label>
          <input type="file" onChange={(e) => setIdProofFile(e.target.files?.[0] || null)} className="rounded-lg border border-slate-300 px-3 py-2" required />

          <label className="text-sm font-medium">Profile Image File (required)</label>
          <input type="file" onChange={(e) => setProfileImageFile(e.target.files?.[0] || null)} className="rounded-lg border border-slate-300 px-3 py-2" required />

          <button
            type="submit"
            disabled={!canSubmit || loadingAction === "register"}
            className="mt-2 rounded-lg bg-sky-700 px-4 py-2 font-semibold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loadingAction === "register" ? "Submitting..." : "Submit Registration"}
          </button>
        </form>

        <p className="text-sm text-slate-600">
          Already approved? <Link to="/login" className="font-semibold text-sky-700">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
