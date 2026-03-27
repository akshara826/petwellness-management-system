import { Product } from "../../types/marketplace";

type MarketplaceStatStripProps = {
  products: Product[];
};

const cardBase = "rounded-lg border border-[#E5E7EB] bg-white px-[18px] py-[14px]";

export default function MarketplaceStatStrip({ products }: MarketplaceStatStripProps) {
  const rows = products;
  const inStock = rows.filter((p) => p.status === "In Stock").length;
  const lowStock = rows.filter((p) => p.status === "Low Stock").length;
  const outOfStock = rows.filter((p) => p.status === "Out of Stock").length;

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article className={cardBase}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ECFDF5] text-lg">🛍️</div>
          <div>
            <p className="text-[20px] font-bold leading-none text-[#111827]">{rows.length}</p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-[#6B7280]">Total Listings</p>
          </div>
        </div>
      </article>

      <article className={cardBase}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ECFDF5] text-lg">✅</div>
          <div>
            <p className="text-[20px] font-bold leading-none text-[#111827]">{inStock}</p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-[#6B7280]">In Stock</p>
          </div>
        </div>
      </article>

      <article className={cardBase}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFFBEB] text-lg">⚠️</div>
          <div>
            <p className="text-[20px] font-bold leading-none text-[#111827]">{lowStock}</p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-[#6B7280]">Low Stock</p>
          </div>
        </div>
      </article>

      <article className={cardBase}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FEF2F2] text-lg">🚫</div>
          <div>
            <p className="text-[20px] font-bold leading-none text-[#111827]">{outOfStock}</p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-[#6B7280]">Out of Stock</p>
          </div>
        </div>
      </article>
    </section>
  );
}
