import React, { useState, useEffect } from 'react';
import { Info, CheckCircle, AlertTriangle, Smile, X } from 'lucide-react';

const Notification = ({
  isOpen,
  onClose,
  message,
  description = '',
  type = 'info', // 'info' | 'success' | 'error' | 'warning' | 'cute'
  duration = 3000,
  position = 'top-right', // 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  icon = null,
  title = '',
  actions = null,
  dismissible = true,
  className = '',
  onAction = null
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  // Show/Hide animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setProgress(100);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Auto dismiss
  useEffect(() => {
    if (!isOpen || duration === 0) return;

    const startTime = Date.now();
    const interval = 50;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        onClose?.();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, duration, onClose]);

  if (!isVisible) return null;

  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };

  // Type styles
  const typeStyles = {
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
      iconBg: 'bg-blue-500/20',
      progress: 'bg-blue-500'
    },
    success: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      text: 'text-green-400',
      iconBg: 'bg-green-500/20',
      progress: 'bg-green-500'
    },
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-400',
      iconBg: 'bg-red-500/20',
      progress: 'bg-red-500'
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      text: 'text-yellow-400',
      iconBg: 'bg-yellow-500/20',
      progress: 'bg-yellow-500'
    },
    cute: {
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/20',
      text: 'text-pink-400',
      iconBg: 'bg-pink-500/20',
      progress: 'bg-pink-500'
    }
  };

  const style = typeStyles[type] || typeStyles.info;

  // Default icons
  const defaultIcons = {
    info: <Info className="w-5 h-5" strokeWidth={2} />,
    success: <CheckCircle className="w-5 h-5" strokeWidth={2} />,
    error: <AlertTriangle className="w-5 h-5" strokeWidth={2} />,
    warning: <AlertTriangle className="w-5 h-5" strokeWidth={2} />,
    cute: <Smile className="w-5 h-5" strokeWidth={2} />,
  };

  return (
    <div className={`fixed z-50 ${positionClasses[position]} animate-in slide-in-from-top-5 duration-300`}>
      <div className={`relative w-96 max-w-full rounded-xl border ${style.border} ${style.bg} backdrop-blur-xl shadow-2xl overflow-hidden`}>
        {/* Progress bar */}
        {duration > 0 && (
          <div 
            className={`absolute bottom-0 left-0 h-0.5 ${style.progress} transition-all duration-50`}
            style={{ width: `${progress}%` }}
          />
        )}

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${style.iconBg} flex items-center justify-center ${style.text}`}>
              {icon || defaultIcons[type] || defaultIcons.info}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {title && (
                <h4 className={`text-sm font-semibold ${style.text}`}>
                  {title}
                </h4>
              )}
              <p className="text-sm text-white/90">
                {message}
              </p>
              {description && (
                <p className="text-xs text-zinc-400 mt-0.5">
                  {description}
                </p>
              )}
              
              {/* Actions */}
              {actions && (
                <div className="flex gap-2 mt-2">
                  {actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onAction?.(action);
                        if (action.closeOnClick !== false) {
                          onClose?.();
                        }
                      }}
                      className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                        action.primary 
                          ? `${style.text} ${style.iconBg} hover:opacity-80`
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Close button */}
            {dismissible && (
              <button
                onClick={onClose}
                className="flex-shrink-0 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Notification Provider
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const show = (notification) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { ...notification, id }]);
    
    if (notification.duration !== 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, notification.duration || 3000);
    }
  };

  const dismiss = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ show, dismiss, clearAll }}>
      {children}
      {notifications.map(notif => (
        <Notification
          key={notif.id}
          isOpen={true}
          onClose={() => dismiss(notif.id)}
          {...notif}
        />
      ))}
    </NotificationContext.Provider>
  );
};

// Notification Context
const NotificationContext = React.createContext(null);

export const useNotification = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export default Notification;