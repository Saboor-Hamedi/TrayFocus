import { createContext, useContext } from 'react';

// Shared context so Header/Footer/Items can read sidebar state
// without creating circular imports with Sidebar.jsx
const SidebarContext = createContext(null);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within <Sidebar>');
  }
  return context;
};

export default SidebarContext;
