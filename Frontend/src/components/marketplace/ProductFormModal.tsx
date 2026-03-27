import { FormEvent, useEffect, useMemo, useState } from "react";
import { Category, Product, ProductStatus } from "../../types/marketplace";
import type { AdminProductInput } from "../../api/services/adminProductService";

type ProductFormModalProps = {
  isOpen: boolean;
  editingProduct: Product | null;
  onClose: () => void;
  onSaved: (message: string) => void;
  onRequestDelete: (product: Product) => void;
  onSubmit: (payload: AdminProductInput, imageFile: File | null, productId?: number) => Promise<void>;
};

type FormState = {
  name: string;
  category: Category | "";
  price: string;
  stock: string;
  description: string;
};

type FormErrors = Partial<Record<keyof FormState | "image", string>>;

const emptyForm: FormState = {
  name: "",
  category: "",
  price: "",
  stock: "",
  description: "",
};

const inputBase =
  "w-full rounded-lg border-[1.5px] border-[#E5E7EB] bg-[#F9FAFB] px-3 py-[9px] text-[13px] text-[#111827] outline-none transition focus:border-[#0D9488] focus:bg-white focus:shadow-[0_0_0_3px_rgba(13,148,136,.1)]";

const getStatus = (stock: number): ProductStatus =>
  stock === 0 ? "Out of Stock" : stock <= 5 ? "Low Stock" : "In Stock";

const statusBadgeClass: Record<ProductStatus, string> = {
  "In Stock": "bg-[#ECFDF5] text-[#065F46]",
  "Low Stock": "bg-[#FFFBEB] text-[#92400E]",
  "Out of Stock": "bg-[#FEF2F2] text-[#991B1B]",
  Inactive: "bg-[#F3F4F6] text-[#374151]",
};

const categoryBadgeClass: Record<Category, string> = {
  Food: "bg-[#ECFDF5] text-[#065F46]",
  Toys: "bg-[#EFF6FF] text-[#1E40AF]",
  Grooming: "bg-[#FCE7F3] text-[#9D174D]",
  Medicines: "bg-[#FEF2F2] text-[#991B1B]",
  Accessories: "bg-[#F5F3FF] text-[#5B21B6]",
};

