function statusClass(type) {
  if (type === "green") return "bg-app-green-light text-[#047857]";
  if (type === "yellow") return "bg-app-yellow-light text-[#92400E]";
  return "bg-app-bg text-app-slate";
}

export default function RecentOrders({ orders }) {
  return (
    <section className="rounded-2xl border border-app-border bg-app-card shadow-sm">
      <div className="flex items-center justify-between px-5 pb-0 pt-5">
        <h3 className="text-base font-bold text-app-navy">Recent Orders</h3>
        <button
          type="button"
          className="rounded-full border border-app-teal px-3 py-1 text-xs font-bold text-app-teal transition duration-200 hover:bg-app-teal hover:text-white"
        >
          All Orders
        </button>
      </div>
      <div className="space-y-2.5 px-5 pb-5 pt-4">
        {orders.map((order) => (
          <article key={order.id} className="flex items-center gap-3 rounded-xl border border-app-border bg-app-bg p-3">
            <span className="text-2xl">{order.emoji}</span>
            <div>
              <p className="text-[13px] font-bold text-app-navy">{order.name}</p>
              <p className="text-[11px] text-app-slate">{order.date}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm font-bold text-app-navy">{order.price}</p>
              <span className={["inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold", statusClass(order.statusType)].join(" ")}>
                {order.status}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
