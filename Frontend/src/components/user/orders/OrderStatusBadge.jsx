const STATUS_STYLES = {
  PENDING_PAYMENT: {
    label: "Pending Payment",
    className: "bg-[#FEF3C7] text-[#92400E]",
  },
  PAID: {
    label: "Paid",
    className: "bg-[#DAEAF8] text-[#1E6FD9]",
  },
  PROCESSING: {
    label: "Processing",
    className: "bg-[#EDE9FE] text-[#7C3AED]",
  },
  SHIPPED: {
    label: "Shipped",
    className: "bg-[#D0F5EB] text-[#1BAF82]",
  },
  DELIVERED: {
    label: "Delivered",
    className: "bg-[#D1FAE5] text-[#065F46]",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-[#FEE2E2] text-[#991B1B]",
  },
  FAILED: {
    label: "Failed",
    className: "bg-[#FEE2E2] text-[#991B1B]",
  },
};

export default function OrderStatusBadge({ status, className = "" }) {
  const config = STATUS_STYLES[status] || {
    label: status || "Unknown",
    className: "bg-[#EBF4F8] text-[#6B7A8D]",
  };

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold",
        config.className,
        className,
      ].join(" ")}
    >
      {config.label}
    </span>
  );
}
