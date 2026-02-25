const dummyProducts = [
  { _id: 1, name: "Dog Food", price: 1200 },
  { _id: 2, name: "Cat Toy", price: 350 },
  { _id: 3, name: "Pet Shampoo", price: 499 },
];

export default function Marketplace() {
  return (
    <div className="min-h-screen bg-sky-100 px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-lg">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Pet Marketplace</h2>

        {dummyProducts.map((product) => (
          <div
            key={product._id}
            className="mb-4 flex items-center justify-between rounded-lg border bg-white p-4 text-slate-800 shadow-sm"
          >
            <span className="font-medium text-slate-900">
              {product.name} - INR {product.price}
            </span>
            <button className="rounded-full bg-sky-600 px-4 py-1 text-white hover:bg-sky-700">
              Buy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
