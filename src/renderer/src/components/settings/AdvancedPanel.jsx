import React from 'react';
import SettingsItem from './SettingsItem';

// ============================================================
// Advanced settings panel — auto-updates and debug mode.
// Used as a custom section in SettingsModal.
// ============================================================

const advancedSettings = [
  { key: 'checkUpdates', category: 'advanced', label: 'Auto-check updates', description: 'Check for new versions on launch', type: 'switch', defaultValue: true },
  { key: 'debugMode', category: 'advanced', label: 'Debug mode', description: 'Show debug information in console', type: 'switch', defaultValue: false },
];

const AdvancedPanel = () => {
  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Advanced</h3>
      <div className="space-y-4">
        {advancedSettings.map((s) => (
          <SettingsItem key={s.key} setting={s} />
        ))}
      </div>
    </div>
  );
};

export default AdvancedPanel;
