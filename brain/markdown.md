# Markdown System

## Markdown Component (`src/renderer/src/components/chat/Markdown.jsx`)

Reusable component that renders markdown to HTML with full styling. Used in both Chat (AI responses) and MarkdownEditor (live preview).

### Features
- **Parser**: `marked` with `breaks: true, gfm: true` (GitHub-Flavored Markdown)
- **Syntax Highlighting**: `highlight.js` — GitHub Dark theme for code blocks, 190+ languages
- **Copy Button**: Each fenced code block has a header with language label + "Copy" button (copies via `navigator.clipboard.writeText`)
- **Inline Code**: Accent-colored via DOM manipulation (`useEffect` finds `:not(pre) > code` and applies computed accent color + 15% opacity background)
- **Horizontal Rules**: `---` gets accent-colored border via DOM manipulation

### Markdown Elements Supported
| Element | Syntax | Styling |
|---|---|---|
| Headings | `# H1`, `## H2`, `### H3` | `text-xl/bold`, `text-lg/semibold`, `text-base/semibold` |
| Bold | `**text**` | `font-semibold text-white/90` |
| Italic | `*text*` | `italic text-white/70` |
| Strikethrough | `~~text~~` | `line-through text-white/40` |
| Links | `[text](url)` | Blue, underline, hover brightens |
| Images | `![alt](url)` | Rounded, max-w-full |
| Unordered List | `- item` | Disc bullets, `pl-5`, `my-1.5` |
| Ordered List | `1. item` | Decimal numbers, `pl-5`, `my-1.5` |
| Blockquote | `> quote` | Left border (`border-l-2`), muted text |
| Horizontal Rule | `---` | Accent-colored (`borderColor: accentValue + '30'`) |
| Tables | `\| col \| col \|` | Rounded corners, alternating row backgrounds, header with dark bg |
| Inline Code | `` `code` `` | Accent-colored text on subtle background |
| Code Blocks | ` ```lang ` | Syntax highlighted, language label header, copy button |

### Code Block Wrapper
Each ```` ```lang ```` block is rendered via a custom `marked.Renderer`:
```html
<div class="cb-wrap">                         <!-- rounded, border, dark bg -->
  <div class="cb-head">                       <!-- subtle header: language label + Copy button -->
    <span>python</span>
    <button class="cb-btn">Copy</button>
  </div>
  <pre><code class="hljs language-python">...</code></pre>
</div>
```
Copy handlers are attached via `useEffect` using `querySelectorAll('.cb-btn')` with `addEventListener`.

### Inline Code Accent
- Container div gets NO global accent class (avoids tinting all text)
- `useEffect` finds `:not(pre) > code` elements
- Applies accent color via a hardcoded color map for 17 known accent IDs
- Sets `el.style.color = accentValue` and `el.style.background = accentValue + '15'`

### Font Scaling
- `fontSize` prop (from settings) controls base text size
- `fs = Math.max(fontSize * 0.75, 11)` — scales proportionally
- Applied via `style={{ fontSize: fs + 'px' }}` on container

## MarkdownEditor (`src/renderer/src/components/chat/MarkdownEditor.jsx`)

Full-featured markdown editor with **CodeMirror 6** and live preview.

### Editor (CodeMirror 6)
- Packages: `@codemirror/state`, `@codemirror/view`, `@codemirror/lang-markdown`, `@codemirror/commands`
- Extensions: `lineNumbers()`, `markdown()`, `history()`, `defaultKeymap` + `historyKeymap`, custom placeholder
- Dark theme via `EditorView.theme()` — custom colors, scrollbar styling
- Font size: `Math.max(fontSize * 0.95, 12)` — e.g., 18px setting → 17.1px in editor
- Line numbers: subtle, transparent background
- Active line highlight: `rgba(255,255,255,0.04)`
- Selection: `rgba(96,165,250,0.25)` (blue tint)

### Split Pane
- Resizable drag handle (`GripVertical` icon, 8px wide, `cursor-col-resize`)
- Drag left/right to resize editor vs preview
- Default split: 50/50 (saved to localStorage)
- Ratio saved on mouse up via `saveSplit(ratio)` to localStorage key `trayfocus-md-split`
- Min/max limits: 15% to 85% (prevent collapsing completely)

### Preview Toggle
- `Ctrl+\` toggles preview anywhere on the markdown page (document-level listener)
- Default: preview CLOSED (editor only) — saved to localStorage key `trayfocus-md-preview`
- Toggle button in header: `Eye` icon (show preview) / `Code2` icon (hide preview)
- Header shows `Ctrl+\` hint for discoverability

### Props
| Prop | Description |
|---|---|
| `value` | Initial markdown content (string) |
| `onChange` | Callback when content changes |
| `readOnly` | Disable editing (default `false`) |
| `fontSize` | From settings (default 14) |
| `accentColor` | Passed to Markdown for inline code styling |

### State Persistence
- Preview open/closed: `localStorage.getItem('trayfocus-md-preview')`
- Split ratio: `localStorage.getItem('trayfocus-md-split')`
- Both read on mount, written on change

### Scrollbars
- CodeMirror: thin 6px custom scrollbars via `::-webkit-scrollbar` pseudo-elements in theme
- Preview: standard browser scrollbars (community standard)

## Accessibility
- `select-text` on preview and editor — users can select and copy content with cursor
- `[app-region:no-drag]` on the header toolbar — prevents Electron from dragging when interacting with controls
