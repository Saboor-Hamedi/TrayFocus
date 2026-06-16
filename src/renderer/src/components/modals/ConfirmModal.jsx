import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Info, CheckCircle, Loader2 } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm",
  message = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger",
  loading = false,
  closeOnEscape = true,
}) => {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (isOpen && confirmRef.current) setTimeout(() => confirmRef.current.focus(), 100);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const variants = {
    danger:  { text: 'text-red-400', btn: 'bg-red-500 hover:bg-red-600', icon: <AlertTriangle className="w-4 h-4" strokeWidth={2} /> },
    primary: { text: 'text-blue-400', btn: 'bg-blue-500 hover:bg-blue-600', icon: <Info className="w-4 h-4" strokeWidth={2} /> },
    success: { text: 'text-green-400', btn: 'bg-green-500 hover:bg-green-600', icon: <CheckCircle className="w-4 h-4" strokeWidth={2} /> },
    warning: { text: 'text-yellow-400', btn: 'bg-yellow-500 hover:bg-yellow-600', icon: <AlertTriangle className="w-4 h-4" strokeWidth={2} /> },
  };
  const v = variants[confirmVariant] || variants.danger;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[320px] bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="p-5">
          <div className="flex items-start gap-3">
            <span className={`flex-shrink-0 mt-0.5 ${v.text}`}>{v.icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white">{title}</h3>
              <p className="mt-1 text-xs text-zinc-400 leading-relaxed">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-zinc-800 bg-zinc-900/50">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-1.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-colors disabled:opacity-40"
          >
            {cancelText}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-1.5 text-xs font-medium text-white rounded-md transition-all ${v.btn} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
