export default function CartItemRow({ item, isBusy, onIncrease, onDecrease, onRemove }) {
  const outOfStock = item.status === "OUT_OF_STOCK";

  return (
    <div className="border-b border-[#E2EBF0] px-5 py-4 last:border-b-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="h-[52px] w-[52px] overflow-hidden rounded-lg bg-[#D0F5EB]">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-lg">🛍️</div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1A2332]">{item.productName}</h3>
            <p className="text-[11px] text-[#6B7A8D]">{item.brand || item.category || `Product #${item.productId}`}</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-between gap-3 sm:justify-end">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDecrease}
              disabled={isBusy}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#2DD4A0] text-[#1BAF82] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
            >
              {isBusy ? "…" : "−"}
            </button>
            <span className="min-w-6 text-center text-sm font-bold text-[#1A2332]">{item.quantity}</span>
            <button
              type="button"
              onClick={onIncrease}
              disabled={isBusy || outOfStock}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#2DD4A0] text-[#1BAF82] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
            >
              +
            </button>
          </div>

          <p className="min-w-[84px] text-right text-sm font-bold text-[#1A2332]">₹{item.lineTotal.toFixed(2)}</p>

          <button
            type="button"
            onClick={onRemove}
            disabled={isBusy}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm text-[#6B7A8D] transition hover:bg-[#FEE2E2] hover:text-[#F87171] disabled:cursor-not-allowed"
          >
            🗑
          </button>
        </div>
      </div>

      {outOfStock ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#FFF7ED] px-3 py-2 text-xs font-medium text-[#9A3412]">
          <span>⚠ Out of stock — remove to continue</span>
          <button
            type="button"
            onClick={onRemove}
            disabled={isBusy}
            className="rounded-full border border-[#F87171] px-3 py-1 text-[11px] font-bold text-[#F87171] transition hover:bg-[#FEE2E2] disabled:cursor-not-allowed"
          >
            Remove
          </button>
        </div>
      ) : null}
    </div>
  );
}
