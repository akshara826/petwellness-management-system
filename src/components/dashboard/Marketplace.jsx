export default function Marketplace({ products }) {
  return (
    <section className="rounded-2xl border border-app-border bg-app-card shadow-sm">
      <div className="flex items-center justify-between px-5 pb-0 pt-5">
        <h3 className="text-base font-bold text-app-navy">Shop Products</h3>
        <button
          type="button"
          className="rounded-full border border-app-teal px-3 py-1 text-xs font-bold text-app-teal transition duration-200 hover:bg-app-teal hover:text-white"
        >
          Marketplace
        </button>
      </div>

      <div className="px-5 pb-5 pt-4">
        <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-color:#E2EBF0_transparent] [scrollbar-width:thin]">
          {products.map((product) => (
            <article key={product.id} className="min-w-[130px] overflow-hidden rounded-2xl border border-app-border bg-app-card">
              <div className={[
                "flex h-20 items-center justify-center rounded-t-2xl text-4xl",
                product.bgClass,
              ].join(" ")}>
                {product.emoji}
              </div>
              <div className="p-3">
                <p className="text-xs font-bold text-app-navy">{product.name}</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-sm font-bold text-app-teal">{product.price}</p>
                  <button type="button" className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-app-teal text-sm font-bold text-white">
                    +
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
