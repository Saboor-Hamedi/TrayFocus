import React, { memo } from 'react';
import { useSidebar } from './sidebarContext';

// ============================================================
// Sidebar footer — user info, version, and custom actions.
// Auto-hides details when sidebar is collapsed.
// ============================================================

const SidebarFooter = memo(({
  children,
  className = '',
  showUser = true,
  user = null,
  actions = null,
  version = null
}) => {
  const { collapsed, isExpanded, style } = useSidebar();

  const defaultUser = {
    name: 'User',
    email: 'user@example.com',
    avatar: null,
    status: 'online'
  };

  const userData = user || defaultUser;

  const statusColors = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    offline: 'bg-gray-500'
  };

  return (
    <div className={`border-t ${style.divider} ${className}`}>
      {showUser && userData && (
        <div className={`flex items-center gap-3 px-4 py-3 ${style.hover} transition-colors cursor-pointer`}>
          <div className="relative flex-shrink-0">
            {userData.avatar ? (
              <img
                src={userData.avatar}
                alt={userData.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-medium text-sm">
                {userData.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 ${style.bg} ${statusColors[userData.status] || statusColors.online}`} />
          </div>

          {(isExpanded || !collapsed) && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{userData.name}</div>
              <div className={`text-xs ${style.textMuted} truncate`}>{userData.email}</div>
            </div>
          )}

          {actions && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}

      {version && (isExpanded || !collapsed) && (
        <div className={`px-4 py-2 text-[10px] ${style.textMuted} text-center border-t ${style.divider}`}>
          {version}
        </div>
      )}

      {children}
    </div>
  );
});

export default SidebarFooter;
