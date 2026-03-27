function statusClass(type) {
  if (type === "healthy") return "bg-app-green-light text-[#047857]";
  if (type === "warning") return "bg-app-yellow-light text-[#92400E]";
  return "bg-app-bg text-app-slate";
}

export default function MyPets({ pets }) {
  return (
    <section className="rounded-2xl border border-app-border bg-app-card shadow-sm">
      <div className="flex items-center justify-between px-5 pb-0 pt-5">
        <h2 className="text-base font-bold text-app-navy">My Pets</h2>
        <button
          type="button"
          className="rounded-full border border-app-teal px-3 py-1 text-xs font-bold text-app-teal transition duration-200 hover:bg-app-teal hover:text-white"
        >
          Manage All
        </button>
      </div>
      <div className="px-5 pb-5 pt-4">
        <div className="flex flex-wrap gap-3">
          {pets.map((pet, index) => (
            <article
              key={pet.id}
              className={[
                "min-w-[140px] flex-1 rounded-2xl p-4 text-center",
                pet.gradientClass,
                index === 0 ? "border-2 border-app-teal" : "border border-transparent",
              ].join(" ")}
            >
              <div className="mx-auto h-16 w-16 overflow-hidden rounded-full border-2 border-white/70 shadow-sm">
                {pet.imageUrl ? (
                  <img src={pet.imageUrl} alt={pet.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-app-bg text-3xl">{pet.emoji}</div>
                )}
              </div>
              <p className="mt-2 text-xl font-bold text-app-navy">{pet.name}</p>
              <p className="text-xs text-app-slate">{pet.breed} · {pet.age}</p>
              <span className={["mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold", statusClass(pet.statusType)].join(" ")}>
                {pet.status}
              </span>
            </article>
          ))}

        </div>
      </div>
    </section>
  );
}
