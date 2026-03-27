import { Category, Product, ProductStatus } from "../../types/marketplace";

type ProductGridProps = {
  products: Product[];
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

const categoryClasses: Record<Category, string> = {
  Food: "bg-[#ECFDF5] text-[#065F46]",
  Toys: "bg-[#EFF6FF] text-[#1E40AF]",
  Grooming: "bg-[#FCE7F3] text-[#9D174D]",
  Medicines: "bg-[#FEF2F2] text-[#991B1B]",
  Accessories: "bg-[#F5F3FF] text-[#5B21B6]",
};

const statusClasses: Record<ProductStatus, string> = {
  "In Stock": "bg-[#ECFDF5]/95 text-[#065F46]",
  "Low Stock": "bg-[#FFFBEB]/95 text-[#92400E]",
  "Out of Stock": "bg-[#FEF2F2]/95 text-[#991B1B]",
  Inactive: "bg-[#F3F4F6]/95 text-[#374151]",
};

export default function ProductGrid({ products, onView, onEdit, onDelete }: ProductGridProps) {
  if (!products.length) {
    return (
      <div className="rounded-lg border border-[#E5E7EB] bg-white py-16 text-center">
        <p className="text-4xl">📦</p>
        <p className="mt-3 text-sm font-semibold text-[#111827]">No products found</p>
        <p className="mt-1 text-xs text-[#6B7280]">Try adjusting filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[14px]">
      {products.map((product, index) => (
        <article
          key={product.id}
          onClick={() => onView(product)}
          className="group opacity-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-lg animate-[fadeSlideUp_0.35s_ease_forwards]"
          style={{ animationDelay: `${index * 45}ms` }}
        >
          <div className="relative h-[150px]">
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
            <span
              className={`absolute right-2 top-2 rounded-full px-2 py-1 text-[10px] font-semibold backdrop-blur ${statusClasses[product.status]}`}
            >
              {product.status}
            </span>
            <span
              className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-semibold ${categoryClasses[product.category]}`}
            >
              {product.category}
            </span>
          </div>
          <div className="p-[12px] px-[14px]">
            <p className="truncate text-[13px] font-semibold text-[#111827]">{product.name}</p>
            <p className="mt-1 text-base font-bold text-[#0D9488]">₹{product.price}</p>
            <p className="mt-1 text-[11px] text-[#6B7280]">{product.stock} units available</p>
            <div className="mt-3 flex items-center gap-2 border-t border-[#E5E7EB] pt-[10px]">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(product);
                }}
                className="flex-1 rounded-lg bg-[#0D9488] px-2 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[#0B7E75]"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(product);
                }}
                className="rounded-lg border border-[#E5E7EB] px-2 py-1.5 text-[12px] transition hover:bg-[#FEF2F2]"
                aria-label={`Delete ${product.name}`}
              >
                🗑
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
