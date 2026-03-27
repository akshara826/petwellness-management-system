const STEPS = [
  { key: "PENDING_PAYMENT", label: "Pending Payment", icon: "\uD83D\uDCB3" },
  { key: "PAID", label: "Confirmed", icon: "\u2713" },
  { key: "PROCESSING", label: "Processing", icon: "\u2699\uFE0F" },
  { key: "SHIPPED", label: "Shipped", icon: "\uD83D\uDE9A" },
  { key: "DELIVERED", label: "Delivered", icon: "\uD83D\uDCE6" },
];

export default function OrderStatusTracker({ currentStatus }) {
  const currentIndex = STEPS.findIndex((step) => step.key === currentStatus);

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-[560px] items-start">
        {STEPS.map((step, index) => {
          const isCompleted = currentIndex > index;
          const isCurrent = currentIndex === index;
          const isFuture = currentIndex < index;

          return (
            <div key={step.key} className="flex flex-1 items-start">
              <div className="flex min-w-[84px] flex-col items-center text-center">
                <div
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition",
                    isCompleted
                      ? "bg-[#2DD4A0] text-white"
                      : isCurrent
                      ? "bg-[#2DD4A0] text-white shadow-[0_0_0_4px_rgba(45,212,160,0.2)]"
                      : "border border-[#E2EBF0] bg-white text-[#6B7A8D]",
                  ].join(" ")}
                >
                  {isCompleted ? "\u2713" : step.icon}
                </div>
                <span
                  className={[
                    "mt-2 text-[10px] font-semibold leading-4",
                    isFuture ? "text-[#6B7A8D]" : "text-[#1BAF82]",
                  ].join(" ")}
                >
                  {step.label}
                </span>
              </div>

              {index < STEPS.length - 1 ? (
                <div className="mt-[15px] flex-1 px-2">
                  <div className="h-[2px] overflow-hidden rounded-full bg-[#E2EBF0]">
                    <div
                      className={[
                        "h-full rounded-full bg-[#2DD4A0] transition-all duration-700 ease-out",
                        currentIndex > index ? "w-full" : "w-0",
                      ].join(" ")}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
