import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

const toneClasses = {
  success: "border-[#34D399] bg-[#D1FAE5] text-[#065F46]",
  error: "border-[#F87171] bg-[#FEE2E2] text-[#991B1B]",
  info: "border-[#1E6FD9] bg-[#DAEAF8] text-[#1E3A8A]",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2500);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={[
              "animate-[toastIn_0.25s_ease] rounded-2xl border px-4 py-3 text-sm font-semibold shadow-[0_8px_24px_rgba(26,35,50,0.12)]",
              toneClasses[toast.type] || toneClasses.info,
            ].join(" ")}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
