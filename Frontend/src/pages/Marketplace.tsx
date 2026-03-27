import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProducts,
  updateAdminProduct,
  type AdminProductInput,
} from "../api/services/adminProductService";
import DeleteConfirmModal from "../components/marketplace/DeleteConfirmModal";
import MarketplaceStatStrip from "../components/marketplace/MarketplaceStatStrip";
import ProductDetailModal from "../components/marketplace/ProductDetailModal";
import ProductFormModal from "../components/marketplace/ProductFormModal";
import ProductGrid from "../components/marketplace/ProductGrid";
import ProductTable from "../components/marketplace/ProductTable";
import Sidebar from "../components/admin/Sidebar";
import TopNavbar from "../components/admin/TopNavbar";
import { Product } from "../types/marketplace";
import { logoutUser } from "../utils/logout";

type ToastTone = "success" | "error" | "info";

type ToastItem = {
  id: string;
  message: string;
  tone: ToastTone;
};

type SortOption = "default" | "price-asc" | "price-desc" | "stock-asc" | "stock-desc" | "newest" | "oldest";

function TableViewIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-[15px] w-[15px] ${active ? "text-white" : "text-[#64748B]"}`} fill="none">
      <path d="M5 7.5H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 16.5H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function GridViewIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-[15px] w-[15px] ${active ? "text-white" : "text-[#64748B]"}`} fill="none">
      <rect x="4.5" y="4.5" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="4.5" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="4.5" y="13" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="13" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

const toastToneClasses: Record<ToastTone, string> = {
  success: "border-l-[#16A34A] text-[#166534]",
  error: "border-l-[#DC2626] text-[#991B1B]",
  info: "border-l-[#0D9488] text-[#115E59]",
};

