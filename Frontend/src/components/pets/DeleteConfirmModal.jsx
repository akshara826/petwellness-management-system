export default function DeleteConfirmModal({ isOpen, pet, onClose, onConfirm }) {
  if (!isOpen || !pet) return null;

  return (
    <div className="fixed inset-0 z-[83] flex items-center justify-center bg-app-navy/40 p-3 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(event) => event.stopPropagation()} className="w-full max-w-[400px] rounded-2xl bg-white p-6 shadow-xl animate-[modalPop_0.25s_ease_forwards]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-app-red-light text-3xl">🗑</div>
        <h3 className="mt-3 text-center text-xl font-extrabold text-app-navy">Remove Pet Profile?</h3>
        <p className="mt-2 text-center text-[13px] leading-relaxed text-app-slate">
          Are you sure you want to remove {pet.name}? This will permanently delete all their health records, vaccination history, and medical data. This action cannot be undone.
        </p>

        <div className="mt-4 flex items-center gap-3 rounded-xl bg-app-bg p-3">
          <div className="h-10 w-10 overflow-hidden rounded-full">
            {pet.imageUrl ? <img src={pet.imageUrl} alt={pet.name} className="h-full w-full object-cover" /> : <div className={["h-full w-full", pet.gradientClass].join(" ")} />}
          </div>
          <div>
            <p className="text-sm font-bold text-app-navy">{pet.name}</p>
            <p className="text-xs text-app-slate">{pet.species} · {pet.breed}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <button type="button" onClick={onClose} className="w-full rounded-full border border-app-border px-4 py-2 text-sm font-bold text-app-slate">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full rounded-full bg-app-red px-4 py-2 text-sm font-bold text-white transition hover:bg-[#EF4444] hover:shadow-[0_4px_12px_rgba(239,68,68,0.35)]"
          >
            Yes, Remove {pet.name}
          </button>
        </div>
      </div>
    </div>
  );
}
