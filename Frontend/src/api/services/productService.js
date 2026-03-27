import API from "../api";

function resolveMediaUrl(rawUrl) {
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

function normalizeProduct(dto) {
  return {
    id: dto.id,
    productName: dto.productName || "",
    description: dto.description || "",
    price: Number(dto.price || 0),
    category: dto.category || "FOOD",
    brand: dto.brand || "Pet Wellness",
    stockQuantity: Number(dto.stockQuantity || 0),
    status: dto.status || "INACTIVE",
    imageUrl: resolveMediaUrl(dto.image),
  };
}

export async function getUserProducts(params = {}) {
  const response = await API.get("/user/products", { params });
  return Array.isArray(response.data) ? response.data.map(normalizeProduct) : [];
}
