import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Info, CheckCircle, Loader2 } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger", // 'danger' | 'primary' | 'success' | 'warning'
  icon = null,
  size = "sm", // 'sm' | 'md' | 'lg'
  closeOnOverlayClick = true,
  closeOnEscape = true,
  loading = false,
  destructive = false,
  className = ""
}) => {
  const confirmRef = useRef(null);

  // Focus confirm button on open
  useEffect(() => {
    if (isOpen && confirmRef.current) {
      setTimeout(() => confirmRef.current.focus(), 100);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  };

  // Variant styles
  const variantStyles = {
    danger: 'bg-red-500 hover:bg-red-600 focus:ring-red-500',
    primary: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500',
    success: 'bg-green-500 hover:bg-green-600 focus:ring-green-500',
    warning: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500'
  };

  // Icon mapping
  const defaultIcons = {
    danger:  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500"><AlertTriangle className="w-5 h-5" strokeWidth={2} /></div>,
    primary: <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><Info className="w-5 h-5" strokeWidth={2} /></div>,
    success: <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500"><CheckCircle className="w-5 h-5" strokeWidth={2} /></div>,
    warning: <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500"><AlertTriangle className="w-5 h-5" strokeWidth={2} /></div>,
  };

  const variantColor = {
    danger: 'text-red-500',
    primary: 'text-blue-500',
    success: 'text-green-500',
    warning: 'text-yellow-500'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Modal */}
      <div className={`relative ${sizeClasses[size]} w-full bg-zinc-900/95 border border-zinc-800 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 ${className}`}>
        <div className="p-6">
          {/* Icon */}
          {(icon || defaultIcons[confirmVariant]) && (
            <div className="flex justify-center mb-4">
              {icon || defaultIcons[confirmVariant]}
            </div>
          )}

          {/* Title */}
          <h3 className={`text-lg font-semibold text-center ${variantColor[confirmVariant] || 'text-white'}`}>
            {title}
          </h3>

          {/* Message */}
          <p className="mt-2 text-sm text-zinc-400 text-center">
            {message}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              ref={confirmRef}
              onClick={onConfirm}
              disabled={loading}
              className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed ${
                destructive 
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                  : variantStyles[confirmVariant] || variantStyles.primary
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                  Loading...
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;