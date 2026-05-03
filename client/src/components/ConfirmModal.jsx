import { AlertTriangle, X } from "lucide-react";

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Delete", isDestructive = true }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm glass-panel rounded-2xl p-6 relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="flex items-start gap-4 mb-6">
          <div className={`p-3 rounded-full ${isDestructive ? 'bg-red-500/10 text-red-400' : 'bg-royal-blue/10 text-royal-blue'} shrink-0`}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
            <p className="text-sm text-slate-400">{message}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 font-medium py-2 px-4 rounded-lg shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 text-white ${
              isDestructive 
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' 
                : 'btn-primary'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
