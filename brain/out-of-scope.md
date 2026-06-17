# Out of Scope

TrayFocus is a **desktop utility** — not a full application platform. The following features are intentionally NOT included:

## Not Included

### Backend / Server
- No Node.js server, no Express, no API endpoints
- No database (SQLite, MongoDB, etc.)
- No cloud sync — settings live only in local AppData
- No authentication or user accounts

### File System
- No file browser or file explorer
- No file open/save dialogs (except for standard OS dialogs)
- No folder watching or hot reload for external files
- No project management (no workspaces, no multi-file editing)

### Multi-Window
- Single window only (one `BrowserWindow`)
- No pop-out panels or detachable tabs
- No second display support
- No Picture-in-Picture mode

### Networking
- No WebSocket or Socket.io
- No HTTP server (only outgoing API calls to AI providers)
- No peer-to-peer or LAN discovery
- No proxy configuration

### Rich Text / WYSIWYG
- No rich text editor (only plain text and markdown)
- No image editing or manipulation
- No PDF rendering or export
- No print support

### Collaboration
- No real-time collaboration (no CRDT, no OT)
- No sharing or export to cloud
- No team workspaces
- No commenting or annotations

### Mobile / Cross-Platform
- No mobile app (iOS/Android)
- No web version (only Electron desktop)
- No responsive design (fixed window size)

### Accessibility (beyond basics)
- No screen reader optimization (beyond semantic HTML)
- No keyboard-only navigation help
- No high-contrast mode
- No text-to-speech

### Performance / Advanced
- No virtualization for large lists
- No Web Workers or service workers
- No lazy loading or code splitting
- No PWA capabilities

## Future Possibilities (not planned, just ideas)

- **Plugin system** — load external JS/CSS plugins from a folder
- **Global hotkeys** — `globalShortcut` to show/hide from any app
- **Clipboard history** — track and recall clipboard items
- **Snippet manager** — save and insert text/code templates
- **Color picker** — screen eyedropper with palette history
- **API runner** — save and execute HTTP requests
- **Notes / scratchpad** — persistent markdown notes with tags
- **Task manager** — simple todo list in the sidebar
- **Theme marketplace** — community themes via GitHub
- **Multiple AI conversations** — chat history, conversation switching

## Dependencies NOT Used

- No Redux, MobX, Zustand (state is React `useState`/`useContext` only)
- No React Router (no multi-page, just conditional rendering with `activePage` state)
- No TypeScript (plain JavaScript)
- No styled-components or CSS-in-JS (Tailwind v4 only)
- No testing framework (Jest, Vitest)
- No CI/CD pipeline (GitHub Actions not set up)
- No Docker
