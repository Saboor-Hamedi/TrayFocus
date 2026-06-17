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
  const { collapsed, isExpanded } = useSidebar();

  return (
    <div className={`flex items-center justify-between px-3.5 py-1.5 border-b border-black/10 dark:border-white/[0.05] bg-black/[0.02] dark:bg-white/[0.02] shrink-0 ${className}`}>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {icon && (
          <div className="flex-shrink-0 w-5 h-5 rounded bg-blue-500/15 flex items-center justify-center text-blue-400">
            {icon}
          </div>
        )}

        {(isExpanded || !collapsed) && (
          <div className="min-w-0 flex-1">
            {title && <span className="text-[10px] font-medium text-black/40 dark:text-white/30 tracking-wide">{title}</span>}
            {subtitle && <span className="text-[8px] text-black/20 dark:text-white/15 truncate ml-2">{subtitle}</span>}
            {children}
          </div>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-1 flex-shrink-0">{actions}</div>
      )}
    </div>
  );
};

export default SidebarHeader;
