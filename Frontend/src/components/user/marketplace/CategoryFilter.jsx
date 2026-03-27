const CATEGORIES = [
  { label: "All", value: "ALL" },
  { label: "Food", value: "FOOD" },
  { label: "Toys", value: "TOYS" },
  { label: "Grooming", value: "GROOMING" },
  { label: "Medicines", value: "HEALTH" },
  { label: "Accessories", value: "ACCESSORIES" },
];

export default function CategoryFilter({ selectedCategory, onChange }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-2">
        {CATEGORIES.map((category) => {
          const active = selectedCategory === category.value;
          return (
            <button
              key={category.value}
              type="button"
              onClick={() => onChange(category.value)}
              className={[
                "rounded-full border px-4 py-2 text-sm font-semibold transition",
                active
                  ? "border-[#2DD4A0] bg-[#2DD4A0] text-white"
                  : "border-[#E2EBF0] bg-white text-[#6B7A8D] hover:border-[#2DD4A0] hover:text-[#1BAF82]",
              ].join(" ")}
            >
              {category.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
