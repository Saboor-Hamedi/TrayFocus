# AI Chat System

## Architecture

```
App.jsx
  → ChatPanel (component, receives apiKey, providerId, model, fontSize, accentColor)
    → ChatInput (textarea + send/stop button)
    → ChatMessage (bubble, Markdown rendering)
    → ai/index.js (provider dispatcher)
      → ai/DeepSeek.js   (chat + stream functions)
      → ai/Gemini.js     (chat + stream functions)
```

## Provider Modules (`src/renderer/src/ai/`)

### DeepSeek.js
- Endpoint: `https://api.deepseek.com/v1/chat/completions`
- `chat(messages, apiKey, options)` — non-streaming, returns `{ content, usage }`
- `stream(messages, apiKey, options)` — async generator (SSE), yields content chunks
- Models: `deepseek-chat`, `deepseek-reasoner`
- Stream mode: `stream: true`, parses SSE `data:` lines, extracts `choices[0].delta.content`

### Gemini.js
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models`
- `chat()` → `{model}:generateContent?key={apiKey}`
- `stream()` → `{model}:streamGenerateContent?alt=sse&key={apiKey}`
- Converts OpenAI-style `{role, content}` to Gemini format: `{role: 'model'/'user', parts: [{text}]}`
- Models: `gemini-2.0-flash`, `gemini-2.0-pro`, `gemini-1.5-pro`
- System messages converted: `{role: 'system', content}` → `{role: 'user', parts: [{text: '[System: ...]'}]}`

### index.js
- Provider registry: `{ deepseek, gemini }`
- `getProvider(id)` → returns provider module
- `sendMessage(providerId, messages, apiKey, options)` → non-streaming
- `streamMessage(providerId, messages, apiKey, options)` → async generator

## ChatPanel (`src/renderer/src/components/chat/ChatPanel.jsx`)

### Props
| Prop | Description |
|---|---|
| `apiKey` | Active provider's API key from settings |
| `providerId` | `'deepseek'` or `'gemini'` |
| `model` | Model name (e.g., `'deepseek-chat'`) |
| `fontSize` | From settings (default 14) — scales chat text |
| `accentColor` | Passed to Markdown component for inline code styling |

### State
- `messages` — array of `{ role, content }`
- `loading` — boolean, controls stop button visibility and input disabled state
- `error` — error message string (shown in error bar)
- `abortRef` — `AbortController` reference for stopping generation

### System Prompt
```js
const SYSTEM_PROMPT = {
  role: 'system',
  content: 'You are a helpful, concise assistant. Always respond in English. Be accurate, direct, and helpful. Use clear markdown formatting for code blocks, lists, and emphasis.',
};
```
Prepended to every API call.

### Streaming Flow
1. User types message → `handleSend(text)`
2. Appends user message to state
3. Appends empty `{ role: 'assistant', content: '' }` placeholder
4. Creates `AbortController`, stores in `abortRef`
5. Calls `streamMessage(providerId, [SYSTEM_PROMPT, ...history, userMsg], apiKey, { model, signal })`
6. `for await (const chunk of stream)` → appends chunk to placeholder content → setState → React re-renders
7. On error: if `AbortError` → ignore (user stopped); otherwise → show error bar

### Stopping
- Stop button (square icon) calls `handleStop()`
- `abortRef.current?.abort()` → cancels the fetch
- `setLoading(false)`

## ChatInput (`src/renderer/src/components/chat/ChatInput.jsx`)

- `<textarea>` with `w-full`, `py-2`, `text-sm`, `resize-none`
- `Enter` to send (no shift), `Shift+Enter` for newline
- Placeholder: "Set API key in Settings → AI" when no API key
- Send button (right-arrow) inside the textarea (bottom-right corner, absolute positioned)
- Stop button (square) replaces send button while generating
- Footer hint: "Enter to send, Shift+Enter for newline"

## ChatMessage (`src/renderer/src/components/chat/ChatInput.jsx`, exported)

- **User messages**: right-aligned, blue tinted bubble (`bg-blue-500/15`), plain text
- **AI messages**: left-aligned, dark bubble (`bg-white/[0.04]`), rendered with `Markdown` component
- **Error messages**: left-aligned, red tinted (`bg-red-500/10`)
- No avatars — clean bubble-only design
- Font size controlled by `fontSize` prop: `fSize = Math.max(fontSize * 0.75, 11)px`

## Message Bubbles
- `max-w-[85%]` — doesn't stretch full width
- `rounded-xl rounded-tr-sm` (user) / `rounded-xl rounded-tl-sm` (AI)
- Padding: `px-3.5 py-2`
- Layout: `flex justify-end` (user) / `justify-start` (AI)

## API Key Management
- Entered in **Settings → AI** tab (`AIPanel.jsx`)
- `deepseekKey` and `geminiKey` fields (text inputs with placeholders)
- Stored in `settings.json` along with `aiProvider` and `aiModel`
- ChatPanel reads the active key: `settingsValues[aiProvider === 'gemini' ? 'geminiKey' : 'deepseekKey']`
- API keys never sent anywhere except to the respective provider's API endpoint
- CSP in `index.html` allows `connect-src` to `api.deepseek.com` and `generativelanguage.googleapis.com`

## Markdown in Chat
AI responses are rendered with the shared `Markdown` component — see [markdown.md](./markdown.md) for full details.