export default function ProductFormModal({
  isOpen,
  editingProduct,
  onClose,
  onSaved,
  onRequestDelete,
  onSubmit,
}: ProductFormModalProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    if (editingProduct) {
      setForm({
        name: editingProduct.name,
        category: editingProduct.category,
        price: String(editingProduct.price),
        stock: String(editingProduct.stock),
        description: editingProduct.description,
      });
      setImagePreview(editingProduct.imageUrl);
      setImageFile(null);
    } else {
      setForm(emptyForm);
      setImagePreview("");
      setImageFile(null);
    }
    setErrors({});
    setIsSaving(false);
  }, [isOpen, editingProduct]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const stockValue = Number(form.stock || 0);
  const autoStatus = useMemo(() => getStatus(Number.isNaN(stockValue) ? 0 : stockValue), [stockValue]);
  const descriptionCount = form.description.length;

  if (!isOpen) {
    return null;
  }

  const setField = <T extends keyof FormState>(field: T, value: FormState[T]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const applyFile = (file: File | null) => {
    if (!file) {
      return;
    }
    const validType = ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type);
    if (!validType || file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "Upload JPG/PNG/WEBP up to 10MB." }));
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const validate = () => {
    const next: FormErrors = {};
    const trimmedName = form.name.trim();
    const trimmedDescription = form.description.trim();
    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!trimmedName) {
      next.name = "Product name is required.";
    }
    if (!form.category) {
      next.category = "Category is required.";
    }
    if (!form.price || Number.isNaN(price) || price <= 0) {
      next.price = "Price must be greater than 0.";
    }
    if (form.stock === "" || Number.isNaN(stock) || stock < 0) {
      next.stock = editingProduct ? "Stock must be 0 or more." : "Stock must be greater than 0.";
    }
    if (!editingProduct && stock === 0) {
      next.stock = "New products must start with stock greater than 0.";
    }
    if (!trimmedDescription || trimmedDescription.length < 10) {
      next.description = "Description must be at least 10 characters.";
    }
    if (!editingProduct && !imagePreview) {
      next.image = "Product image is required.";
    }
    if (editingProduct && !imagePreview) {
      next.image = "Upload a replacement image or keep the current one.";
    }

    setErrors(next);
    return { valid: Object.keys(next).length === 0, trimmedName, trimmedDescription, price, stock };
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const check = validate();
    if (!check.valid) {
      return;
    }
    setIsSaving(true);

    try {
      await onSubmit(
        {
          name: check.trimmedName,
          category: form.category as Category,
          price: check.price,
          stock: check.stock,
          description: check.trimmedDescription,
          brand: editingProduct?.brand || "Pet Wellness",
        },
        imageFile,
        editingProduct?.id
      );
      onSaved(editingProduct ? "Product updated successfully." : "Product added successfully.");
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[#111827]/40 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-2xl animate-[modalPop_0.2s_ease_forwards]"
      >
        <header className="border-b border-[#E5E7EB] px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#111827]">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <p className="text-[12px] text-[#6B7280]">
                {editingProduct ? "Update product information" : "Fill in details"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-lg border border-[#E5E7EB] text-sm transition hover:bg-[#FEF2F2]"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </header>

        <div className="max-h-[calc(85vh-132px)] overflow-y-auto p-5">
          <div className="grid gap-5 md:grid-cols-[1fr_280px]">
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">Basic Details</span>
                <span className="h-px flex-1 bg-[#E5E7EB]" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[12px] font-semibold text-[#111827]">
                    Product Name <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={(event) => setField("name", event.target.value)}
                    placeholder="e.g. Premium Dog Food"
                    className={`${inputBase} ${errors.name ? "border-[#EF4444]" : ""}`}
                  />
                  {errors.name ? <p className="mt-1 text-[11px] text-[#DC2626]">{errors.name}</p> : null}
                </div>

                <div>
                  <label className="mb-1 block text-[12px] font-semibold text-[#111827]">
                    Category <span className="text-[#DC2626]">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(event) => setField("category", event.target.value as Category)}
                    className={`${inputBase} ${errors.category ? "border-[#EF4444]" : ""}`}
                  >
                    <option value="">Select category</option>
                    <option value="Food">Food</option>
                    <option value="Toys">Toys</option>
                    <option value="Grooming">Grooming</option>
                    <option value="Medicines">Medicines</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                  {errors.category ? <p className="mt-1 text-[11px] text-[#DC2626]">{errors.category}</p> : null}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[12px] font-semibold text-[#111827]">
                    Price (₹) <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#6B7280]">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(event) => setField("price", event.target.value)}
                      className={`${inputBase} pl-7 ${errors.price ? "border-[#EF4444]" : ""}`}
                    />
                  </div>
                  {errors.price ? <p className="mt-1 text-[11px] text-[#DC2626]">{errors.price}</p> : null}
                </div>

                <div>
                  <label className="mb-1 block text-[12px] font-semibold text-[#111827]">
                    Stock Quantity <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(event) => setField("stock", event.target.value)}
                    className={`${inputBase} ${errors.stock ? "border-[#EF4444]" : ""}`}
                  />
                  <p className="mt-1 text-[10px] text-[#6B7280]">
                    {editingProduct ? "Set 0 for out of stock" : "New products require stock above 0"}
                  </p>
                  {errors.stock ? <p className="mt-1 text-[11px] text-[#DC2626]">{errors.stock}</p> : null}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[12px] font-semibold text-[#111827]">
                  Description <span className="text-[#DC2626]">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(event) => setField("description", event.target.value.slice(0, 500))}
                  className={`${inputBase} min-h-[90px] resize-y ${errors.description ? "border-[#EF4444]" : ""}`}
                  maxLength={500}
                />
                <div className="mt-1 flex justify-between">
                  {errors.description ? (
                    <p className="text-[11px] text-[#DC2626]">{errors.description}</p>
                  ) : (
                    <span />
                  )}
                  <p className="text-[10px] text-[#6B7280]">{descriptionCount}/500</p>
                </div>
              </div>
            </section>

            <aside className="space-y-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">Product Image</p>
                <label
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragging(false);
                    applyFile(event.dataTransfer.files?.[0] ?? null);
                  }}
                  className={`relative mt-2 flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed text-center transition ${
                    errors.image
                      ? "border-[#EF4444] bg-[#FEF2F2]"
                      : dragging
                        ? "border-[#0D9488] bg-[#CCFBF1]"
                        : "border-[#E5E7EB] bg-[#F9FAFB] hover:border-[#0D9488] hover:bg-[#CCFBF1]"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/png,image/jpg,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(event) => applyFile(event.target.files?.[0] ?? null)}
                  />
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1 text-[10px] font-medium text-white">
                        ✓ Selected · Click to change
                      </div>
                      <button
                        type="button"
                        className="absolute right-2 top-2 h-6 w-6 rounded-full bg-white text-[11px] shadow"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setImagePreview("");
                          setImageFile(null);
                        }}
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <div className="px-2">
                      <p className="text-2xl">📷</p>
                      <p className="mt-1 text-[12px] font-semibold text-[#111827]">Upload Image</p>
                      <p className="text-[11px] text-[#6B7280]">Click or drag & drop</p>
                      <p className="text-[10px] text-[#6B7280]">JPG PNG WEBP Max 10MB</p>
                    </div>
                  )}
                </label>
                {errors.image ? <p className="mt-1 text-[11px] text-[#DC2626]">{errors.image}</p> : null}
              </div>

              <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">Auto Status</p>
                <span
                  className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadgeClass[autoStatus]}`}
                >
                  {autoStatus}
                </span>
              </div>

              <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">Live Preview</p>
                <div className="mt-2 flex gap-2 rounded-lg border border-[#E5E7EB] bg-white p-2">
                  <img
                    src={imagePreview || "https://via.placeholder.com/80x80?text=No+Image"}
                    alt="Live preview"
                    className="h-14 w-14 rounded-md border border-[#E5E7EB] object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold text-[#111827]">
                      {form.name.trim() || "Product name"}
                    </p>
                    {form.category ? (
                      <span
                        className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${categoryBadgeClass[form.category]}`}
                      >
                        {form.category}
                      </span>
                    ) : null}
                    <p className="mt-1 text-[12px] font-bold text-[#0D9488]">₹{form.price || "0"}</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <footer className="sticky bottom-0 flex items-center justify-between border-t border-[#E5E7EB] bg-white px-5 py-3">
          <div>
            {editingProduct ? (
              <button
                type="button"
                onClick={() => onRequestDelete(editingProduct)}
                className="rounded-lg border border-[#FCA5A5] px-3 py-2 text-[13px] font-semibold text-[#B91C1C] transition hover:bg-[#FEF2F2]"
              >
                🗑 Delete
              </button>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-[13px] font-semibold text-[#374151] transition hover:bg-[#F9FAFB]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-[#0D9488] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#0B7E75] disabled:cursor-not-allowed disabled:opacity-75"
            >
              {isSaving ? "Saving..." : editingProduct ? "Update Product" : "Save Product"}
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}
