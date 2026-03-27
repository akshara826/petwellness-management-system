import { Category, Product, ProductStatus } from "../../types/marketplace";

type ProductTableProps = {
  products: Product[];
  totalCount: number;
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
  "In Stock": "bg-[#ECFDF5] text-[#065F46]",
  "Low Stock": "bg-[#FFFBEB] text-[#92400E]",
  "Out of Stock": "bg-[#FEF2F2] text-[#991B1B]",
  Inactive: "bg-[#F3F4F6] text-[#374151]",
};

const statusDots: Record<ProductStatus, string> = {
  "In Stock": "bg-[#10B981]",
  "Low Stock": "bg-[#F59E0B]",
  "Out of Stock": "bg-[#EF4444]",
  Inactive: "bg-[#6B7280]",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function ProductTable({
  products,
  totalCount,
  onView,
  onEdit,
  onDelete,
}: ProductTableProps) {
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
    <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full">
          <thead className="bg-[#F9FAFB]">
            <tr className="border-b border-[#E5E7EB]">
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                No.
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                Image
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                Product
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                Category
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                Price
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                Stock
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                Status
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                Created
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr
                key={product.id}
                className="opacity-0 border-b border-[#E5E7EB] bg-white transition hover:bg-[#F9FFFE] animate-[fadeSlideUp_0.35s_ease_forwards]"
                style={{ animationDelay: `${index * 45}ms` }}
              >
                <td className="px-3 py-3 text-[13px] font-semibold text-[#6B7280]">{index + 1}</td>
                <td className="px-3 py-3">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-11 w-11 rounded-lg border border-[#E5E7EB] object-cover"
                  />
                </td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    onClick={() => onView(product)}
                    className="text-left"
                  >
                    <p className="text-[13px] font-semibold text-[#111827] hover:text-[#0D9488]">{product.name}</p>
                    <p className="mt-1 text-[11px] text-[#6B7280]">#{product.id}</p>
                  </button>
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${categoryClasses[product.category]}`}
                  >
                    {product.category}
                  </span>
                </td>
                <td className="px-3 py-3 text-[13px] font-bold text-[#111827]">₹{product.price}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-semibold text-[#111827]">{product.stock}</p>
                    {product.stock > 0 && product.stock <= 5 ? (
                      <span className="rounded-full bg-[#FFFBEB] px-2 py-0.5 text-[10px] font-semibold text-[#92400E]">
                        Low
                      </span>
                    ) : null}
                    {product.stock === 0 ? (
                      <span className="rounded-full bg-[#FEF2F2] px-2 py-0.5 text-[10px] font-semibold text-[#991B1B]">
                        Out
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[11px] text-[#6B7280]">units</p>
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClasses[product.status]}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusDots[product.status]}`} />
                    {product.status}
                  </span>
                </td>
                <td className="px-3 py-3 text-[12px] text-[#6B7280]">{formatDate(product.createdDate)}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(product);
                      }}
                      className="h-8 w-8 rounded-lg border border-[#E5E7EB] text-sm transition hover:bg-[#CCFBF1]"
                      aria-label={`Edit ${product.name}`}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(product);
                      }}
                      className="h-8 w-8 rounded-lg border border-[#E5E7EB] text-sm transition hover:bg-[#FEF2F2]"
                      aria-label={`Delete ${product.name}`}
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="border-t border-[#E5E7EB] px-4 py-3 text-[12px] text-[#6B7280]">
        Showing {products.length} of {totalCount} products
      </footer>
    </div>
  );
}
