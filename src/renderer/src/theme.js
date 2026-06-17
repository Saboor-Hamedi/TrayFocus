// ============================================================
// Central theme configuration — single source of truth for
// all 19 color themes. Used by both App and ThemeModal.
// ============================================================

const themes = [
  // ── Neutral foundations ─────────────────────────────────────────
  { id: 'zinc',    name: 'Deep Zinc',     preview: 'bg-zinc-700',        bg: 'bg-zinc-950',         text: 'text-zinc-100',       titlebar: 'bg-zinc-900',       accent: 'text-blue-400'    },
  { id: 'slate',   name: 'Slate',         preview: 'bg-slate-700',       bg: 'bg-slate-950',        text: 'text-slate-100',      titlebar: 'bg-slate-900',      accent: 'text-sky-400'     },
  { id: 'gray',    name: 'Steel',         preview: 'bg-gray-700',        bg: 'bg-gray-950',         text: 'text-gray-100',       titlebar: 'bg-gray-900',       accent: 'text-blue-400'    },
  { id: 'neutral', name: 'Warm Gray',     preview: 'bg-neutral-700',     bg: 'bg-neutral-950',      text: 'text-neutral-100',    titlebar: 'bg-neutral-900',    accent: 'text-amber-400'   },
  { id: 'stone',   name: 'Stone',         preview: 'bg-stone-700',       bg: 'bg-stone-950',        text: 'text-stone-100',      titlebar: 'bg-stone-900',      accent: 'text-orange-400'  },
  { id: 'amoled',  name: 'AMOLED Black',  preview: 'bg-zinc-800',        bg: 'bg-black',            text: 'text-zinc-200',       titlebar: 'bg-[#080808]',      accent: 'text-violet-400'  },

  // ── Dark blues ───────────────────────────────────────────────────
  // Deep navy — barely blue-tinted near-black
  { id: 'blue',    name: 'Navy Deep',     preview: 'bg-[#1a2744]',       bg: 'bg-[#080d1a]',        text: 'text-[#c8d5f0]',      titlebar: 'bg-[#050a14]',      accent: 'text-blue-400'    },
  // Twilight — dark desaturated blue-indigo
  { id: 'sky',     name: 'Twilight',      preview: 'bg-[#18263a]',       bg: 'bg-[#080e1a]',        text: 'text-[#bccfe8]',      titlebar: 'bg-[#05090f]',      accent: 'text-sky-400'     },
  // Midnight Blue (rich, existing special)
  { id: 'midnight',name: 'Midnight',      preview: 'bg-[#1e3a5f]',       bg: 'bg-[#0b1121]',        text: 'text-[#dde8f8]',      titlebar: 'bg-[#08101e]',      accent: 'text-blue-400'    },

  // ── Peacock ──────────────────────────────────────────────────────
  // Peacock — dark teal, the jewel-tone dark
  { id: 'cyan',    name: 'Peacock',       preview: 'bg-[#0d2a2a]',       bg: 'bg-[#060e0e]',        text: 'text-[#b0d8d8]',      titlebar: 'bg-[#040a0a]',      accent: 'text-teal-400'    },
  // Deep teal-indigo
  { id: 'indigo',  name: 'Deep Indigo',   preview: 'bg-indigo-900',      bg: 'bg-indigo-950',       text: 'text-indigo-100',     titlebar: 'bg-[#0f0a28]',      accent: 'text-violet-400'  },

  // ── Purples ──────────────────────────────────────────────────────
  { id: 'violet',  name: 'Violet Night',  preview: 'bg-violet-900',      bg: 'bg-violet-950',       text: 'text-violet-100',     titlebar: 'bg-[#130c2a]',      accent: 'text-purple-400'  },
  // Aubergine — very dark purple, almost black with a hint of eggplant
  { id: 'purple',  name: 'Aubergine',     preview: 'bg-[#2d1a3e]',       bg: 'bg-[#0e0816]',        text: 'text-[#dcc8f5]',      titlebar: 'bg-[#09050f]',      accent: 'text-fuchsia-400' },
  // Dracula
  { id: 'dracula', name: 'Dracula',       preview: 'bg-[#6272a4]',       bg: 'bg-[#282a36]',        text: 'text-[#f8f8f2]',      titlebar: 'bg-[#191a21]',      accent: 'text-pink-400'    },

  // ── Dark reds ────────────────────────────────────────────────────
  // Dark Crimson — deep maroon, not bright red
  { id: 'red',     name: 'Dark Crimson',  preview: 'bg-[#3a1010]',       bg: 'bg-[#0e0606]',        text: 'text-[#f0cece]',      titlebar: 'bg-[#090404]',      accent: 'text-red-400'     },
  // Mauve Wine — dark dusty rose
  { id: 'rose',    name: 'Mauve Wine',    preview: 'bg-[#38111e]',       bg: 'bg-[#0f0609]',        text: 'text-[#edc8d5]',      titlebar: 'bg-[#09040a]',      accent: 'text-rose-400'    },
  // Obsidian — very dark fuchsia-purple, nearly black
  { id: 'fuchsia', name: 'Obsidian',      preview: 'bg-[#2a1030]',       bg: 'bg-[#0c060f]',        text: 'text-[#e0c8f0]',      titlebar: 'bg-[#080408]',      accent: 'text-fuchsia-400' },

  // ── Yellow dark ──────────────────────────────────────────────────
  // Amber Dusk — dark amber/gold, barely warm-tinted near-black
  { id: 'pink',    name: 'Amber Dusk',    preview: 'bg-[#3a2800]',       bg: 'bg-[#0f0a02]',        text: 'text-[#f0dda8]',      titlebar: 'bg-[#090600]',      accent: 'text-amber-400'   },

  // ── Light ────────────────────────────────────────────────────────
  { id: 'github',  name: 'GitHub Light',  preview: 'bg-[#d0d7de]',       bg: 'bg-[#ffffff]',        text: 'text-[#24292f]',      titlebar: 'bg-[#f6f8fa]',      accent: 'text-blue-500'    },
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
