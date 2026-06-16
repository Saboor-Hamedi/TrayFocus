import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { Search } from 'lucide-react';
import TitleBar from '../header/TitleBar';
import Notification from './Notification';
import SettingsItem from '../settings/SettingsItem';

// Context for settings
const SettingsContext = createContext(null);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsModal');
  }
  return context;
};

export { SettingsItem };

// Main Settings Modal
export const SettingsModal = ({
  isOpen,
  onClose,
  settings = [],
  categories = [],
  onSave,
  onReset,
  initialValues = {},
  title = "Settings",
  width = 'w-[640px]',
  height = 'h-[440px]',
  showSearch = true,
  showReset = true,
  showSave = true,
  autoSave = false,
  validate = null,
  customSections = {}, // map of categoryId → ReactNode for custom tab content
  className = ''
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notif, setNotif] = useState({ open: false, type: 'success', message: '' });
  const modalRef = useRef(null);

  // Reset values when modal opens (only on open transition, not every render)
  useEffect(() => {
    if (isOpen) {
      setValues(initialValues);
      setErrors({});
      setIsDirty(false);
      setNotif({ open: false, type: 'success', message: '' });
      setSearchQuery('');
      if (categories.length > 0) {
        setActiveCategory(categories[0].id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (isDirty) {
          if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
            onClose();
          }
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isDirty, onClose]);

  // Auto-save
  useEffect(() => {
    if (autoSave && isDirty) {
      const timer = setTimeout(() => {
        handleSave();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [values, isDirty, autoSave]);

  // Filter settings by search
  const filteredSettings = searchQuery
    ? settings.filter(setting =>
        setting.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        setting.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        setting.keywords?.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : settings;

  // Group settings by category
  const groupedSettings = categories.map(category => ({
    ...category,
    settings: filteredSettings.filter(s => s.category === category.id)
  })).filter(group => group.settings.length > 0);

  // Handle value change
  const handleChange = (key, value) => {
    setValues(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
    
    // Clear error for this field
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }

    // Real-time validation
    if (validate) {
      const error = validate(key, value, values);
      if (error) {
        setErrors(prev => ({ ...prev, [key]: error }));
      }
    }
  };

  // Handle save
  const handleSave = async () => {
    // Validate all fields
    if (validate) {
      const newErrors = {};
      for (const key of Object.keys(values)) {
        const error = validate(key, values[key], values);
        if (error) {
          newErrors[key] = error;
        }
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setNotif({ open: true, type: 'error', message: 'Please fix the errors before saving' });
        return;
      }
    }

    setIsSaving(true);
    try {
      await onSave?.(values);
      setIsDirty(false);
      setNotif({ open: true, type: 'success', message: 'Settings saved successfully!' });
    } catch (error) {
      setNotif({ open: true, type: 'error', message: error.message || 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      setValues(initialValues);
      setIsDirty(false);
      setErrors({});
      onReset?.();
      setNotif({ open: true, type: 'info', message: 'Settings reset to default' });
    }
  };

  // Handle close with unsaved changes
  const handleClose = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Do you want to save before closing?')) {
        handleSave();
      } else {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Theme styles
  const themes = {
    dark: {
      bg: 'bg-zinc-900/95',
      border: 'border-zinc-800',
      text: 'text-white',
      textMuted: 'text-zinc-400',
      hover: 'hover:bg-zinc-800/50',
      active: 'bg-blue-500/10 text-blue-400',
      input: 'bg-zinc-800/50 border-zinc-700 text-white',
      inputFocus: 'border-blue-500 ring-1 ring-blue-500/20',
      scrollbar: 'scrollbar-thumb-zinc-700',
      shadow: 'shadow-2xl',
      success: 'text-green-400',
      error: 'text-red-400',
      warning: 'text-yellow-400'
    },
    light: {
      bg: 'bg-white/95',
      border: 'border-gray-200',
      text: 'text-gray-900',
      textMuted: 'text-gray-500',
      hover: 'hover:bg-gray-50',
      active: 'bg-blue-50 text-blue-600',
      input: 'bg-gray-50 border-gray-200 text-gray-900',
      inputFocus: 'border-blue-500 ring-1 ring-blue-500/20',
      scrollbar: 'scrollbar-thumb-gray-300',
      shadow: 'shadow-2xl',
      success: 'text-green-600',
      error: 'text-red-600',
      warning: 'text-yellow-600'
    }
  };

  const style = themes.dark;

  return (
    <SettingsContext.Provider value={{ values, handleChange, errors, style }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={handleClose}
        />

        {/* Modal */}
        <div
          ref={modalRef}
          className={`relative ${width} ${height} ${style.bg} ${style.border} rounded-xl ${style.shadow} overflow-hidden animate-in zoom-in-95 duration-200 ${className}`}
        >
          {/* Title Bar */}
          <TitleBar
            title={title}
            showMinimize={false}
            onMaximize={() => {}}
            onClose={handleClose}
            showMaximize={false}
            backgroundColor="bg-transparent"
            textColor={style.text}
          />

          {/* Notification */}
          <Notification
            isOpen={notif.open}
            onClose={() => setNotif({ open: false, type: 'success', message: '' })}
            message={notif.message}
            type={notif.type}
            duration={3000}
            position="top-center"
          />

          <div className="flex h-[calc(100%-36px)]">
            {/* Sidebar Categories */}
            <div className="w-48 border-r border-zinc-800/50 overflow-y-auto py-2">
              {categories.map(category => {
                const hasSettings = settings.some(s => s.category === category.id);
                const hasCustom = category.id in customSections;
                if (!hasSettings && !hasCustom) return null;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
                      activeCategory === category.id
                        ? `${style.active} border-r-2 border-blue-500`
                        : `${style.textMuted} ${style.hover}`
                    }`}
                  >
                    {category.icon && <span className="text-lg">{category.icon}</span>}
                    <span className="font-medium">{category.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Search */}
              {showSearch && (
                <div className="px-6 pt-4 pb-3 border-b border-zinc-800/50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" strokeWidth={2} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search settings..."
                      className={`w-full pl-9 pr-4 py-2 text-sm rounded-lg border ${style.input} ${style.inputFocus} outline-none transition-all`}
                    />
                  </div>
                </div>
              )}

              {/* Settings List or Custom Section */}
              {customSections[activeCategory] ? (
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {customSections[activeCategory]}
                </div>
              ) : (
              <div className={`flex-1 overflow-y-auto px-6 py-4 ${style.scrollbar}`}>
                {groupedSettings.filter(g => searchQuery ? true : g.id === activeCategory).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                    <p className="text-sm">No settings found</p>
                    <p className="text-xs mt-1">Try adjusting your search</p>
                  </div>
                ) : (
                  groupedSettings.filter(g => searchQuery ? true : g.id === activeCategory).map(group => (
                    <div key={group.id} className="mb-6 last:mb-0">
                      {!searchQuery && (
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                          {group.label}
                        </h3>
                      )}
                      <div className="space-y-4">
                        {group.settings.map(setting => (
                          <SettingsItem
                            key={setting.key}
                            setting={setting}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-800/50 bg-zinc-900/30">
                <div className="text-xs text-zinc-500">
                  {isDirty && <span className="text-yellow-400">• Unsaved changes</span>}
                </div>
                <div className="flex items-center gap-2">
                  {showReset && (
                    <button
                      onClick={handleReset}
                      className="px-4 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                      Reset
                    </button>
                  )}
                  {showSave && (
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !isDirty}
                      className={`px-6 py-1.5 text-sm font-medium rounded-lg transition-all ${
                        isSaving || !isDirty
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/25'
                      }`}
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SettingsContext.Provider>
  );
};

// Settings Category Definition Helper
export const createSettingsCategory = (id, label, icon = null) => ({
  id,
  label,
  icon
});

// Settings Item Definition Helper
export const createSetting = (config) => ({
  ...config,
  type: config.type || 'text',
  defaultValue: config.defaultValue ?? ''
});

export default SettingsModal;