import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createRazorpayOrder, verifyPayment } from "../../api/services/paymentService";

function StatusCard({ children }) {
  return (
    <div className="min-h-screen bg-[#EBF4F8] px-4 py-8 text-[#1A2332]">
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="w-[90%] max-w-[440px] rounded-[20px] border border-[#E2EBF0] bg-white px-8 py-10 text-center shadow-[0_2px_8px_rgba(26,35,50,0.06)]">
          {children}
        </div>
      </div>
    </div>
  );
}

function SpinnerBlock({ title, subtitle, warning, note }) {
  return (
    <>
      <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-[#D0F5EB] border-t-[#2DD4A0]" />
      <h1 className="text-base font-bold text-[#1A2332]">{title}</h1>
      <p className="mt-2 text-[13px] text-[#6B7A8D]">{subtitle}</p>
      {warning ? <p className="mt-2 text-xs text-[#F87171]">{warning}</p> : null}
      {note ? <p className="mt-1 text-[11px] text-[#6B7A8D]">{note}</p> : null}
    </>
  );
}

export default function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [pageState, setPageState] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [razorpayData, setRazorpayData] = useState(null);

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const openRazorpay = useMemo(
    () => (data) => {
      if (!window.Razorpay) {
        setErrorMessage("Payment gateway is not configured. Please contact support.");
        setPageState("error");
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpayOrderId,
        name: "Pet Wellness",
        description: "Pet Product Order",
        image: "",
        theme: { color: "#2DD4A0" },
        handler: async (response) => {
          try {
            setPageState("verifying");
            await verifyPayment(orderId, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            navigate(`/order-success/${orderId}`);
          } catch (err) {
            setErrorMessage(err?.response?.data?.message || "Your payment could not be verified. Please contact support.");
            setPageState("verificationFailed");
          }
        },
        modal: {
          ondismiss: () => {
            setPageState("cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    },
    [navigate, orderId]
  );

  useEffect(() => {
    let active = true;

    async function initializePayment() {
      try {
        setPageState("loading");
        const data = await createRazorpayOrder(orderId);
        if (!active) return;
        setRazorpayData(data);
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          throw new Error("Razorpay script failed to load");
        }
        if (!active) return;
        openRazorpay(data);
      } catch (err) {
        if (!active) return;
        setErrorMessage(err?.response?.data?.message || err?.message || "Payment setup failed");
        setPageState("error");
      }
    }

    initializePayment();
    return () => {
      active = false;
    };
  }, [openRazorpay, orderId]);

  if (pageState === "loading") {
    return (
      <StatusCard>
        <SpinnerBlock title="Setting up your payment..." subtitle="Please wait a moment" />
      </StatusCard>
    );
  }

  if (pageState === "verifying") {
    return (
      <StatusCard>
        <SpinnerBlock
          title="Verifying your payment..."
          subtitle="Please do not close this page"
          warning="Please do not close this page"
          note="This usually takes a few seconds"
        />
      </StatusCard>
    );
  }

  if (pageState === "cancelled") {
    return (
      <StatusCard>
        <div className="mb-4 text-[44px]">😕</div>
        <h1 className="text-[22px] font-extrabold text-[#1A2332]">Payment Cancelled</h1>
        <p className="mt-2 text-[13px] leading-6 text-[#6B7A8D]">
          Your order has been saved. You can complete the payment anytime from My Orders.
        </p>
        <p className="mt-3 text-xs text-[#6B7A8D]">Order ID: #{orderId}</p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => razorpayData && openRazorpay(razorpayData)}
            className="rounded-full bg-[#2DD4A0] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#1BAF82]"
          >
            Try Payment Again
          </button>
          <button
            type="button"
            onClick={() => navigate("/my-orders")}
            className="rounded-full border border-[#E2EBF0] bg-white px-4 py-3 text-sm font-bold text-[#1A2332] transition hover:border-[#2DD4A0] hover:text-[#1BAF82]"
          >
            View My Orders
          </button>
        </div>
      </StatusCard>
    );
  }

  if (pageState === "verificationFailed") {
    return (
      <StatusCard>
        <div className="mb-4 text-[44px]">❌</div>
        <h1 className="text-[22px] font-extrabold text-[#1A2332]">Payment Verification Failed</h1>
        <p className="mt-2 text-[13px] text-[#6B7A8D]">
          {errorMessage || "Your payment could not be verified. Please contact support."}
        </p>
        <p className="mt-3 text-xs font-bold text-[#2DD4A0]">Order ID: #{orderId}</p>
        <p className="mt-1 text-[11px] text-[#6B7A8D]">Please share this ID when contacting support</p>
        <button
          type="button"
          onClick={() => navigate("/my-orders")}
          className="mt-6 rounded-full bg-[#2DD4A0] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#1BAF82]"
        >
          View My Orders
        </button>
      </StatusCard>
    );
  }

  return (
    <StatusCard>
      <div className="mb-4 text-[44px]">⚠️</div>
      <h1 className="text-[22px] font-extrabold text-[#1A2332]">Payment Unavailable</h1>
      <p className="mt-2 text-[13px] leading-6 text-[#6B7A8D]">
        {errorMessage || "Payment gateway is not configured. Please contact support."}
      </p>
      <button
        type="button"
        onClick={() => navigate("/my-orders")}
        className="mt-6 rounded-full bg-[#2DD4A0] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#1BAF82]"
      >
        Back to My Orders
      </button>
    </StatusCard>
  );
}
