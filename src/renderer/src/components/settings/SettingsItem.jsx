
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useSettings } from '../modals/SettingsModal';

const SettingsItem = ({ setting }) => {
  const { values, handleChange, errors, style } = useSettings();

  const value = values[setting.key] ?? setting.defaultValue ?? '';
  const error = errors[setting.key];

  const renderInput = () => {
    switch (setting.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(setting.key, e.target.value)}
            placeholder={setting.placeholder}
            className={`w-full px-2.5 py-1.5 text-xs rounded-md border ${style.input} ${style.inputFocus} outline-none transition-all ${
              error ? 'border-red-500 ring-1 ring-red-500/20' : ''
            }`}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(setting.key, parseFloat(e.target.value) || 0)}
            min={setting.min}
            max={setting.max}
            step={setting.step || 1}
            className={`w-full px-2.5 py-1.5 text-xs rounded-md border ${style.input} ${style.inputFocus} outline-none transition-all ${
              error ? 'border-red-500 ring-1 ring-red-500/20' : ''
            }`}
          />
        );
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(setting.key, e.target.value)}
            placeholder={setting.placeholder}
            rows={setting.rows || 3}
            className={`w-full px-2.5 py-1.5 text-xs rounded-md border ${style.input} ${style.inputFocus} outline-none transition-all resize-none ${
              error ? 'border-red-500 ring-1 ring-red-500/20' : ''
            }`}
          />
        );
      case 'select':
        return (
          <div className="relative">
            <select
              value={value}
              onChange={(e) => handleChange(setting.key, e.target.value)}
              className={`w-full px-2.5 py-1.5 text-xs rounded-md border appearance-none cursor-pointer ${style.input} ${style.inputFocus} outline-none transition-all ${error ? 'border-red-500 ring-1 ring-red-500/20' : ''}`}
            >
              {setting.options?.map(option => (
                <option key={option.value} value={option.value} className="bg-zinc-900 text-white">{option.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" strokeWidth={2} />
          </div>
        );
      case 'switch':
        return (
          <button
            onClick={() => handleChange(setting.key, !value)}
            className={`relative w-9 h-5 rounded-full transition-colors ${value ? 'bg-blue-500' : 'bg-zinc-700'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </button>
        );
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => handleChange(setting.key, e.target.checked)}
            className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 focus:ring-2"
          />
        );
      case 'color':
        return (
          <div className="flex items-center gap-2">
            <input type="color" value={value} onChange={(e) => handleChange(setting.key, e.target.value)} className="w-8 h-8 rounded-md border border-zinc-700 cursor-pointer" />
            <span className="text-xs text-zinc-400">{value}</span>
          </div>
        );
      case 'range':
        return (
          <div className="flex items-center gap-3">
            <input type="range" value={value} onChange={(e) => handleChange(setting.key, parseFloat(e.target.value))} min={setting.min || 0} max={setting.max || 100} step={setting.step || 1} className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer bg-zinc-700" />
            <span className="text-xs text-zinc-400 min-w-[36px] text-center">{value}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`py-1.5 ${setting.divider ? 'border-b border-zinc-800/50' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {setting.icon && <span className="text-base">{setting.icon}</span>}
            <label className="text-xs font-medium text-white">{setting.label}</label>
            {setting.badge && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-blue-500/20 text-blue-400">{setting.badge}</span>
            )}
          </div>
          {setting.description && <p className="text-[10px] text-zinc-400 mt-0.5">{setting.description}</p>}
          {error && <p className="text-[10px] text-red-400 mt-1">{error}</p>}
        </div>
        <div className="flex-shrink-0 min-w-[90px]">{renderInput()}</div>
      </div>
    </div>
  );
};

export default SettingsItem;
