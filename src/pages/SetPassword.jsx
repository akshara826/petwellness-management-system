import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

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

function SetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*!]).{8,}$/;

  const isPasswordValid = PASSWORD_REGEX.test(password);
  const showPasswordError = password.length > 0 && !isPasswordValid;

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@#$%&*!]/.test(password);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!isPasswordValid) {
      return;
    }

    if (!password || !confirmPassword) {
      setError("Both fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await API.post("/auth/set-password", { newPassword: password });

      setSuccess("Password set successfully. Redirecting to login...");
      localStorage.removeItem("token");
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-100 px-4 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-3xl bg-white px-6 py-8 shadow-[0_24px_60px_rgba(0,0,0,0.25)] sm:px-8">
        <h1 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          Set Password
        </h1>

        {error ? <p className="rounded-lg bg-red-100 px-4 py-2 text-sm text-red-700">{error}</p> : null}
        {success ? <p className="rounded-lg bg-green-100 px-4 py-2 text-sm text-green-700">{success}</p> : null}

        <form onSubmit={handleSubmit} className="grid gap-3">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 pr-10 text-slate-900 ${
                showPasswordError ? "border-red-500" : "border-slate-300"
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-2 my-auto text-sm text-slate-500 hover:text-slate-700"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {showPasswordError ? (
            <p className="text-xs text-red-600">
              Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
            </p>
          ) : null}

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 text-slate-900"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute inset-y-0 right-2 my-auto text-sm text-slate-500 hover:text-slate-700"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="mt-1 space-y-1 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
            <p className="font-semibold">Your password must have:</p>
            <p className="flex items-center gap-2">
              <span className={hasMinLength ? "text-emerald-600" : "text-slate-400"}>✓</span>
              <span>At least 8 characters</span>
            </p>
            <p className="flex items-center gap-2">
              <span className={hasUppercase ? "text-emerald-600" : "text-slate-400"}>✓</span>
              <span>At least 1 uppercase letter (A–Z)</span>
            </p>
            <p className="flex items-center gap-2">
              <span className={hasLowercase ? "text-emerald-600" : "text-slate-400"}>✓</span>
              <span>At least 1 lowercase letter (a–z)</span>
            </p>
            <p className="flex items-center gap-2">
              <span className={hasNumber ? "text-emerald-600" : "text-slate-400"}>✓</span>
              <span>At least 1 number (0–9)</span>
            </p>
            <p className="flex items-center gap-2">
              <span className={hasSpecial ? "text-emerald-600" : "text-slate-400"}>✓</span>
              <span>At least 1 special character (@ # $ % & * !)</span>
            </p>
          </div>

          <button
            type="submit"
            className="mt-2 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={loading || !isPasswordValid || password !== confirmPassword}
          >
            {loading ? "Saving..." : "Set Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SetPassword;