import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getUserProducts } from "../../api/services/productService";
import { useCart } from "../../context/CartContext";
import Sidebar from "../../components/dashboard/Sidebar";
import TopBar from "../../components/dashboard/TopBar";
import CategoryFilter from "../../components/user/marketplace/CategoryFilter";
import ProductCard from "../../components/user/marketplace/ProductCard";
import ProductDetailModal from "../../components/user/marketplace/ProductDetailModal";
import { useToast } from "../../components/shared/Toast";

const LIMIT = 12;

function getLoggedInName() {
  return localStorage.getItem("userName") || "Pet Parent";
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-[#E2EBF0] bg-white shadow-[0_2px_8px_rgba(26,35,50,0.06)]">
      <div className="h-40 animate-pulse bg-slate-200" />
      <div className="space-y-3 px-4 py-4">
        <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="border-t border-[#E2EBF0] px-4 py-3">
        <div className="h-10 animate-pulse rounded-full bg-slate-200" />
      </div>
    </div>
  );
}

export default function UserMarketplace() {
  const { addItem, cartItemCount } = useCart();
  const { showToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [addingProductId, setAddingProductId] = useState(null);

  const ownerName = useMemo(() => getLoggedInName(), []);
  const owner = useMemo(
    () => ({
      name: ownerName,
      avatar: ownerName.charAt(0).toUpperCase() || "P",
    }),
    [ownerName]
  );

  const navItems = useMemo(
    () => [
      { label: "Dashboard", icon: "🏠", to: "/user-dashboard", section: "MAIN" },
      { label: "My Pets", icon: "🐶", to: "/pets", section: "MAIN" },
      { label: "Appointments", icon: "📅", to: "/appointments", section: "MAIN" },
      { label: "Marketplace", icon: "🛍️", to: "/marketplace", activeRoute: true, section: "MORE" },
      { label: "Cart", icon: "🛒", to: "/cart", section: "MORE" },
      { label: "My Orders", icon: "📦", to: "/my-orders", section: "MORE" },
    ],
    []
  );

  const fetchProducts = async ({ nextOffset = 0, append = false, category = selectedCategory } = {}) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError("");
    }

    try {
      const nextProducts = await getUserProducts({
        offset: nextOffset,
        limit: LIMIT,
        ...(category !== "ALL" ? { category } : {}),
      });
      setProducts((current) => (append ? [...current, ...nextProducts] : nextProducts));
      setOffset(nextOffset);
      setHasMore(nextProducts.length === LIMIT);
    } catch (err) {
      setError(err?.message || "Failed to load products.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchProducts({ nextOffset: 0, append: false, category: selectedCategory });
  }, [selectedCategory]);

  const filteredProducts = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) => product.productName.toLowerCase().includes(term));
  }, [products, searchQuery]);

  const handleAddToCart = async (product, quantity = 1) => {
    setAddingProductId(product.id);
    try {
      await addItem(product.id, quantity);
      showToast("✓ Added to cart!", "success");
      if (selectedProduct?.id === product.id) {
        setSelectedProduct(null);
      }
    } catch (err) {
      showToast(err?.message || "Failed to add item to cart.", "error");
    } finally {
      setAddingProductId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#EBF4F8] text-[#1A2332]">
      <Sidebar user={owner} navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="px-4 pb-8 pt-5 md:ml-[260px] md:p-7">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5">
          <TopBar
            variant="page"
            title="Marketplace"
            subtitle="Shop for your pets"
            onOpenSidebar={() => setSidebarOpen(true)}
            actions={
              <>
                <div className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E2EBF0] bg-white text-lg text-[#1A2332] shadow-[0_2px_8px_rgba(26,35,50,0.06)]">
                  🛒
                  {cartItemCount > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2DD4A0] px-1 text-[10px] font-bold text-white">
                      {cartItemCount > 99 ? "99+" : cartItemCount}
                    </span>
                  ) : null}
                </div>
                <Link
                  to="/cart"
                  className="inline-flex items-center rounded-full bg-[#2DD4A0] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#1BAF82]"
                >
                  View Cart
                </Link>
              </>
            }
          />

          <section className="rounded-[20px] border border-[#E2EBF0] bg-white p-4 shadow-[0_2px_8px_rgba(26,35,50,0.06)] sm:p-5">
            <CategoryFilter selectedCategory={selectedCategory} onChange={setSelectedCategory} />
            <div className="mt-4 flex items-center rounded-full border border-[#E2EBF0] bg-[#EBF4F8] px-4 py-3">
              <span className="mr-3 text-sm text-[#6B7A8D]">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search products..."
                className="w-full bg-transparent text-sm text-[#1A2332] placeholder:text-[#6B7A8D] focus:outline-none"
              />
            </div>
          </section>

          {loading ? (
            <section className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
              {Array.from({ length: 8 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </section>
          ) : error ? (
            <section className="rounded-[20px] border border-[#E2EBF0] bg-white px-6 py-10 text-center shadow-[0_2px_8px_rgba(26,35,50,0.06)]">
              <div className="text-4xl">😕</div>
              <p className="mt-3 text-sm font-semibold text-[#1A2332]">{error}</p>
              <button
                type="button"
                onClick={() => fetchProducts({ nextOffset: 0, append: false })}
                className="mt-4 rounded-full bg-[#2DD4A0] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#1BAF82]"
              >
                Try Again
              </button>
            </section>
          ) : filteredProducts.length === 0 ? (
            <section className="rounded-[20px] border border-[#E2EBF0] bg-white px-6 py-10 text-center shadow-[0_2px_8px_rgba(26,35,50,0.06)]">
              <div className="text-4xl">🛍️</div>
              <h2 className="mt-3 text-lg font-bold text-[#1A2332]">No products found</h2>
              <p className="mt-1 text-sm text-[#6B7A8D]">Try a different category</p>
            </section>
          ) : (
            <>
              <section className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpen={() => setSelectedProduct(product)}
                    onAddToCart={handleAddToCart}
                    isAdding={addingProductId === product.id}
                  />
                ))}
              </section>

              {hasMore ? (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => fetchProducts({ nextOffset: offset + LIMIT, append: true })}
                    disabled={loadingMore}
                    className="rounded-full border border-[#E2EBF0] bg-white px-5 py-2.5 text-sm font-bold text-[#1A2332] shadow-[0_2px_8px_rgba(26,35,50,0.06)] transition hover:border-[#2DD4A0] hover:text-[#1BAF82] disabled:cursor-not-allowed"
                  >
                    {loadingMore ? "Loading..." : "Load More"}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </main>

      <ProductDetailModal
        key={selectedProduct?.id ?? "marketplace-product-modal"}
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        isAdding={addingProductId === selectedProduct?.id}
      />
    </div>
  );
}
