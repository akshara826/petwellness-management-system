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

function normalizeCartItem(dto) {
  return {
    id: dto.id,
    productId: dto.productId,
    productName: dto.productName || "",
    price: Number(dto.price || 0),
    imageUrl: resolveMediaUrl(dto.image),
    quantity: Number(dto.quantity || 0),
    lineTotal: Number(dto.lineTotal || 0),
    status: dto.status || "INACTIVE",
    brand: dto.brand || "",
    category: dto.category || "",
  };
}

function normalizeCart(dto) {
  const items = Array.isArray(dto?.items) ? dto.items.map(normalizeCartItem) : [];
  return {
    items,
    totalAmount: Number(dto?.totalAmount || 0),
  };
}

export async function getCart() {
  const response = await API.get("/cart");
  return normalizeCart(response.data);
}

export async function addToCart(productId, quantity) {
  const response = await API.post("/cart/items", { productId, quantity });
  return normalizeCart(response.data);
}

export async function updateCartItem(itemId, quantity) {
  const response = await API.patch(`/cart/items/${itemId}`, { quantity });
  return normalizeCart(response.data);
}

export async function removeCartItem(itemId) {
  const response = await API.delete(`/cart/items/${itemId}`);
  return normalizeCart(response.data);
}

export async function checkout(shippingAddress, pincode) {
  const response = await API.post("/cart/checkout", { shippingAddress, pincode });
  return response.data;
}
