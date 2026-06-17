import React, { useState, useEffect, useRef } from 'react';
import { Info, CheckCircle, AlertTriangle, X } from 'lucide-react';

const typeMap = {
  info:    { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', bar: 'bg-blue-500' },
  success: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', bar: 'bg-green-500' },
  error:   { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', bar: 'bg-red-500' },
  warning: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', bar: 'bg-yellow-500' },
};

const iconMap = {
  info:    <Info className="w-3 h-3" strokeWidth={2.5} />,
  success: <CheckCircle className="w-3 h-3" strokeWidth={2.5} />,
  error:   <AlertTriangle className="w-3 h-3" strokeWidth={2.5} />,
  warning: <AlertTriangle className="w-3 h-3" strokeWidth={2.5} />,
};

const Notification = ({ isOpen, onClose, message, type = 'info', duration = 3000, position = 'top-center' }) => {
  const [progress, setProgress] = useState(100);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen || duration === 0) return;
    setProgress(100);
    const start = Date.now();
    const timer = setInterval(() => {
      const r = Math.max(0, 100 - ((Date.now() - start) / duration) * 100);
      setProgress(r);
      if (r <= 0) { clearInterval(timer); onCloseRef.current?.(); }
    }, 50);
    return () => clearInterval(timer);
  }, [isOpen, duration]);

  if (!isOpen) return null;

  const pos = { 'top-center': 'top-10 left-1/2 -translate-x-1/2', 'top-right': 'top-10 right-4', 'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2' };
  const s = typeMap[type] || typeMap.info;

  return (
    <div className={`fixed z-50 ${pos[position] || pos['top-center']}`}>
      <div className={`relative rounded-lg border ${s.border} ${s.bg} backdrop-blur-xl shadow-lg overflow-hidden`}>
        {duration > 0 && <div className={`absolute bottom-0 left-0 h-0.5 ${s.bar} transition-all`} style={{ width: `${progress}%` }} />}
        <div className="flex items-center gap-2 px-3 py-2">
          <span className={`flex-shrink-0 ${s.text}`}>{iconMap[type] || iconMap.info}</span>
          <p className="text-xs text-white/80 flex-1">{message}</p>
          <button onClick={onClose} className="flex-shrink-0 text-white/25 hover:text-white/60"><X className="w-3 h-3" strokeWidth={2} /></button>
        </div>
      </div>
    </div>
  );
};

export default Notification;
