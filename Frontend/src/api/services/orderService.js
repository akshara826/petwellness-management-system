import API from "../api";

export const getMyOrders = async () => {
  const res = await API.get("/orders/my");
  return res.data;
};

export const getOrderById = async (orderId) => {
  const res = await API.get(`/orders/${orderId}`);
  return res.data;
};

export const cancelOrder = async (orderId, reason = "") => {
  const res = await API.post(`/orders/${orderId}/cancel`, { reason });
  return res.data;
};
