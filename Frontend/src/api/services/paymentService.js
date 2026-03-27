import API from "../api";

export const createRazorpayOrder = async (orderId) => {
  const res = await API.post(`/orders/${orderId}/razorpay-order`);
  return res.data;
};

export const verifyPayment = async (orderId, paymentData) => {
  const payload = {
    razorpayOrderId: paymentData.razorpay_order_id,
    razorpayPaymentId: paymentData.razorpay_payment_id,
    razorpaySignature: paymentData.razorpay_signature,
  };
  const res = await API.post(`/orders/${orderId}/verify-payment`, payload);
  return res.data;
};
