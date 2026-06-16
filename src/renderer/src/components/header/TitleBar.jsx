import React, {memo} from 'react';

// ============================================================
// Custom frameless title bar for Electron
//
// Renders the window controls (minimize, maximize, close) and
// a draggable title region. The [app-region:drag] CSS property
// is Electron-specific — it marks the area that can be dragged
// to move the window.
//
// Props:
//   title         - text shown in the draggable area
//   onMinimize    - callback for minimize button
//   onMaximize    - callback for maximize button
//   onClose       - callback for close button
//   showMinimize  - hide the minimize button (default: true)
//   showMaximize  - hide the maximize button (default: true)
//   backgroundColor - Tailwind class for the bar background
//   textColor     - Tailwind class for text / icon color
// ============================================================

const TitleBar  = ({
    title = "TrayFocus",
    onMinimize, 
    onMaximize, 
    onClose,
    showMinimize = true,
    showMaximize = true,
    backgroundColor = 'bg-zinc-800',
    textColor = 'text-zinc-100'
}) =>{
    return (
        <>
<div className={`flex h-8 w-full select-none items-center justify-between border-b border-zinc-800 ${backgroundColor} ${textColor}`}>
      {/* ---- draggable area — clicking here moves the Electron window ---- */}
      <div className="flex h-full flex-1 items-center px-3 [app-region:drag]">
        <span className="text-xs font-medium tracking-wide">{title}</span>
      </div>

      {/* ---- window control buttons — excluded from drag region ---- */}
      <div className="flex h-full items-center [app-region:no-drag]">
        {/* minimize */}
        {showMinimize && (
<button 
          onClick={onMinimize}
          className="flex h-full w-11 items-center 
                    justify-center transition-colors hover:bg-[#444444]"
          title="Minimize"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
          </svg>
        </button>
        )}
        

        {/* maximize — hidden for non-resizable windows */}
        {showMaximize && (
        <button 
          onClick={onMaximize}
                   className="flex h-full w-11 items-center 
                    justify-center transition-colors hover:bg-[#444444]"

          title="Maximize"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="4" y="4" width="16" height="16" rx="1" />
          </svg>
        </button>
        )}

        {/* close — turns red on hover */}
        <button 
          onClick={onClose}
          className="flex h-full w-11 items-center justify-center transition-colors hover:bg-red-600 hover:text-white"
          title="Close"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
        </>
    )

}

// memo prevents re-render when parent updates but TitleBar props haven't changed
export default memo(TitleBar)