export default function AddPetCard({ onClick, index, usedSlots }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[340px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-app-border bg-app-card p-6 text-center opacity-0 shadow-sm transition duration-[220ms] hover:border-app-teal hover:bg-app-teal-light animate-[fadeSlideUp_0.35s_ease_forwards]"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-app-bg text-2xl text-app-slate transition duration-[220ms] group-hover:bg-app-teal group-hover:text-white">
        🐾
      </span>
      <p className="mt-4 text-lg font-extrabold text-app-navy transition group-hover:text-app-teal-dark">Add a New Pet</p>
      <p className="mt-1 text-sm text-app-slate transition group-hover:text-app-teal-dark">{usedSlots} of 5 slots used</p>
    </button>
  );
}
