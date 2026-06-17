// ============================================================
// Central theme configuration — single source of truth for
// all 19 color themes. Used by both App and ThemeModal.
// ============================================================

const themes = [
  // Neutral tones
  { id: 'zinc',    name: 'Deep Zinc',      preview: 'bg-zinc-600',    bg: 'bg-zinc-950',    text: 'text-zinc-100',    titlebar: 'bg-zinc-900',    accent: 'text-blue-400' },
  { id: 'slate',   name: 'Slate Gray',      preview: 'bg-slate-600',   bg: 'bg-slate-950',   text: 'text-slate-100',   titlebar: 'bg-slate-900',   accent: 'text-blue-400' },
  { id: 'amoled',  name: 'AMOLED Black',    preview: 'bg-zinc-900',    bg: 'bg-black',       text: 'text-zinc-200',    titlebar: 'bg-black',       accent: 'text-purple-400' },
  // Cool tones
  { id: 'blue',    name: 'Ocean Blue',      preview: 'bg-blue-600',    bg: 'bg-blue-950',    text: 'text-blue-100',    titlebar: 'bg-blue-950',    accent: 'text-sky-400' },
  { id: 'sky',     name: 'Sky Blue',        preview: 'bg-sky-600',     bg: 'bg-sky-950',     text: 'text-sky-100',     titlebar: 'bg-sky-900',     accent: 'text-cyan-400' },
  { id: 'cyan',    name: 'Cyan',            preview: 'bg-cyan-600',    bg: 'bg-cyan-950',    text: 'text-cyan-100',    titlebar: 'bg-cyan-900',    accent: 'text-teal-400' },
  { id: 'indigo',  name: 'Indigo',          preview: 'bg-indigo-600',  bg: 'bg-indigo-950',  text: 'text-indigo-100',  titlebar: 'bg-indigo-900',  accent: 'text-violet-400' },
  { id: 'violet',  name: 'Violet',          preview: 'bg-violet-600',  bg: 'bg-violet-950',  text: 'text-violet-100',  titlebar: 'bg-violet-900',  accent: 'text-purple-400' },
  { id: 'purple',  name: 'Royal Purple',    preview: 'bg-purple-600',  bg: 'bg-purple-950',  text: 'text-purple-100',  titlebar: 'bg-purple-900',  accent: 'text-fuchsia-400' },
  // Warm tones
  { id: 'red',     name: 'Ruby Red',        preview: 'bg-red-600',     bg: 'bg-red-950',     text: 'text-red-100',     titlebar: 'bg-red-900',     accent: 'text-orange-400' },
  { id: 'rose',    name: 'Rose',            preview: 'bg-rose-600',    bg: 'bg-rose-950',    text: 'text-rose-100',    titlebar: 'bg-rose-900',    accent: 'text-pink-400' },
  { id: 'pink',    name: 'Pink',            preview: 'bg-pink-600',    bg: 'bg-pink-950',    text: 'text-pink-100',    titlebar: 'bg-pink-900',    accent: 'text-rose-400' },
  // Vibrant
  { id: 'fuchsia', name: 'Fuchsia',         preview: 'bg-fuchsia-600', bg: 'bg-fuchsia-950', text: 'text-fuchsia-100', titlebar: 'bg-fuchsia-900', accent: 'text-pink-400' },
  // Refined darks
  { id: 'gray',    name: 'Steel Gray',      preview: 'bg-gray-600',    bg: 'bg-gray-950',    text: 'text-gray-100',    titlebar: 'bg-gray-900',    accent: 'text-blue-400' },
  { id: 'neutral', name: 'Warm Gray',       preview: 'bg-neutral-600', bg: 'bg-neutral-950', text: 'text-neutral-100', titlebar: 'bg-neutral-900', accent: 'text-amber-400' },
  { id: 'stone',   name: 'Stone',           preview: 'bg-stone-600',   bg: 'bg-stone-950',   text: 'text-stone-100',   titlebar: 'bg-stone-900',   accent: 'text-orange-400' },
  // Special
  { id: 'midnight',name: 'Midnight Blue',   preview: 'bg-[#1e3a5f]',   bg: 'bg-[#0b1121]',  text: 'text-[#e2e8f0]',  titlebar: 'bg-[#101b35]',  accent: 'text-blue-400' },
  { id: 'dracula', name: 'Dracula',         preview: 'bg-[#6272a4]',   bg: 'bg-[#282a36]',  text: 'text-[#f8f8f2]',  titlebar: 'bg-[#191a21]',  accent: 'text-pink-400' },
  { id: 'github',  name: 'GitHub Light',    preview: 'bg-[#d0d7de]',   bg: 'bg-[#ffffff]',  text: 'text-[#24292f]',  titlebar: 'bg-[#f6f8fa]',  accent: 'text-blue-500' },
]

// ID of the theme used when nothing is saved or match fails
export const defaultThemeId = 'zinc'

// Look up a full theme object by ID, falls back to the first theme (zinc)
export function getTheme(id) {
  return themes.find((t) => t.id === id) || themes[0]
}

// Return only the fields the modal needs (id, name, preview color)
export function getThemeNames() {
  return themes.map(({ id, name, preview }) => ({ id, name, preview }))
}

// Return className string for the page wrapper (background + text color)
export function getThemeClass(id) {
  const t = getTheme(id)
  return `${t.bg} ${t.text}`
}

// Return accent className for interactive elements
export function getAccentClass(id) {
  return getTheme(id).accent
}
