import React from 'react';
import SettingsItem from './SettingsItem';

// ============================================================
// Appearance settings panel — font size, cursor, compact mode, animations.
// ============================================================

const appearanceSettings = [
  { key: 'fontSize', category: 'appearance', label: 'Font size', description: 'Base text size in px (applies to editor & preview)', type: 'number', defaultValue: 14, min: 10, max: 24, step: 1 },
  {
    key: 'cursorStyle',
    category: 'appearance',
    label: 'Cursor shape',
    description: 'Shape of the text cursor in the markdown editor',
    type: 'select',
    defaultValue: 'bar',
    options: [
      { value: 'bar',       label: 'Bar  |' },
      { value: 'block',     label: 'Block ▌' },
      { value: 'underline', label: 'Underline _' },
    ],
  },
  { key: 'cursorWidth', category: 'appearance', label: 'Cursor width', description: 'Width of the bar cursor in px (1–4)', type: 'number', defaultValue: 2, min: 1, max: 4, step: 1 },
  { key: 'editorWrapLines',   category: 'appearance', label: 'Word wrap',     description: 'Wrap long lines in the markdown editor',   type: 'switch', defaultValue: true },
  { key: 'editorLineNumbers', category: 'appearance', label: 'Line numbers',  description: 'Show line numbers in the markdown editor',  type: 'switch', defaultValue: true },
  { key: 'compactMode', category: 'appearance', label: 'Compact mode', description: 'Reduce spacing for a denser layout', type: 'switch', defaultValue: false },
  { key: 'animationsEnabled', category: 'appearance', label: 'Animations', description: 'Enable UI transition animations', type: 'switch', defaultValue: true },
];

const AppearancePanel = () => (
  <div className="space-y-1">
    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Appearance</h3>
    <div className="space-y-4">
      {appearanceSettings.map((s) => (
        <SettingsItem key={s.key} setting={s} />
      ))}
    </div>
  </div>
);

export default AppearancePanel;
