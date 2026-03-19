import { useEffect, useMemo, useState } from "react";
import "./RazorpayTest.css";

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

const loadRazorpayScript = () =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`)) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Failed to load Razorpay script"));
    document.body.appendChild(script);
  });

const defaultBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function RazorpayTest() {
  const [baseUrl, setBaseUrl] = useState(defaultBaseUrl);
  const [token, setToken] = useState("");
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [razorpayOrder, setRazorpayOrder] = useState(null);

  const authHeaders = useMemo(() => {
    if (!token.trim()) return {};
    return { Authorization: `Bearer ${token.trim()}` };
  }, [token]);

  useEffect(() => {
    loadRazorpayScript().catch((err) => {
      setStatus(err.message);
    });
  }, []);

  const createRazorpayOrder = async () => {
    if (!orderId.trim()) {
      setStatus("Please enter an order id.");
      return;
    }

    setLoading(true);
    setStatus("Creating Razorpay order...");
    setRazorpayOrder(null);

    try {
      const response = await fetch(
        `${baseUrl}/api/orders/${orderId.trim()}/razorpay-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Request failed with ${response.status}`);
      }

      const data = await response.json();
      setRazorpayOrder(data);
      setStatus("Razorpay order created. You can open checkout now.");
    } catch (err) {
      setStatus(err.message || "Failed to create Razorpay order.");
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (payload) => {
    try {
      const response = await fetch(
        `${baseUrl}/api/orders/${orderId.trim()}/verify-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Verification failed with ${response.status}`);
      }

      const data = await response.json();
      setStatus(`Payment verified. Order status: ${data.status || "updated"}`);
    } catch (err) {
      setStatus(err.message || "Payment verification failed.");
    }
  };

  const openCheckout = async () => {
    if (!razorpayOrder) {
      setStatus("Create a Razorpay order first.");
      return;
    }

    if (!window.Razorpay) {
      setStatus("Razorpay script is not loaded yet.");
      return;
    }

    const options = {
      key: razorpayOrder.keyId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "Pet Wellness",
      description: `Order #${razorpayOrder.orderId}`,
      order_id: razorpayOrder.razorpayOrderId,
      handler: (response) => {
        verifyPayment({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
      },
      prefill: {
        name: "Test User",
        email: "test.user@example.com",
        contact: "9999999999",
      },
      theme: { color: "#2563eb" },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on("payment.failed", (response) => {
      setStatus(
        response?.error?.description ||
          "Payment failed in Razorpay checkout."
      );
    });
    razorpay.open();
  };

  return (
    <div className="razorpay-test">
      <div className="razorpay-card">
        <h1>Razorpay Test Checkout</h1>
        <p className="razorpay-subtitle">
          Minimal UI to verify the backend Razorpay flow.
        </p>

        <label>
          API Base URL
          <input
            type="text"
            value={baseUrl}
            onChange={(event) => setBaseUrl(event.target.value)}
            placeholder="http://localhost:8080"
          />
        </label>

        <label>
          JWT Token
          <input
            type="text"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Paste JWT token"
          />
        </label>

        <label>
          Order ID
          <input
            type="text"
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
            placeholder="Existing order id"
          />
        </label>

        <div className="razorpay-actions">
          <button onClick={createRazorpayOrder} disabled={loading}>
            {loading ? "Working..." : "Create Razorpay Order"}
          </button>
          <button
            onClick={openCheckout}
            disabled={loading || !razorpayOrder}
            className="secondary"
          >
            Open Checkout
          </button>
        </div>

        {razorpayOrder && (
          <div className="razorpay-order">
            <div>
              <strong>Razorpay Order ID:</strong> {razorpayOrder.razorpayOrderId}
            </div>
            <div>
              <strong>Amount:</strong> {razorpayOrder.amount}{" "}
              {razorpayOrder.currency}
            </div>
          </div>
        )}

        {status && <div className="razorpay-status">{status}</div>}
      </div>
    </div>
  );
}

export default RazorpayTest;
