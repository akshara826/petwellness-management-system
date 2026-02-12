import React, { useState } from "react";

const navLinks = [
  { href: "#hero", label: "Home" },
  { href: "#features", label: "Features" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
  { href: "#login", label: "Login" },
];

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-sky-100 px-4 py-6 text-slate-900 sm:py-10">
      {/* Background paw/shape accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-16 -left-10 h-24 w-24 rounded-full bg-teal-300/40 blur-2xl" />
        <div className="absolute -bottom-24 -right-6 h-28 w-28 rounded-full bg-cyan-300/40 blur-2xl" />
        <div className="absolute left-4 top-1/4 flex h-10 w-10 -rotate-12 items-center justify-center rounded-full bg-teal-200/80 text-2xl">
          🐾
        </div>
        <div className="absolute right-6 bottom-1/5 flex h-10 w-10 rotate-12 items-center justify-center rounded-full bg-cyan-200/80 text-2xl">
          🐾
        </div>
      </div>

      {/* Segmented white cards stack */}
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 sm:gap-10 lg:gap-12">
        {/* Hero Card (Navbar + Hero) */}
        <section
          id="hero"
          className="overflow-hidden rounded-[2.5rem] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.3)]"
        >
          {/* Navbar inside hero card */}
          <header className="border-b border-slate-100 bg-white/95 backdrop-blur">
            <nav className="flex items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-xl font-bold text-white">
                  🐾
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold tracking-tight text-slate-900">
                    PetCare Management System
                  </span>
                </div>
              </div>

              {/* Desktop nav */}
              <div className="hidden items-center gap-8 md:flex">
                <div className="flex items-center gap-6 text-sm font-medium">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="text-slate-500 transition hover:text-slate-900"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
                <a
                  href="#contact"
                  className="rounded-full bg-sky-700 px-4 py-1.5 text-sm font-medium text-white shadow-lg shadow-sky-700/40 transition hover:bg-sky-800"
                >
                  Register
                </a>
              </div>

              {/* Mobile button */}
              <button
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700 shadow-sm md:hidden"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label="Toggle navigation"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  fill="none"
                >
                  {mobileOpen ? (
                    <path
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 6l12 12M18 6L6 18"
                    />
                  ) : (
                    <path
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 7h16M4 12h16M4 17h16"
                    />
                  )}
                </svg>
              </button>
            </nav>

            {/* Mobile menu */}
            {mobileOpen && (
              <div className="border-t border-slate-100 bg-white/95 px-5 pb-4 pt-2 md:hidden">
                <div className="flex flex-col gap-3 text-sm font-medium">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="text-slate-600"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </a>
                  ))}
                  <a
                    href="#contact"
                    className="mt-2 rounded-full bg-sky-700 px-4 py-1.5 text-center text-sm font-medium text-white shadow-lg shadow-sky-700/40"
                    onClick={() => setMobileOpen(false)}
                  >
                    Register
                  </a>
                </div>
              </div>
            )}
          </header>

          {/* Hero content */}
          <div className="px-6 pb-10 pt-8 sm:px-10 lg:px-16 lg:pb-14 lg:pt-10">
            <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16">
              <div className="space-y-6">
                <h1 className="text-balance text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  Keep your pet happy{" "}
                  and thriving.
                </h1>

                <p className="max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                  PetWell is your all-in-one pet wellness companion — track
                  vet visits, monitor activity, and get
                  proactive insights tailored to your furry best friend.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <a
                    href="#features"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-400/50 transition hover:bg-emerald-500"
                  >
                    Get Started
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      fill="none"
                    >
                      <path
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5h10M19 5v10M19 5L5 19"
                      />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative flex justify-center md:justify-end">
                <div className="relative flex h-64 w-64 items-center justify-center rounded-full bg-teal-100 sm:h-72 sm:w-72">
                  <img
                    src="https://images.unsplash.com/photo-1543466835-00a7907e9de1"
                    alt="Pet"
                    className="h-52 w-52 rounded-full object-cover shadow-xl shadow-sky-900/30 sm:h-60 sm:w-60"
                  />

                  {/* Floating small pet images */}
                  <div className="absolute -left-6 top-10 h-16 w-16 rounded-full border-4 border-white bg-orange-100 shadow-lg shadow-sky-900/20 sm:-left-8 sm:h-18 sm:w-18">
                    <img
                      src="https://images.unsplash.com/photo-1517423440428-a5a00ad493e8"
                      alt="Happy dog"
                      className="h-full w-full rounded-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-4 right-0 h-16 w-16 rounded-full border-4 border-white bg-emerald-100 shadow-lg shadow-sky-900/20 sm:-bottom-6 sm:right-2">
                    <img
                      src="https://images.unsplash.com/photo-1518791841217-8f162f1e1131"
                      alt="Cute cat"
                      className="h-full w-full rounded-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Card */}
        <section
          id="features"
          className="rounded-3xl bg-white px-6 py-8 shadow-[0_20px_50px_rgba(0,0,0,0.25)] sm:px-10 sm:py-10"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Everything your pet needs, in one place.
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <FeatureCard
              title="Pet Profile & Health Monitoring"
              icon="📊"
              description="Manage pet profiles and track medical records in one place."
              items={[
                "Add and manage multiple pets",
                "Vaccination tracking",
                "Health history records",
              ]}
            />
            <FeatureCard
              title="Vet Appointments & Scheduling"
              icon="⏰"
              description="Book veterinary visits and receive timely reminders."
              items={[
                "Schedule vet consultations",
                "Select date & time slots",
                "Automated visit reminders",
              ]}
            />
            <FeatureCard
              title="Integrated Pet Marketplace"
              icon="🛒"
              description="Purchase pet products and essential supplies easily."
              items={[
                "Food & accessories shopping",
                "Medicine purchases",
                "Secure online checkout",
              ]}
            />
          </div>
        </section>

        {/* About Card */}
        <section
          id="about"
          className="grid gap-8 rounded-3xl bg-white px-6 py-8 shadow-[0_20px_50px_rgba(0,0,0,0.25)] sm:px-10 sm:py-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
        >
          {/* Left Content */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              About PetCare Management System
            </h2>

            <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
              The PetCare Management System is designed to provide a seamless and
              interactive platform for pet owners to manage their pet’s overall
              well-being. Our application integrates health tracking, appointment
              scheduling, and pet product purchasing into a single ecosystem.
            </p>

            <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
              Users can create pet profiles, monitor medical records, receive
              vaccination reminders, book veterinary consultations, and access a
              marketplace for essential pet supplies — all from one user-friendly
              interface.
            </p>
          </div>

          {/* Right Card */}
          <div className="flex flex-col justify-between gap-6">
            <div className="rounded-2xl bg-gradient-to-br from-sky-500/15 via-emerald-400/15 to-cyan-400/15 p-[1px]">
              <div className="h-full rounded-2xl bg-white p-4 shadow-md shadow-sky-900/10">
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                  Why Choose Us?
                </p>

                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li className="flex gap-2">
                    <span className="text-emerald-500">✓</span>
                    Centralized pet health management
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-500">✓</span>
                    Easy appointment booking
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-500">✓</span>
                    Secure authentication system
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-500">✓</span>
                    Integrated pet marketplace
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-xs text-slate-700 shadow-sm sm:text-sm">
              <p className="font-semibold text-emerald-700">
                “Caring for your pet made smarter and simpler.”
              </p>
              <p className="mt-1 text-slate-600">
                — PetCare Digital Wellness Initiative
              </p>
            </div>
          </div>
        </section>

        {/* Contact Card */}
        <section
          id="contact"
          className="rounded-3xl bg-white px-6 py-8 shadow-[0_20px_50px_rgba(0,0,0,0.25)] sm:px-10 sm:py-10"
        >
          <div className="space-y-3 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Contact Us
            </h2>
            <p className="text-sm text-slate-600 sm:text-base">
              Have questions about your pet’s health, appointments, or products?
              Our support team is here to help you.
            </p>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            {/* Contact Info */}
            <div className="space-y-4 text-sm text-slate-700">
              <p>📧 Email: support@petcare.com</p>
              <p>📞 Phone: +91 98765 43210</p>
              <p>📍 Location: PetCare Clinic, Hyderabad, India</p>
              <p className="font-medium text-emerald-600">
                24/7 Emergency Vet Support Available
              </p>
            </div>

            {/* Contact Form */}
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm"
              />

              <input
                type="email"
                placeholder="Email Address"
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm"
              />

              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm"
              />

              <textarea
                rows="4"
                placeholder="Your Message"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm"
              ></textarea>

              <button
                type="submit"
                className="rounded-full bg-sky-700 px-6 py-2 text-sm font-medium text-white shadow-lg shadow-sky-700/40 hover:bg-sky-800"
              >
                Send Message
              </button>
            </form>
          </div>
        </section>

        {/* Footer */}
        <footer >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} PetWell. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a href="#hero" className="hover:text-slate-900">
                Back to top
              </a>
              <span className="h-3 w-px bg-slate-200" />
              <a href="#" className="hover:text-slate-900">
                Privacy
              </a>
              <a href="#" className="hover:text-slate-900">
                Terms
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Small presentational components
function FeatureCard({ title, icon, description, items }) {
  return (
    <div className="group flex flex-col rounded-2xl border border-amber-100 bg-white p-4 shadow-sm shadow-amber-100/80 transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md sm:p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500/80 to-emerald-400/80 text-lg text-white">
          <span>{icon}</span>
        </div>
        <h3 className="text-sm font-semibold text-gray-900 sm:text-base">
          {title}
        </h3>
      </div>
      <p className="mt-3 text-xs text-gray-700 sm:text-sm">
        {description}
      </p>
      <ul className="mt-3 space-y-1.5 text-xs text-gray-700">
        {items.map((item) => (
          <li key={item} className="flex gap-1.5">
            <span className="mt-0.5 text-emerald-500">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AboutStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-amber-100 bg-white px-4 py-3 shadow-sm shadow-amber-100/80">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}

export default App;