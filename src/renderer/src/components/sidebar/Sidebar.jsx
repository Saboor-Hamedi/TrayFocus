import React, { useState, useEffect, useRef, memo } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import SidebarContext, { useSidebar } from './sidebarContext';
export { default as SidebarHeader } from './SidebarHeader.jsx';
export { default as SidebarFooter } from './SidebarFooter.jsx';

// Main Sidebar Component
export const Sidebar = memo(({
  isOpen = true,
  onClose,
  onToggle,
  position = 'left',
  width = 'w-72',
  collapsedWidth = 'w-16',
  children,
  className = '',
  theme = 'dark', // string 'dark'|'light' OR a style object { bg, border, text, ... }
  overlay = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  collapsible = true,
  defaultCollapsed = false,
  showTooltips = true,
  floating = false,
  variant = 'default' // 'default' | 'compact' | 'floating'
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [isHovered, setIsHovered] = useState(false);
  const sidebarRef = useRef(null);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle click outside
  useEffect(() => {
    if (!isOpen || !closeOnOverlayClick || floating) return;

    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeOnOverlayClick, onClose, floating]);

  // Toggle collapse
  const toggleCollapse = () => {
    if (collapsible) {
      setCollapsed(!collapsed);
      onToggle?.(!collapsed);
    }
  };

  // Auto-expand on hover when collapsed
  const handleMouseEnter = () => {
    if (collapsed) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (collapsed) {
      setIsHovered(false);
    }
  };

  // Theme styles
  const themes = {
    dark: {
      bg: 'bg-zinc-900/95',
      border: 'border-zinc-800',
      text: 'text-white',
      textMuted: 'text-zinc-400',
      hover: 'hover:bg-zinc-800/50',
      active: 'bg-blue-500/20 text-blue-400',
      activeBg: 'bg-blue-500/10',
      divider: 'border-zinc-800',
      scrollbar: 'scrollbar-thumb-zinc-700',
      shadow: 'shadow-2xl'
    },
    light: {
      bg: 'bg-white/95',
      border: 'border-gray-200',
      text: 'text-gray-900',
      textMuted: 'text-gray-500',
      hover: 'hover:bg-gray-50',
      active: 'bg-blue-50 text-blue-600',
      activeBg: 'bg-blue-50',
      divider: 'border-gray-200',
      scrollbar: 'scrollbar-thumb-gray-300',
      shadow: 'shadow-2xl'
    }
  };

  // Theme resolution — accepts string preset or a custom style object
  const resolveTheme = (t) => {
    if (typeof t === 'object' && t !== null) {
      return { ...themes.dark, ...t };
    }
    return themes[t] || themes.dark;
  };
  const style = resolveTheme(theme);
  const actualWidth = collapsed ? collapsedWidth : width;
  const isExpanded = !collapsed || isHovered;

  // Variant styles
  const variantStyles = {
    default: '',
    compact: 'py-1',
    floating: `rounded-xl border ${style.border} ${style.shadow} backdrop-blur-xl`
  };

  // Position styles
  const positionStyles = {
    left: {
      container: `left-0 ${floating ? 'm-4' : ''}`,
      transform: isOpen ? 'translate-x-0' : '-translate-x-full'
    },
    right: {
      container: `right-0 ${floating ? 'm-4' : ''}`,
      transform: isOpen ? 'translate-x-0' : 'translate-x-full'
    }
  };

  const pos = positionStyles[position] || positionStyles.left;

  const contextValue = {
    collapsed,
    isExpanded,
    toggleCollapse,
    theme,
    style,
    showTooltips,
    position,
    variant
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      {/* Overlay */}
      {overlay && isOpen && !floating && (
        <div
          className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={closeOnOverlayClick ? onClose : undefined}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed top-8 z-40 h-[calc(100%-32px)] transition-all duration-300 ease-in-out ${actualWidth} ${variantStyles[variant]} ${style.bg} ${style.border} ${pos.container} ${
          isOpen ? pos.transform : pos.transform
        } ${className}`}
        style={{
          boxShadow: floating ? '0 20px 60px rgba(0,0,0,0.3)' : 'none'
        }}
      >
        <div className={`flex h-full flex-col ${style.text} overflow-hidden`}>
          {children}
        </div>
      </div>
    </SidebarContext.Provider>
  );
});

// SidebarItem Component
export const SidebarItem = memo(({
  icon,
  label,
  active = false,
  onClick,
  className = '',
  badge = null,
  shortcut = null,
  children = null,
  disabled = false,
  tooltip = '',
  depth = 0,
  expandable = false,
  expanded = false,
  onExpandToggle = null
}) => {
  const { collapsed, isExpanded, style, showTooltips, position } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    if (expandable && onExpandToggle) {
      onExpandToggle(!expanded);
    }
    onClick?.();
  };

  const paddingLeft = collapsed ? 'pl-3' : `pl-${3 + depth * 2}`;

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={disabled}
        className={`
          w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
          ${paddingLeft}
          ${active ? `${style.active} ${style.activeBg}` : `${style.text} ${style.hover}`}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${collapsed ? 'justify-center' : 'justify-start'}
          ${className}
        `}
        title={collapsed && showTooltips ? tooltip || label : undefined}
      >
        {/* Icon */}
        {icon && (
          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            {icon}
          </div>
        )}

        {/* Label */}
        {(isExpanded || !collapsed) && (
          <span className="text-sm font-medium truncate flex-1 text-left">
            {label}
          </span>
        )}

        {/* Badge */}
        {badge && (isExpanded || !collapsed) && (
          <span className={`flex-shrink-0 px-2 py-0.5 text-[10px] font-medium rounded-full ${style.activeBg} ${style.text}`}>
            {badge}
          </span>
        )}

        {/* Shortcut */}
        {shortcut && (isExpanded || !collapsed) && (
          <span className={`flex-shrink-0 text-[10px] ${style.textMuted}`}>
            {shortcut}
          </span>
        )}

        {/* Expand icon */}
        {expandable && (isExpanded || !collapsed) && (
          <ChevronRight
            className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
            strokeWidth={2}
          />
        )}

        {/* Tooltip for collapsed state */}
        {collapsed && showTooltips && isHovered && (
          <div className={`absolute ${position === 'left' ? 'left-full' : 'right-full'} ml-2 px-2 py-1 rounded ${style.bg} ${style.border} ${style.text} text-xs whitespace-nowrap shadow-lg z-50`}>
            {tooltip || label}
            {badge && <span className="ml-1 text-[10px] opacity-50">({badge})</span>}
          </div>
        )}
      </button>

      {/* Children (nested items) */}
      {expandable && expanded && children && (
        <div className="ml-4">
          {children}
        </div>
      )}
    </div>
  );
});

// SidebarGroup Component
export const SidebarGroup = memo(({
  label,
  children,
  className = '',
  collapsible = false,
  defaultCollapsed = false
}) => {
  const { collapsed, isExpanded, style } = useSidebar();
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  if (collapsed) {
    return <>{children}</>;
  }

  return (
    <div className={`px-2 py-1 ${className}`}>
      {label && (
        <div 
          className={`flex items-center justify-between px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${style.textMuted} cursor-pointer hover:opacity-80 transition-opacity`}
          onClick={() => collapsible && setIsCollapsed(!isCollapsed)}
        >
          <span>{label}</span>
          {collapsible && (
            <ChevronDown
              className={`w-3 h-3 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
              strokeWidth={2}
            />
          )}
        </div>
      )}
      {!isCollapsed && (
        <div className="space-y-0.5">
          {children}
        </div>
      )}
    </div>
  );
});

// SidebarDivider Component
export const SidebarDivider = memo(({ className = '' }) => {
  const { style } = useSidebar();
  return <hr className={`mx-3 my-2 ${style.divider} ${className}`} />;
});

export default Sidebar;