function ToastStack({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="fixed bottom-4 right-4 z-[200] space-y-2 sm:bottom-6 sm:right-6">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`min-w-[260px] rounded-lg border border-[#E5E7EB] border-l-4 bg-white px-3 py-2 text-[13px] shadow-lg animate-[fadeIn_0.2s_ease] ${toastToneClasses[toast.tone]}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

function MarketplaceContent() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = (message: string, tone: ToastTone) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2500);
  };

  const loadProducts = async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const nextProducts = await getAdminProducts();
      setProducts(nextProducts);
    } catch (error: any) {
      setLoadError(error?.response?.data?.message || error?.message || "Failed to load products.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const handleSaveProduct = async (payload: AdminProductInput, imageFile: File | null, productId?: number) => {
    if (!imageFile && !productId) {
      throw new Error("Product image is required.");
    }

    try {
      const savedProduct = productId
        ? await updateAdminProduct(productId, payload, imageFile)
        : await createAdminProduct(payload, imageFile as File);

      setProducts((current) => {
        if (productId) {
          return current.map((product) => (product.id === savedProduct.id ? savedProduct : product));
        }
        return [savedProduct, ...current];
      });
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to save product.";
      pushToast(message, "error");
      throw error;
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    try {
      await deleteAdminProduct(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      setDeletingProduct(null);
      setViewingProduct((current) => (current?.id === product.id ? null : current));
      setEditingProduct((current) => (current?.id === product.id ? null : current));
      pushToast("Product deleted.", "error");
    } catch (error: any) {
      pushToast(error?.response?.data?.message || error?.message || "Failed to delete product.", "error");
    }
  };

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    let rows = [...products];

    if (term) {
      rows = rows.filter((product) => product.name.toLowerCase().includes(term));
    }
    if (categoryFilter !== "All") {
      rows = rows.filter((product) => product.category === categoryFilter);
    }
    if (statusFilter !== "All") {
      rows = rows.filter((product) => product.status === statusFilter);
    }

    if (sortBy === "price-asc") rows.sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") rows.sort((a, b) => b.price - a.price);
    if (sortBy === "stock-asc") rows.sort((a, b) => a.stock - b.stock);
    if (sortBy === "stock-desc") rows.sort((a, b) => b.stock - a.stock);
    if (sortBy === "newest") rows.sort((a, b) => b.createdDate.localeCompare(a.createdDate));
    if (sortBy === "oldest") rows.sort((a, b) => a.createdDate.localeCompare(b.createdDate));

    return rows;
  }, [products, search, categoryFilter, statusFilter, sortBy]);

  const statusCounts = useMemo(
    () => ({
      All: products.length,
      "In Stock": products.filter((p) => p.status === "In Stock").length,
      "Low Stock": products.filter((p) => p.status === "Low Stock").length,
      "Out of Stock": products.filter((p) => p.status === "Out of Stock").length,
      Inactive: products.filter((p) => p.status === "Inactive").length,
    }),
    [products]
  );

  return (
    <div className="min-h-screen bg-[#F0FDFA] text-[#111827]">
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        selected="marketplace"
        onSelect={(key) => {
          if (key === "marketplace") {
            navigate("/admin/marketplace");
            return;
          }
          if (key === "logout") {
            logoutUser();
            navigate("/", { replace: true });
            return;
          }
          navigate("/dashboard");
        }}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className={`min-h-screen transition-[margin] duration-300 ${sidebarCollapsed ? "lg:ml-[92px]" : "lg:ml-[270px]"}`}>
        <TopNavbar onOpenSidebar={() => setMobileSidebarOpen(true)} />

        <main className="space-y-4 px-4 py-5 sm:px-6">
          <section className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-[20px] font-bold text-[#111827]">Marketplace</h1>
              <p className="text-[13px] text-[#6B7280]">Manage pet products, stock levels, and listing details.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setAddModalOpen(true);
              }}
              className="rounded-lg bg-[#0D9488] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#0B7E75]"
            >
              + Add Product
            </button>
          </section>

          <MarketplaceStatStrip products={products} />

          <section className="rounded-lg border border-[#E5E7EB] bg-white p-1">
            <div className="flex flex-wrap gap-1">
              {(["All", "In Stock", "Low Stock", "Out of Stock", "Inactive"] as const).map((status) => {
                const active = statusFilter === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-semibold transition ${
                      active ? "bg-[#0D9488] text-white" : "text-[#374151] hover:bg-[#F0FDFA]"
                    }`}
                  >
                    <span>{status}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] ${
                        active ? "bg-white/20 text-white" : "bg-[#F3F4F6] text-[#6B7280]"
                      }`}
                    >
                      {statusCounts[status]}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search products..."
                  className="min-w-[180px] flex-1 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-[13px] outline-none focus:border-[#0D9488] focus:shadow-[0_0_0_3px_rgba(13,148,136,.1)]"
                />
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-[13px] outline-none focus:border-[#0D9488] focus:shadow-[0_0_0_3px_rgba(13,148,136,.1)]"
                >
                  <option value="All">All Categories</option>
                  <option value="Food">Food</option>
                  <option value="Toys">Toys</option>
                  <option value="Grooming">Grooming</option>
                  <option value="Medicines">Medicines</option>
                  <option value="Accessories">Accessories</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortOption)}
                  className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-[13px] outline-none focus:border-[#0D9488] focus:shadow-[0_0_0_3px_rgba(13,148,136,.1)]"
                >
                  <option value="default">Sort: Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="stock-asc">Stock: Low to High</option>
                  <option value="stock-desc">Stock: High to Low</option>
                  <option value="newest">Created: Newest</option>
                  <option value="oldest">Created: Oldest</option>
                </select>
              </div>

              <div className="inline-flex overflow-hidden rounded-[16px] border border-[#D7DCE2] bg-white p-0.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  aria-label="Table view"
                  className={`flex h-[40px] w-[48px] items-center justify-center rounded-l-[12px] transition ${
                    viewMode === "table" ? "bg-[#11998E]" : "bg-white"
                  }`}
                >
                  <TableViewIcon active={viewMode === "table"} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                  className={`flex h-[40px] w-[48px] items-center justify-center rounded-r-[12px] border-l border-[#E5E7EB] transition ${
                    viewMode === "grid" ? "bg-[#11998E]" : "bg-white"
                  }`}
                >
                  <GridViewIcon active={viewMode === "grid"} />
                </button>
              </div>
            </div>
          </section>

          {isLoading ? (
            <section className="rounded-lg border border-[#E5E7EB] bg-white py-16 text-center">
              <p className="text-sm font-semibold text-[#111827]">Loading products...</p>
            </section>
          ) : loadError ? (
            <section className="rounded-lg border border-[#E5E7EB] bg-white py-16 text-center">
              <p className="text-sm font-semibold text-[#111827]">{loadError}</p>
              <button
                type="button"
                onClick={() => void loadProducts()}
                className="mt-4 rounded-lg bg-[#0D9488] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#0B7E75]"
              >
                Retry
              </button>
            </section>
          ) : viewMode === "table" ? (
            <ProductTable
              products={filteredProducts}
              totalCount={products.length}
              onView={(product) => setViewingProduct(product)}
              onEdit={(product) => {
                setViewingProduct(null);
                setAddModalOpen(false);
                setEditingProduct(product);
              }}
              onDelete={(product) => setDeletingProduct(product)}
            />
          ) : (
            <ProductGrid
              products={filteredProducts}
              onView={(product) => setViewingProduct(product)}
              onEdit={(product) => {
                setViewingProduct(null);
                setAddModalOpen(false);
                setEditingProduct(product);
              }}
              onDelete={(product) => setDeletingProduct(product)}
            />
          )}
        </main>
      </div>

      <ProductFormModal
        isOpen={addModalOpen || Boolean(editingProduct)}
        editingProduct={editingProduct}
        onSubmit={handleSaveProduct}
        onClose={() => {
          setAddModalOpen(false);
          setEditingProduct(null);
        }}
        onSaved={(message) => pushToast(message, "success")}
        onRequestDelete={(product) => {
          setEditingProduct(null);
          setAddModalOpen(false);
          setDeletingProduct(product);
        }}
      />

      <ProductDetailModal
        product={viewingProduct}
        onClose={() => setViewingProduct(null)}
        onEdit={(product) => {
          setViewingProduct(null);
          setEditingProduct(product);
          setAddModalOpen(false);
        }}
        onDelete={(product) => {
          setViewingProduct(null);
          setDeletingProduct(product);
        }}
      />

      <DeleteConfirmModal
        product={deletingProduct}
        onCancel={() => setDeletingProduct(null)}
        onConfirm={(product) => void handleDeleteProduct(product)}
      />

      <ToastStack toasts={toasts} />
    </div>
  );
}

export default function Marketplace() {
  return <MarketplaceContent />;
}
