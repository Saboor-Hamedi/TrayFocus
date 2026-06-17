import React from 'react';
import { PanelLeftOpen, X } from 'lucide-react';
import { useSidebar } from './sidebarContext';

const SidebarHeader = ({
  children,
  className = '',
  showCollapse = true,
  showClose = false,
  onClose,
  icon = null,
  title = '',
  subtitle = '',
  actions = null
}) => {
  const { collapsed, isExpanded, toggleCollapse, style } = useSidebar();

  return (
    <div className={`flex items-center justify-between px-3 py-2.5 border-b ${style.divider} ${className}`}>
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {icon && (
          <div className="flex-shrink-0 w-7 h-7 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-400">
            {icon}
          </div>
        )}

        {(isExpanded || !collapsed) && (
          <div className="min-w-0 flex-1">
            {title && <div className="text-xs font-semibold truncate">{title}</div>}
            {subtitle && <div className={`text-[10px] ${style.textMuted} truncate`}>{subtitle}</div>}
            {children}
          </div>
        )}
      </div>

      <div className="flex items-center gap-0.5 flex-shrink-0">
        {actions}

        {showClose && (
          <button
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-md transition-colors hover:bg-white/10"
            title="Close sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SidebarHeader;
