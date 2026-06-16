import React, {memo} from 'react';
import { Minus, Square, X, Pin } from 'lucide-react';

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
    pinned = false,
    titleColor = '',
    backgroundColor = 'bg-zinc-800',
    textColor = 'text-zinc-100'
}) =>{
    return (
        <>
<div className={`flex h-8 w-full select-none items-center justify-between border-b border-zinc-800 ${backgroundColor} ${textColor}`}>
      {/* ---- draggable area — clicking here moves the Electron window ---- */}
      <div className="flex h-full flex-1 items-center px-3 [app-region:drag]">
        <span className={`text-xs font-medium tracking-wide ${titleColor}`}>{title}</span>
        {pinned && <Pin className="ml-2 h-3 w-3 text-blue-400" strokeWidth={2.5} />}
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
          <Minus className="h-3 w-3" strokeWidth={2} />
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
          <Square className="h-3 w-3" strokeWidth={2} />
        </button>
        )}

        {/* close — turns red on hover */}
        <button 
          onClick={onClose}
          className="flex h-full w-11 items-center justify-center transition-colors hover:bg-red-600 hover:text-white"
          title="Close"
        >
          <X className="h-3 w-3" strokeWidth={2} />
        </button>
      </div>
    </div>
        </>
    )

}

// memo prevents re-render when parent updates but TitleBar props haven't changed
export default memo(TitleBar)