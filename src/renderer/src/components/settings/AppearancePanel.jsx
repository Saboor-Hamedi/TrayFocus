import React from 'react';
import SettingsItem from './SettingsItem';

// ============================================================
// Appearance settings panel — font size, compact mode, animations.
// Used as a custom section in SettingsModal.
// ============================================================

const appearanceSettings = [
  { key: 'fontSize', category: 'appearance', label: 'Font size', description: 'Adjust the app text size (px)', type: 'number', defaultValue: 14, min: 10, max: 24, step: 1 },
  { key: 'compactMode', category: 'appearance', label: 'Compact mode', description: 'Reduce spacing for a denser layout', type: 'switch', defaultValue: false },
  { key: 'animationsEnabled', category: 'appearance', label: 'Animations', description: 'Enable UI transition animations', type: 'switch', defaultValue: true },
];

const AppearancePanel = () => {
  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Appearance</h3>
      <div className="space-y-4">
        {appearanceSettings.map((s) => (
          <SettingsItem key={s.key} setting={s} />
        ))}
      </div>
    </div>
  );
};

export default AppearancePanel;
