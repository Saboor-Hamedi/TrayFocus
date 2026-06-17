ReferenceError: isSettingsModalOpen is not defined
    at App (App.jsx:746:19)
    at Object.react_stack_bottom_frame (react-dom_client.js?v=af016cd5:12868:12)
    at renderWithHooks (react-dom_client.js?v=af016cd5:4213:19)
    at updateFunctionComponent (react-dom_client.js?v=af016cd5:5569:16)
    at updateSimpleMemoComponent (react-dom_client.js?v=af016cd5:5432:11)
    at beginWork (react-dom_client.js?v=af016cd5:6211:21)
    at runWithFiberInDEV (react-dom_client.js?v=af016cd5:851:66)
    at performUnitOfWork (react-dom_client.js?v=af016cd5:8429:92)
    at workLoopSync (react-dom_client.js?v=af016cd5:8325:37)
    at renderRootSync (react-dom_client.js?v=af016cd5:8309:6)

The above error occurred in the <App> component.

React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.

defaultOnCaughtError @ react-dom_client.js?v=af016cd5:5274
logCaughtError @ react-dom_client.js?v=af016cd5:5300
runWithFiberInDEV @ react-dom_client.js?v=af016cd5:851
inst.componentDidCatch.update.callback @ react-dom_client.js?v=af016cd5:5339
callCallback @ react-dom_client.js?v=af016cd5:4095
commitCallbacks @ react-dom_client.js?v=af016cd5:4103
runWithFiberInDEV @ react-dom_client.js?v=af016cd5:851
commitClassCallbacks @ react-dom_client.js?v=af016cd5:6663
commitLayoutEffectOnFiber @ react-dom_client.js?v=af016cd5:6970
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=af016cd5:7479
commitLayoutEffectOnFiber @ react-dom_client.js?v=af016cd5:7047
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=af016cd5:7479
commitLayoutEffectOnFiber @ react-dom_client.js?v=af016cd5:6975
flushLayoutEffects @ react-dom_client.js?v=af016cd5:8671
commitRoot @ react-dom_client.js?v=af016cd5:8584
commitRootWhenReady @ react-dom_client.js?v=af016cd5:8079
performWorkOnRoot @ react-dom_client.js?v=af016cd5:8051
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=af016cd5:9059
performWorkUntilDeadline @ react-dom_client.js?v=af016cd5:36
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=af016cd5:193
(anonymous) @ main.jsx:11
ErrorBoundary.jsx:22 [App] Crash: ReferenceError: isSettingsModalOpen is not defined
    at App (App.jsx:746:19)