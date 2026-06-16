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

  const v = {
    danger:  { color: 'text-red-400', bg: 'bg-red-500/10', btn: 'bg-red-500 hover:bg-red-600', icon: <AlertTriangle className="w-4 h-4" strokeWidth={2} /> },
    primary: { color: 'text-blue-400', bg: 'bg-blue-500/10', btn: 'bg-blue-500 hover:bg-blue-600', icon: <Info className="w-4 h-4" strokeWidth={2} /> },
    success: { color: 'text-green-400', bg: 'bg-green-500/10', btn: 'bg-green-500 hover:bg-green-600', icon: <CheckCircle className="w-4 h-4" strokeWidth={2} /> },
    warning: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', btn: 'bg-yellow-500 hover:bg-yellow-600', icon: <AlertTriangle className="w-4 h-4" strokeWidth={2} /> },
  };
  const s = v[confirmVariant] || v.danger;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xs bg-zinc-900/95 border border-white/10 rounded-xl shadow-2xl">
        <div className="p-5 text-center">
          <div className={`inline-flex items-center justify-center w-9 h-9 rounded-full ${s.bg} ${s.color} mb-3`}>
            {s.icon}
          </div>
          <h3 className={`text-sm font-semibold ${s.color}`}>{title}</h3>
          <p className="mt-1 text-xs text-white/40">{message}</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-3 py-1.5 text-[11px] font-medium text-white/30 hover:text-white/50 transition-colors disabled:opacity-30"
            >
              {cancelText}
            </button>
            <button
              ref={confirmRef}
              onClick={onConfirm}
              disabled={loading}
              className={`px-3 py-1.5 text-[11px] font-medium text-white rounded-md transition-all ${s.btn} disabled:opacity-50`}
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
