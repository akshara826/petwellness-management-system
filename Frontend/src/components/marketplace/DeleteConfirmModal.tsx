import { useEffect } from "react";
import { Product } from "../../types/marketplace";

type DeleteConfirmModalProps = {
  product: Product | null;
  onCancel: () => void;
  onConfirm: (product: Product) => void;
};

const categoryClasses = {
  Food: "bg-[#ECFDF5] text-[#065F46]",
  Toys: "bg-[#EFF6FF] text-[#1E40AF]",
  Grooming: "bg-[#FCE7F3] text-[#9D174D]",
  Medicines: "bg-[#FEF2F2] text-[#991B1B]",
  Accessories: "bg-[#F5F3FF] text-[#5B21B6]",
} as const;

export default function DeleteConfirmModal({ product, onCancel, onConfirm }: DeleteConfirmModalProps) {
  useEffect(() => {
    if (!product) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [product, onCancel]);

  if (!product) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-[#111827]/45 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <article className="w-full max-w-sm rounded-xl border border-[#E5E7EB] bg-white p-5 text-center shadow-2xl animate-[modalPop_0.2s_ease_forwards]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF2F2] text-2xl">🗑</div>
        <h2 className="mt-3 text-[17px] font-bold text-[#111827]">Delete Product?</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-[#6B7280]">
          Are you sure you want to delete "{product.name}"? This cannot be undone.
        </p>

        <div className="mt-4 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-2.5">
          <div className="flex items-center gap-2 text-left">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-[38px] w-[38px] rounded-md border border-[#E5E7EB] object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold text-[#111827]">{product.name}</p>
              <span
                className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${categoryClasses[product.category]}`}
              >
                {product.category}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={() => onConfirm(product)}
            className="w-full rounded-lg bg-[#DC2626] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#B91C1C]"
          >
            Yes, Delete Product
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2 text-[13px] font-semibold text-[#374151] transition hover:bg-[#F9FAFB]"
          >
            Cancel
          </button>
        </div>
      </article>
    </div>
  );
}
