import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const MenuContext = createContext(null);

export const useContextMenu = () => {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useContextMenu must be used within ContextMenuProvider');
  return ctx;
};

export const ContextMenuProvider = ({ children }) => {
  const [menu, setMenu] = useState(null);
  const menuRef       = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const showContextMenu = useCallback(({ x, y, items }) => {
    setPos({ x, y });
    setMenu(items);
  }, []);

  const closeMenu = useCallback(() => {
    setMenu(null);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!menu) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menu, closeMenu]);

  // Close on Escape
  useEffect(() => {
    if (!menu) return;
    const handler = (e) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [menu, closeMenu]);

  // Close on scroll
  useEffect(() => {
    if (!menu) return;
    window.addEventListener('scroll', closeMenu, true);
    return () => window.removeEventListener('scroll', closeMenu, true);
  }, [menu, closeMenu]);

  // Auto-position: flip if menu would overflow viewport
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);

  useEffect(() => {
    if (!menu || !menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    setFlipX(pos.x + rect.width > window.innerWidth - 8);
    setFlipY(pos.y + rect.height > window.innerHeight - 8);
  }, [menu, pos]);

  return (
    <MenuContext.Provider value={{ showContextMenu, closeMenu }}>
      {children}

      {menu && (
        <div
          className="fixed z-[70] min-w-[160px] bg-zinc-900/95 backdrop-blur-xl border border-white/[0.08] rounded-lg shadow-lg overflow-hidden"
          ref={menuRef}
          style={{
            left: flipX ? pos.x - (menuRef.current?.offsetWidth ?? 180) : pos.x,
            top:  flipY ? pos.y - (menuRef.current?.offsetHeight ?? 0) : pos.y,
          }}
        >
          <div className="py-1">
            {menu.map((item, i) => {
              if (item.type === 'divider') {
                return <div key={i} className="my-1 border-t border-white/[0.06]" />;
              }

              return (
                <button
                  key={i}
                  onClick={() => {
                    item.action?.();
                    closeMenu();
                  }}
                  disabled={item.disabled}
                  className={`w-full flex items-center gap-3 px-3 py-1.5 text-left text-xs transition-colors
                    ${item.danger
                      ? 'text-red-400 hover:bg-red-500/10'
                      : 'text-white/80 hover:bg-white/[0.06]'
                    }
                    disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  {item.icon && (
                    <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                      {item.icon}
                    </span>
                  )}
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.shortcut && (
                    <span className="text-[10px] text-white/25 flex-shrink-0">{item.shortcut}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </MenuContext.Provider>
  );
};

export default ContextMenuProvider;
