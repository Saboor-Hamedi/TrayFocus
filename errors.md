Error: Cannot access 'settingsLoaded' before initialization

Stack trace:
ReferenceError: Cannot access 'settingsLoaded' before initialization
    at App (http://localhost:5174/src/App.jsx?t=1781657590029:73:18)
    at Object.react_stack_bottom_frame (http://localhost:5174/@fs/B:/electron/TrayFocus/node_modules/.vite/deps/react-dom_client.js?v=090150c2:12868:12)
    at renderWithHooks (http://localhost:5174/@fs/B:/electron/TrayFocus/node_modules/.vite/deps/react-dom_client.js?v=090150c2:4213:19)
    at updateFunctionComponent (http://localhost:5174/@fs/B:/electron/TrayFocus/node_modules/.vite/deps/react-dom_client.js?v=090150c2:5569:16)
    at updateSimpleMemoComponent (http://localhost:5174/@fs/B:/electron/TrayFocus/node_modules/.vite/deps/react-dom_client.js?v=090150c2:5432:11)
    at beginWork (http://localhost:5174/@fs/B:/electron/TrayFocus/node_modules/.vite/deps/react-dom_client.js?v=090150c2:6211:21)
    at runWithFiberInDEV (http://localhost:5174/@fs/B:/electron/TrayFocus/node_modules/.vite/deps/react-dom_client.js?v=090150c2:851:66)
    at performUnitOfWork (http://localhost:5174/@fs/B:/electron/TrayFocus/node_modules/.vite/deps/react-dom_client.js?v=090150c2:8429:92)
    at workLoopSync (http://localhost:5174/@fs/B:/electron/TrayFocus/node_modules/.vite/deps/react-dom_client.js?v=090150c2:8325:37)
    at renderRootSync (http://localhost:5174/@fs/B:/electron/TrayFocus/node_modules/.vite/deps/react-dom_client.js?v=090150c2:8309:6)

Component stack:

    at App (http://localhost:5174/src/App.jsx?t=1781657590029:46:50)
    at ErrorBoundary (http://localhost:5174/src/components/ErrorBoundary.jsx:7:3)