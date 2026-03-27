import { useEffect } from "react";
import { Product, ProductStatus } from "../../types/marketplace";

type ProductDetailModalProps = {
  product: Product | null;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

const statusClasses: Record<ProductStatus, string> = {
  "In Stock": "bg-[#ECFDF5] text-[#065F46]",
  "Low Stock": "bg-[#FFFBEB] text-[#92400E]",
  "Out of Stock": "bg-[#FEF2F2] text-[#991B1B]",
  Inactive: "bg-[#F3F4F6] text-[#374151]",
};

const categoryClasses = {
  Food: "bg-[#ECFDF5] text-[#065F46]",
  Toys: "bg-[#EFF6FF] text-[#1E40AF]",
  Grooming: "bg-[#FCE7F3] text-[#9D174D]",
  Medicines: "bg-[#FEF2F2] text-[#991B1B]",
  Accessories: "bg-[#F5F3FF] text-[#5B21B6]",
} as const;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function ProductDetailModal({ product, onClose, onEdit, onDelete }: ProductDetailModalProps) {
  useEffect(() => {
    if (!product) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [product, onClose]);

  if (!product) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[#111827]/40 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <article className="w-full max-w-lg rounded-xl border border-[#E5E7EB] bg-white shadow-2xl animate-[modalPop_0.2s_ease_forwards]">
        <header className="border-b border-[#E5E7EB] px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-bold text-[#111827]">{product.name}</h2>
              <p className="text-[12px] text-[#6B7280]">#{product.id}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-lg border border-[#E5E7EB] text-sm transition hover:bg-[#FEF2F2]"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </header>

        <div className="grid gap-4 px-5 py-4 sm:grid-cols-[180px_1fr]">
          <div>
            <img
              src={product.imageUrl}
              alt={product.name}
              className="aspect-square w-full rounded-lg border border-[#E5E7EB] object-cover"
            />
            <span
              className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClasses[product.status]}`}
            >
              {product.status}
            </span>
            <p className="mt-2 text-[12px] text-[#6B7280]">🗓 Added {formatDate(product.createdDate)}</p>
          </div>

          <div>
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${categoryClasses[product.category]}`}
            >
              {product.category}
            </span>
            <h3 className="mt-2 text-[20px] font-bold leading-tight text-[#111827]">{product.name}</h3>
            <p className="mt-1 text-[22px] font-bold text-[#0D9488]">₹{product.price}</p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">Stock</p>
                <p className="mt-1 text-[13px] font-semibold text-[#111827]">{product.stock} units</p>
              </div>
              <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">Status</p>
                <span
                  className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClasses[product.status]}`}
                >
                  {product.status}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">Description</p>
              <p className="mt-1 text-[13px] leading-[1.7] text-[#374151]">{product.description}</p>
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between border-t border-[#E5E7EB] px-5 py-3">
          <button
            type="button"
            onClick={() => onDelete(product)}
            className="rounded-lg border border-[#FCA5A5] px-3 py-2 text-[13px] font-semibold text-[#B91C1C] transition hover:bg-[#FEF2F2]"
          >
            🗑 Delete
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-[13px] font-semibold text-[#374151] transition hover:bg-[#F9FAFB]"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => onEdit(product)}
              className="rounded-lg bg-[#0D9488] px-3 py-2 text-[13px] font-semibold text-white transition hover:bg-[#0B7E75]"
            >
              ✏️ Edit Product
            </button>
          </div>
        </footer>
      </article>
    </div>
  );
}
