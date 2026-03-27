import API from "../api";
import { Category, Product, ProductStatus } from "../../types/marketplace";

const PAGE_SIZE = 100;

const categoryToApiMap: Record<Category, string> = {
  Food: "FOOD",
  Toys: "TOYS",
  Grooming: "GROOMING",
  Medicines: "HEALTH",
  Accessories: "ACCESSORIES",
};

const apiToCategoryMap: Record<string, Category> = {
  FOOD: "Food",
  TOYS: "Toys",
  GROOMING: "Grooming",
  HEALTH: "Medicines",
  ACCESSORIES: "Accessories",
};

type ProductDto = {
  id: number;
  productName?: string;
  description?: string;
  price?: number | string;
  category?: string;
  brand?: string;
  stockQuantity?: number;
  status?: string;
  image?: string;
  createdAt?: string;
};

export type AdminProductInput = {
  name: string;
  category: Category;
  price: number;
  stock: number;
  description: string;
  brand?: string;
};

function resolveMediaUrl(rawUrl?: string) {
  if (!rawUrl) return "";
  if (/^https?:\/\//i.test(rawUrl) || rawUrl.startsWith("blob:") || rawUrl.startsWith("data:")) {
    return rawUrl;
  }

  const baseUrl = String(API.defaults.baseURL || "");
  const apiRoot = baseUrl.replace(/\/api\/?$/, "");
  if (rawUrl.startsWith("/")) {
    return `${apiRoot}${rawUrl}`;
  }
  return rawUrl;
}

function deriveStatus(stock: number, rawStatus?: string): ProductStatus {
  if (rawStatus === "INACTIVE") {
    return "Inactive";
  }
  if (rawStatus === "OUT_OF_STOCK" || stock === 0) {
    return "Out of Stock";
  }
  if (stock <= 5) {
    return "Low Stock";
  }
  return "In Stock";
}

function normalizeCreatedAt(rawValue?: string) {
  if (!rawValue) {
    return new Date().toISOString();
  }

  const parsed = new Date(rawValue);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function normalizeProduct(dto: ProductDto): Product {
  const stock = Number(dto.stockQuantity || 0);
  return {
    id: Number(dto.id),
    name: dto.productName || "",
    description: dto.description || "",
    price: Number(dto.price || 0),
    category: apiToCategoryMap[dto.category || "FOOD"] || "Food",
    brand: dto.brand || "Pet Wellness",
    stock,
    status: deriveStatus(stock, dto.status),
    imageUrl: resolveMediaUrl(dto.image),
    createdDate: normalizeCreatedAt(dto.createdAt),
  };
}

function buildFormData(input: AdminProductInput, imageFile?: File | null) {
  const formData = new FormData();
  formData.append("productName", input.name.trim());
  formData.append("description", input.description.trim());
  formData.append("price", String(input.price));
  formData.append("category", categoryToApiMap[input.category]);
  formData.append("stockQuantity", String(input.stock));
  formData.append("brand", (input.brand || "Pet Wellness").trim());

  if (imageFile) {
    formData.append("image", imageFile);
  }

  return formData;
}

export async function getAdminProducts() {
  const products: Product[] = [];
  let page = 0;

  while (true) {
    const response = await API.get("/admin/products/all", {
      params: {
        offset: page,
        limit: PAGE_SIZE,
      },
    });

    const nextBatch = Array.isArray(response.data) ? response.data.map(normalizeProduct) : [];
    products.push(...nextBatch);

    if (nextBatch.length < PAGE_SIZE) {
      break;
    }

    page += 1;
  }

  return products;
}

export async function createAdminProduct(input: AdminProductInput, imageFile: File) {
  const response = await API.post("/admin/products/add", buildFormData(input, imageFile));

  return normalizeProduct(response.data);
}

export async function updateAdminProduct(productId: number, input: AdminProductInput, imageFile?: File | null) {
  const response = await API.patch(`/admin/products/update/${productId}`, buildFormData(input, imageFile));

  return normalizeProduct(response.data);
}

export async function deleteAdminProduct(productId: number) {
  await API.delete(`/admin/products/delete/${productId}`);
}
