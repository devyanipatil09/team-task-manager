import { createContext, useState, useCallback } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md min-w-[300px] animate-fade-in-up transition-all ${
              toast.type === "success" 
                ? "bg-emerald-900/40 border-emerald-500/30 text-emerald-100" 
                : "bg-red-900/40 border-red-500/30 text-red-100"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="text-emerald-400 shrink-0" size={20} />
            ) : (
              <XCircle className="text-red-400 shrink-0" size={20} />
            )}
            
            <div className="flex-1 font-medium text-sm pt-0.5">{toast.message}</div>
            
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
