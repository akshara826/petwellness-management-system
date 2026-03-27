import { Link } from "react-router-dom";

export default function ApprovalPending() {
  return (
    <div className="min-h-screen bg-sky-100 px-4 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-5 rounded-3xl bg-white px-6 py-8 shadow-[0_24px_60px_rgba(0,0,0,0.25)] sm:px-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl text-amber-600">
          {"\u23F3"}
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Wait For Approval</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Your registration has been submitted successfully. An administrator needs to approve your account before
            you can log in.
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Once approval is complete, you can return to the login page and sign in.
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Status: Registration submitted, approval pending.
        </div>

        <Link
          to="/login"
          className="inline-flex items-center justify-center rounded-lg bg-sky-700 px-4 py-2 font-semibold text-white transition hover:bg-sky-800"
        >
          Back To Login
        </Link>
      </div>
    </div>
  );
}
