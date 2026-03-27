import OrderStatusBadge from "./OrderStatusBadge";

function formatMoney(value) {
  return `Rs ${Number(value || 0).toFixed(2)}`;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function firstAddressLine(address) {
  return String(address || "").split(",")[0] || "-";
}

export default function OrderCard({ order, onViewDetails, onCancel }) {
  const items = Array.isArray(order.items) ? order.items : [];
  const previewItems = items.slice(0, 2);
  const extraCount = Math.max(0, items.length - 2);

  return (
    <article className="overflow-hidden rounded-[20px] border border-[#E2EBF0] bg-white shadow-[0_2px_8px_rgba(26,35,50,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E2EBF0] px-[18px] py-4">
        <div>
          <h3 className="text-[14px] font-extrabold text-[#1A2332]">Order #{order.id}</h3>
          <p className="mt-0.5 text-[11px] text-[#6B7A8D]">{formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="px-[18px] py-[14px]">
        <div className="flex flex-wrap gap-2">
          {previewItems.map((item) => (
            <span
              key={item.id}
              className="rounded-full bg-[#EBF4F8] px-3 py-1 text-[11px] font-semibold text-[#6B7A8D]"
            >
              {item.productName}
            </span>
          ))}
          {extraCount > 0 ? (
            <span className="rounded-full bg-[#D0F5EB] px-3 py-1 text-[11px] font-semibold text-[#1BAF82]">
              +{extraCount} more
            </span>
          ) : null}
        </div>

        <div className="mt-[10px] flex flex-wrap gap-4">
          <p className="text-[13px] font-bold text-[#1A2332]">{"\uD83D\uDCB0"} {formatMoney(order.totalAmount)}</p>
          <p className="text-[12px] text-[#6B7A8D]">{"\uD83D\uDCE6"} {items.length} items</p>
          <p className="max-w-full truncate text-[12px] text-[#6B7A8D]">{"\uD83D\uDCCD"} {firstAddressLine(order.shippingAddress)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2EBF0] px-[18px] py-3">
        <button
          type="button"
          onClick={onViewDetails}
          className="text-[13px] font-semibold text-[#1BAF82] transition hover:text-[#15956E]"
        >
          View Details {"\u2192"}
        </button>

        {order.status === "PENDING_PAYMENT" ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-[#F87171] px-4 py-2 text-[12px] font-bold text-[#F87171] transition hover:bg-[#FEE2E2]"
          >
            Cancel Order
          </button>
        ) : null}
      </div>
    </article>
  );
}
