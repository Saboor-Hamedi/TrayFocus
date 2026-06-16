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

        {(
          <div className="relative ml-2 [app-region:no-drag]" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`flex items-center justify-center size-5 rounded transition-colors ${
                updateStatus?.status === 'downloaded'
                  ? 'text-green-400 hover:bg-green-500/10'
                  : isDownloading
                    ? 'text-blue-400'
                    : hasUpdate
                      ? 'text-blue-400 hover:bg-blue-500/10'
                      : 'text-white/20 hover:text-white/50 hover:bg-white/5'
              }`}
              title="Updates"
            >
              {isDownloading ? (
                <RefreshCw className="h-3 w-3 animate-spin" strokeWidth={2.5} />
              ) : (
                <Download className="h-3 w-3" strokeWidth={2} />
              )}
            </button>

            {showDropdown && (
              <div className="absolute top-full mt-1.5 -left-20 w-52 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50">
                <div className="px-3.5 py-2.5">
                  {hasUpdate ? (
                    <>
                      <p className="text-xs text-white font-medium">
                        {updateStatus?.status === 'downloaded' ? 'Update ready' : 'Update available'}
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">v{updateStatus.version}</p>
                    </>
                  ) : isDownloading ? (
                    <>
                      <p className="text-xs text-white font-medium">Downloading</p>
                      <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-blue-500 transition-all duration-300" style={{ width: `${updateStatus.percent || 0}%` }} />
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-white/60">v1.0.0</p>
                  )}
                </div>

                {(hasUpdate || isDownloading) && (
                  <div className="px-3.5 pb-2.5">
                    {updateStatus?.status === 'available' && (
                      <button
                        onClick={() => { onDownloadUpdate?.(); setShowDropdown(false); }}
                        className="w-full px-3 py-1.5 text-[11px] font-medium rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                      >
                        Download & Install
                      </button>
                    )}
                    {updateStatus?.status === 'downloaded' && (
                      <button
                        onClick={() => { onInstallUpdate?.(); setShowDropdown(false); }}
                        className="w-full px-3 py-1.5 text-[11px] font-medium rounded-md bg-green-500/90 text-white hover:bg-green-600 transition-colors"
                      >
                        Restart to Update
                      </button>
                    )}
                  </div>
                )}

                <div className="border-t border-white/5 px-3.5 py-2">
                  <button
                    onClick={() => { onCheckUpdate?.(); setShowDropdown(false); }}
                    className="w-full text-[10px] text-zinc-400 hover:text-white transition-colors"
                  >
                    Check for updates
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