import React from 'react';
import { useSettings } from '../modals/SettingsModal';

const accents = [
  { id: 'blue',    color: 'bg-blue-400' },
  { id: 'sky',     color: 'bg-sky-400' },
  { id: 'cyan',    color: 'bg-cyan-400' },
  { id: 'teal',    color: 'bg-teal-400' },
  { id: 'green',   color: 'bg-green-400' },
  { id: 'emerald', color: 'bg-emerald-400' },
  { id: 'lime',    color: 'bg-lime-400' },
  { id: 'yellow',  color: 'bg-yellow-400' },
  { id: 'amber',   color: 'bg-amber-400' },
  { id: 'orange',  color: 'bg-orange-400' },
  { id: 'red',     color: 'bg-red-400' },
  { id: 'rose',    color: 'bg-rose-400' },
  { id: 'pink',    color: 'bg-pink-400' },
  { id: 'fuchsia', color: 'bg-fuchsia-400' },
  { id: 'purple',  color: 'bg-purple-400' },
  { id: 'violet',  color: 'bg-violet-400' },
  { id: 'indigo',  color: 'bg-indigo-400' },
];

const AccentPanel = () => {
  const { values, handleChange } = useSettings();
  const accent = values.accent || 'blue';

  return (
  <div className="space-y-1">
    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Accent Color</h3>
    <div className="grid grid-cols-6 gap-2">
      {accents.map((a) => (
        <button
          key={a.id}
          onClick={() => handleChange('accent', a.id)}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all active:scale-95 ${
            accent === a.id
              ? 'bg-white/[0.08] ring-1 ring-white/10'
              : 'hover:bg-white/[0.04]'
          }`}
        >
          <div className={`w-5 h-5 rounded-full ${a.color} shadow-sm transition-transform hover:scale-110 ${
            accent === a.id ? 'ring-1.5 ring-white/30 ring-offset-1 ring-offset-zinc-900' : ''
          }`} />
          <span className={`text-[8px] font-medium capitalize ${
            accent === a.id ? 'text-white/80' : 'text-white/30'
          }`}>{a.id}</span>
        </button>
      ))}
    </div>
  </div>
)};

export default AccentPanel;
