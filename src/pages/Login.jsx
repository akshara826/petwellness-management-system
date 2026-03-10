import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

function getRoleFromToken(token) {
  if (!token || typeof token !== "string") {
    return "";
  }

  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) {
      return "";
    }

    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized);
    const payload = JSON.parse(json);

    return typeof payload?.role === "string" ? payload.role.toUpperCase() : "";
  } catch {
    return "";
  }
}

function getNameFromToken(token) {
  if (!token || typeof token !== "string") {
    return "";
  }

  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) {
      return "";
    }

    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized);
    const payload = JSON.parse(json);

    const candidates = [payload?.fullName, payload?.name, payload?.firstName, payload?.username, payload?.sub];
    const raw = candidates.find((value) => typeof value === "string" && value.trim());
    if (!raw) return "";

    const clean = raw.trim();
    return clean.includes("@") ? clean.split("@")[0] : clean;
  } catch {
    return "";
  }
}

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loadingAction, setLoadingAction] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoadingAction("login");

    try {
      const response = await API.post("/auth/login", { email, password });
      const payload = response?.data || {};
      const token = payload?.token || "";
      const role = getRoleFromToken(token);
      const tokenName = getNameFromToken(token);

      if (token) {
        localStorage.setItem("token", token);
      }
      if (tokenName) {
        localStorage.setItem("userName", tokenName);
      } else if (email) {
        localStorage.setItem("userName", email.split("@")[0]);
      }

      if (payload.changePasswordRequired) {
        setSuccess("Login successful. Redirecting to set a new password.");
        navigate("/set-password");
      } else {
        setSuccess("Login successful. Navigating to your dashboard...");
        navigate(role === "ADMIN" ? "/dashboard" : "/user-dashboard");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingAction("");
    }
  };

  return (
    <div className="min-h-screen bg-sky-100 px-4 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-3xl bg-white px-6 py-8 shadow-[0_24px_60px_rgba(0,0,0,0.25)] sm:px-8">
        <h1 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          Login to PetCare
        </h1>

        {error ? <p className="rounded-lg bg-red-100 px-4 py-2 text-sm text-red-700">{error}</p> : null}
        {success ? <p className="rounded-lg bg-green-100 px-4 py-2 text-sm text-green-700">{success}</p> : null}

        <form className="grid gap-3" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-600 hover:text-slate-800"
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.584 10.587a2 2 0 102.829 2.829m4.952 4.95A10.95 10.95 0 0112 20C7.03 20 2.73 16.89 1 12c.69-1.95 1.83-3.73 3.29-5.17m3.41-2.31A10.95 10.95 0 0112 4c4.97 0 9.27 3.11 11 8a11.05 11.05 0 01-1.672 3.043"
                  />
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-sky-700 px-4 py-2 font-semibold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={loadingAction === "login"}
          >
            {loadingAction === "login" ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-slate-600">
          Need an account? <Link to="/register" className="font-semibold text-sky-700">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
