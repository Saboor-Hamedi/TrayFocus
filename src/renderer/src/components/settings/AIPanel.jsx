import React from 'react';
import SettingsItem from './SettingsItem';

const aiSettings = [
  { key: 'deepseekKey', category: 'ai', label: 'DeepSeek API Key', description: 'Your DeepSeek API key — stored locally only', type: 'text', placeholder: 'sk-...' },
  { key: 'geminiKey', category: 'ai', label: 'Gemini API Key', description: 'Your Google Gemini API key — stored locally only', type: 'text', placeholder: 'AIza...' },
  { key: 'aiProvider', category: 'ai', label: 'Default Provider', description: 'Which AI provider to use for chatting', type: 'select', defaultValue: 'deepseek', options: [
    { value: 'deepseek', label: 'DeepSeek' },
    { value: 'gemini', label: 'Gemini' },
  ]},
  { key: 'aiModel', category: 'ai', label: 'Model', description: 'The AI model to use', type: 'select', defaultValue: 'deepseek-chat', options: [
    { value: 'deepseek-chat', label: 'DeepSeek Chat' },
    { value: 'deepseek-reasoner', label: 'DeepSeek Reasoner' },
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    { value: 'gemini-2.0-pro', label: 'Gemini 2.0 Pro' },
  ]},
];

const AIPanel = () => (
  <div className="space-y-1">
    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">AI Providers</h3>
    <div className="space-y-4">
      {aiSettings.map((s) => (
        <SettingsItem key={s.key} setting={s} />
      ))}
    </div>
    <p className="text-[10px] text-zinc-500 mt-4">API keys are stored locally in your AppData folder and never sent anywhere except to the respective AI provider.</p>
  </div>
);

export default AIPanel;
