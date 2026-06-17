import React from 'react';
import { useSidebar } from './sidebarContext';

const SidebarHeader = ({
  children,
  className = '',
  icon = null,
  title = '',
  subtitle = '',
  actions = null
}) => {
  const { collapsed, isExpanded, style } = useSidebar();

  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-b ${style.divider} ${className}`}>
      {icon && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
          {icon}
        </div>
      )}

      {(isExpanded || !collapsed) && (
        <div className="min-w-0 flex-1">
          {title && <div className={`text-xs font-semibold tracking-wide ${style.text}`}>{title}</div>}
          {subtitle && <div className={`text-[10px] ${style.textMuted} truncate mt-0.5`}>{subtitle}</div>}
          {children}
        </div>
      )}

      {actions && (
        <div className="flex items-center gap-1 flex-shrink-0">{actions}</div>
      )}
    </div>
  );
};

export default SidebarHeader;
