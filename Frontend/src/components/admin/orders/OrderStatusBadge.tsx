import type { OrderStatus } from "../../../api/services/adminOrderService";

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "bg-[#FEF3C7] text-[#92400E]",
  PAID: "bg-[#DAEAF8] text-[#1E6FD9]",
  PROCESSING: "bg-[#EDE9FE] text-[#7C3AED]",
  SHIPPED: "bg-[#D0F5EB] text-[#1BAF82]",
  DELIVERED: "bg-[#D1FAE5] text-[#065F46]",
  CANCELLED: "bg-[#FEE2E2] text-[#991B1B]",
  FAILED: "bg-[#FEE2E2] text-[#991B1B]",
};

function labelForStatus(status: OrderStatus) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

type Props = {
  status: OrderStatus;
};

export default function OrderStatusBadge({ status }: Props) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}>{labelForStatus(status)}</span>;
}
