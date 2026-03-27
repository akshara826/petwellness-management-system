function getCategoryEmoji(category) {
  if (category === "FOOD") return "🥣";
  if (category === "TOYS") return "🎾";
  if (category === "GROOMING") return "🧴";
  if (category === "HEALTH") return "💊";
  if (category === "ACCESSORIES") return "🦮";
  return "🛍️";
}

function formatCategory(category) {
  if (category === "HEALTH") return "Medicines";
  return String(category || "FOOD").toLowerCase().replace(/^\w/, (match) => match.toUpperCase());
}

export default function ProductCard({ product, onOpen, onAddToCart, isAdding }) {
  const outOfStock = product.status === "OUT_OF_STOCK";

  return (
    <article
      className="overflow-hidden rounded-[20px] border border-[#E2EBF0] bg-white shadow-[0_2px_8px_rgba(26,35,50,0.06)] transition duration-200 hover:-translate-y-1"
      style={{ animation: "fadeUp 0.3s ease both" }}
    >
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="relative h-40 overflow-hidden bg-[#D0F5EB]">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.productName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl">{getCategoryEmoji(product.category)}</div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-[#D0F5EB] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#1BAF82]">
            {formatCategory(product.category)}
          </span>
          {outOfStock ? (
            <span className="absolute right-3 top-3 rounded-full bg-[#FEE2E2] px-3 py-1 text-[10px] font-bold text-[#F87171]">
              Out of Stock
            </span>
          ) : null}
        </div>

        <div className="space-y-2 px-4 py-[14px]">
          <p className="text-[11px] text-[#6B7A8D]">{product.brand}</p>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-[14px] font-bold text-[#1A2332]">{product.productName}</h3>
          <p className="line-clamp-2 min-h-[2rem] text-[12px] leading-5 text-[#6B7A8D]">{product.description}</p>
          <p className="text-[18px] font-extrabold text-[#2DD4A0]">₹{product.price.toFixed(2)}</p>
          <p className="text-[11px] text-[#6B7A8D]">{product.stockQuantity} in stock</p>
        </div>
      </button>

      <div className="border-t border-[#E2EBF0] px-4 py-3">
        <button
          type="button"
          onClick={() => onAddToCart(product)}
          disabled={outOfStock || isAdding}
          className={[
            "inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-bold text-white transition",
            outOfStock || isAdding ? "cursor-not-allowed bg-slate-300" : "bg-[#2DD4A0] hover:bg-[#1BAF82]",
          ].join(" ")}
        >
          {isAdding ? "Adding..." : outOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}
