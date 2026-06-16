import React, { memo } from 'react';
import { useSidebar } from './sidebarContext';

// ============================================================
// Sidebar header — title area with collapse / close buttons.
// Uses Sidebar context so it auto-adapts to collapsed/expanded.
// ============================================================

const SidebarHeader = memo(({
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
    <div className={`flex items-center justify-between px-4 py-3 border-b ${style.divider} ${className}`}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {icon && (
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
            {icon}
          </div>
        )}

        {(isExpanded || !collapsed) && (
          <div className="min-w-0 flex-1">
            {title && (
              <div className="text-sm font-semibold truncate">{title}</div>
            )}
            {subtitle && (
              <div className={`text-xs ${style.textMuted} truncate`}>{subtitle}</div>
            )}
            {children}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {actions}

        {showCollapse && (
          <button
            onClick={toggleCollapse}
            className={`p-1.5 rounded-lg transition-colors ${style.hover}`}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${
                collapsed ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {showClose && (
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${style.hover}`}
            title="Close sidebar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
});

export default SidebarHeader;
