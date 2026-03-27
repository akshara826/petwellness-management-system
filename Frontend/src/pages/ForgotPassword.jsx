import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import "./Login.css";

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

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loadingAction, setLoadingAction] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendOtp = async () => {
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setLoadingAction("sendOtp");

    try {
      const response = await API.post("/auth/forgot-password/send-otp", { email });
      setOtpSent(true);
      setSuccess(typeof response.data === "string" ? response.data : "OTP sent successfully");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingAction("");
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !otp.trim() || !newPassword) {
      setError("Email, OTP, and new password are required.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("OTP must be exactly 6 digits.");
      return;
    }

    setLoadingAction("reset");

    try {
      const response = await API.post("/auth/forgot-password/reset", {
        email,
        otp,
        newPassword,
      });

      setSuccess(typeof response.data === "string" ? response.data : "Password reset successfully");
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingAction("");
    }
  };

  return (
    <div className="login-page min-h-screen px-4 py-10 text-slate-900">
      <div className="login-bg" aria-hidden="true">
        <span className="login-blob login-blob-one" />
        <span className="login-blob login-blob-two" />
        <span className="login-blob login-blob-three" />
      </div>

      <div className="login-paws" aria-hidden="true">
        <span className="paw paw-1">🐾</span>
        <span className="paw paw-2">🐾</span>
        <span className="paw paw-3">🐾</span>
        <span className="paw paw-4">🐾</span>
        <span className="paw paw-5">🐾</span>
      </div>

      <div className="login-card mx-auto flex w-full max-w-md flex-col gap-6">
        <div className="brand-header">
          <div className="brand-badge" aria-hidden="true">
            <span>🐾</span>
          </div>
          <p className="brand-name">
            PetCare <span>Management</span> System
          </p>
        </div>

        <h1 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          Forgot Password
        </h1>

        {error ? <p className="status-message status-error">{error}</p> : null}
        {success ? <p className="status-message status-success">{success}</p> : null}

        <div className="forgot-password-helper">
          Enter your email, get the OTP, then set a new password.
        </div>

        <form className="login-form grid gap-3" onSubmit={handleResetPassword}>
          <div className="field-group stagger-1">
            <span className="field-icon" aria-hidden="true">✉️</span>
            <input
              type="email"
              placeholder="Registered Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
            />
          </div>

          <button
            type="button"
            className={`login-button ${loadingAction === "sendOtp" ? "loading" : ""}`}
            disabled={loadingAction === "sendOtp" || loadingAction === "reset"}
            onClick={handleSendOtp}
          >
            <span className="button-shimmer" aria-hidden="true" />
            <span className="button-content">
              <span className="button-paw" aria-hidden="true">🐾</span>
              <span className="button-label">
                {loadingAction === "sendOtp" ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
              </span>
            </span>
            <span className="loading-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>

          <div className="field-group stagger-2">
            <span className="field-icon" aria-hidden="true">✉️</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="login-input"
              required
            />
          </div>

          <div className="field-group">
            <span className="field-icon" aria-hidden="true">🔒</span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="login-input w-full"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="password-toggle"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.94 10.94 0 0112 19C7.52 19 3.73 16.06 2.46 12c.55-1.74 1.51-3.33 2.78-4.64" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 9.88A3 3 0 0014.12 14.12" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.73 5.08A11.05 11.05 0 0112 5c4.48 0 8.27 2.94 9.54 7a10.96 10.96 0 01-1.88 3.12" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4l16 16" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.64-7 10-7 10 7 10 7-3.64 7-10 7S2 12 2 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          <button
            type="submit"
            className={`login-button ${loadingAction === "reset" ? "loading" : ""}`}
            disabled={loadingAction === "sendOtp" || loadingAction === "reset"}
          >
            <span className="button-shimmer" aria-hidden="true" />
            <span className="button-content">
              <span className="button-paw" aria-hidden="true">🐾</span>
              <span className="button-label">
                {loadingAction === "reset" ? "Resetting..." : "Reset Password"}
              </span>
            </span>
            <span className="loading-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </form>

        <p className="login-footer text-sm text-slate-600">
          Back to login? <Link to="/login" className="font-semibold text-sky-700">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
