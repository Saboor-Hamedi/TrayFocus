import React, { memo, useState, useRef, useEffect } from 'react';
import { Minus, Square, X, Pin, Download, RefreshCw } from 'lucide-react';

const TitleBar  = ({
    title = "TrayFocus",
    onMinimize, 
    onMaximize, 
    onClose,
    showMinimize = true,
    showMaximize = true,
    pinned = false,
    titleColor = '',
    updateStatus = null,
    onCheckUpdate,
    onDownloadUpdate,
    onInstallUpdate,
    backgroundColor = 'bg-zinc-800',
    textColor = 'text-zinc-100'
}) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!showDropdown) return;
        const h = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [showDropdown]);

    const hasUpdate = updateStatus?.status === 'available' || updateStatus?.status === 'downloaded';
    const isDownloading = updateStatus?.status === 'downloading';

    return (
        <>
<div className={`flex h-8 w-full select-none items-center justify-between border-b border-zinc-800 ${backgroundColor} ${textColor}`}>
      <div className="flex h-full flex-1 items-center px-3 [app-region:drag]">
        <span className={`text-xs font-medium tracking-wide ${titleColor}`}>{title}</span>
        {pinned && <Pin className="ml-2 h-3 w-3 text-blue-400" strokeWidth={2.5} />}

        {(hasUpdate || isDownloading) && (
          <div className="relative ml-3 [app-region:no-drag]" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`flex items-center gap-1 h-5 px-1.5 rounded text-[9px] font-medium transition-colors ${
                updateStatus?.status === 'downloaded'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-blue-500/15 text-blue-400'
              }`}
            >
              {isDownloading ? (
                <RefreshCw className="h-2.5 w-2.5 animate-spin" strokeWidth={2.5} />
              ) : (
                <Download className="h-2.5 w-2.5" strokeWidth={2.5} />
              )}
              {isDownloading ? `${updateStatus.percent}%` : 'Update'}
            </button>

            {showDropdown && (
              <div className="absolute top-full mt-1 left-0 w-56 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl overflow-hidden z-50">
                <div className="px-3 py-2.5 border-b border-zinc-800">
                  <p className="text-[10px] text-white/80 font-medium">
                    {updateStatus?.status === 'downloaded' ? 'Update Ready' : 'Update Available'}
                  </p>
                  {updateStatus?.version && (
                    <p className="text-[10px] text-zinc-400 mt-0.5">Version {updateStatus.version}</p>
                  )}
                </div>
                <div className="p-2">
                  {updateStatus?.status === 'available' && (
                    <button
                      onClick={() => { onDownloadUpdate?.(); setShowDropdown(false); }}
                      className="w-full px-2 py-1.5 text-[10px] font-medium rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                    >
                      Download Update
                    </button>
                  )}
                  {updateStatus?.status === 'downloaded' && (
                    <button
                      onClick={() => { onInstallUpdate?.(); setShowDropdown(false); }}
                      className="w-full px-2 py-1.5 text-[10px] font-medium rounded bg-green-500 text-white hover:bg-green-600 transition-colors"
                    >
                      Restart to Update
                    </button>
                  )}
                  <button
                    onClick={() => { onCheckUpdate?.(); setShowDropdown(false); }}
                    className="w-full mt-1 px-2 py-1.5 text-[10px] font-medium rounded text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Check Again
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ---- window control buttons — excluded from drag region ---- */}
      <div className="flex h-full items-center [app-region:no-drag]">
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

export default memo(TitleBar)