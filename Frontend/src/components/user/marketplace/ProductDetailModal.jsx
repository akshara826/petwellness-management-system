import { useEffect, useState } from "react";

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

export default function ProductDetailModal({ product, isOpen, onClose, onAddToCart, isAdding }) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const outOfStock = product.status === "OUT_OF_STOCK";

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(26,35,50,0.45)] p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[88vh] w-full max-w-[600px] overflow-y-auto rounded-[20px] bg-white p-5 shadow-[0_20px_40px_rgba(26,35,50,0.18)] animate-[fadeUp_0.25s_ease]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#EBF4F8] text-lg text-[#6B7A8D] transition hover:bg-[#FEE2E2] hover:text-[#F87171]"
        >
          ×
        </button>

        <div className="grid gap-5 md:grid-cols-[1fr_1.1fr]">
          <div className="overflow-hidden rounded-xl bg-[#D0F5EB]">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.productName} className="aspect-square h-full w-full object-cover" />
            ) : (
              <div className="flex aspect-square items-center justify-center text-6xl">{getCategoryEmoji(product.category)}</div>
            )}
          </div>

          <div className="space-y-4 pt-6 md:pt-0">
            <span className="inline-flex rounded-full bg-[#D0F5EB] px-3 py-1 text-xs font-bold text-[#1BAF82]">
              {formatCategory(product.category)}
            </span>
            <p className="text-xs text-[#6B7A8D]">{product.brand}</p>
            <h2 className="text-[22px] font-extrabold text-[#1A2332]">{product.productName}</h2>
            <p className="text-[26px] font-extrabold text-[#2DD4A0]">₹{product.price.toFixed(2)}</p>
            <div className="border-t border-[#E2EBF0]" />
            <p className="text-xs text-[#6B7A8D]">{product.stockQuantity} units available</p>
            <p className="text-sm leading-7 text-[#1A2332]">{product.description}</p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                disabled={quantity <= 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#2DD4A0] text-[#1BAF82] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
              >
                −
              </button>
              <span className="min-w-8 text-center text-sm font-bold text-[#1A2332]">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.min(product.stockQuantity || 1, current + 1))}
                disabled={quantity >= product.stockQuantity}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#2DD4A0] text-[#1BAF82] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
              >
                +
              </button>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onAddToCart(product, quantity)}
                disabled={outOfStock || isAdding}
                className={[
                  "inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-bold text-white transition",
                  outOfStock || isAdding ? "cursor-not-allowed bg-slate-300" : "bg-[#2DD4A0] hover:bg-[#1BAF82]",
                ].join(" ")}
              >
                {isAdding ? "Adding..." : outOfStock ? "Out of Stock" : "Add to Cart"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex w-full items-center justify-center rounded-full border border-[#E2EBF0] px-4 py-3 text-sm font-semibold text-[#1A2332] transition hover:border-[#2DD4A0] hover:text-[#1BAF82]"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
