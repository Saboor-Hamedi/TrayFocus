import React, { memo, useState, useMemo, useEffect, useRef } from 'react';
import TitleBar from '../header/TitleBar';
import { getThemeNames } from '../../theme';

// ============================================================
// Theme picker modal — searchable grid of 20 color themes.
//
// Features:
//  - Search input auto-focuses when modal opens
//  - Escape key or backdrop click closes the modal
//  - Search resets every time modal opens (starts fresh)
//  - Selected theme auto-scrolls into view
//  - Staggered fade-in animation on each swatch
//  - Accessible: role="dialog", aria-labels, aria-pressed
//  - Fixed height — doesn't jump when filtering results
// ============================================================

const ThemeModal = ({
    isOpen,       // controlled from parent — show/hide the modal
    onClose,      // called when user closes (Escape, backdrop, X button)
    currentTheme, // ID of the currently active theme (e.g. 'zinc')
    onSelectTheme // called when user picks a new theme
}) => {
    // ---- state ----
    const [search, setSearch] = useState('');

    // ---- refs ----
    const inputRef = useRef(null);       // search input — for auto-focus
    const selectedRef = useRef(null);    // currently active theme button — for scroll-into-view

    // ---- derived data ----
    // Memoized — runs once (empty deps) since the theme list never changes
    const allThemes = useMemo(() => getThemeNames(), []);

    // Filter list reactively as the user types in the search box
    const filtered = useMemo(() => {
        if (!search.trim()) return allThemes;
        const q = search.toLowerCase();
        return allThemes.filter((t) => t.name.toLowerCase().includes(q));
    }, [search, allThemes]);

    // ---- effects ----

    // Reset search + auto-focus input when modal opens
    // requestAnimationFrame ensures the DOM is painted before focusing
    useEffect(() => {
        if (isOpen) {
            setSearch('');
            const id = requestAnimationFrame(() => inputRef.current?.focus());
            return () => cancelAnimationFrame(id);
        }
    }, [isOpen]);

    // Close on Escape key while modal is open
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    // Scroll the currently-selected theme into view when modal appears
    useEffect(() => {
        if (isOpen && selectedRef.current) {
            selectedRef.current.scrollIntoView({ block: 'nearest' });
        }
    }, [isOpen]);

    // ---- render guard ----
    // Don't render anything when closed (avoids DOM noise and stray event listeners)
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            {/* ---- backdrop — clicking here closes the modal ---- */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
                onClick={onClose}
                aria-hidden="true"
            />

            {/* ---- modal container ---- */}
            <div className="relative w-full max-w-[320px] bg-zinc-900/95 backdrop-blur-xl rounded-xl border border-white/5 shadow-2xl shadow-black/40 overflow-hidden">
                {/* ---- custom title bar (draggable, only close button active) ---- */}
                <TitleBar 
                    title="Theme"
                    showMaximize={false}
                    showMinimize={false}
                    onClose={onClose}
                    backgroundColor="bg-transparent"
                    textColor="text-white/80"
                />

                {/* ---- search bar ---- */}
                <div className="px-4 pt-2 pb-3">
                    <div className="relative">
                        {/* search icon (magnifying glass) */}
                        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                        </svg>
                        <input
                            ref={inputRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search themes..."
                            aria-label="Search themes"
                            className="w-full bg-white/[0.04] border border-white/[0.06] rounded-md py-1.5 pl-7 pr-3 text-[11px] text-white/70 placeholder:text-white/15 outline-none focus:border-white/10 focus:bg-white/[0.06] transition-all"
                        />
                    </div>
                </div>

                {/* ---- theme grid (fixed min height so modal doesn't jump) ---- */}
                <div className="px-4 pb-4 min-h-[240px] flex flex-col">
                    <div className="flex-1">
                    {/* empty state — shown when search has no matches */}
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-1.5 h-full">
                            <svg className="h-5 w-5 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                            </svg>
                            <span className="text-[10px] text-white/15">No themes match "{search}"</span>
                            <button
                                onClick={() => setSearch('')}
                                className="text-[10px] text-white/30 hover:text-white/50 transition-colors underline underline-offset-2"
                                aria-label="Clear search"
                            >
                                Clear search
                            </button>
                        </div>
                    ) : (
                        // 5-column grid of theme swatches
                        <div className="grid grid-cols-5 gap-1.5 content-start">
                            {/* ---- each theme is a button with a color circle + name ---- */}
                            {filtered.map((theme, i) => {
                                const isSelected = currentTheme === theme.id;
                                return (
                                    <button
                                        key={theme.id}
                                        ref={isSelected ? selectedRef : null}
                                        onClick={() => onSelectTheme(theme.id)}
                                        aria-label={`Select ${theme.name} theme${isSelected ? ' (current)' : ''}`}
                                        aria-pressed={isSelected}
                                        // staggered animation: each item fades in 30ms after the previous
                                        style={{ animationDelay: `${i * 30}ms` }}
                                        className={`animate-[theme-in_0.2s_ease-out_both] group relative flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all duration-200 active:scale-[0.96] ${
                                            isSelected 
                                                ? 'bg-white/[0.08] ring-1 ring-white/10' 
                                                : 'hover:bg-white/[0.04]'
                                        }`}
                                    >
                                        {/* color swatch circle */}
                                        <div className={`w-5 h-5 rounded-full ${theme.preview} shadow-sm transition-all duration-200 group-hover:scale-110 group-hover:shadow ${
                                            isSelected ? 'ring-[1.5px] ring-white/25 ring-offset-1 ring-offset-zinc-900' : ''
                                        }`} />
                                        
                                        {/* theme name label */}
                                        <span className={`text-[8px] font-medium leading-none text-center select-none ${
                                            isSelected ? 'text-white/80' : 'text-white/25 group-hover:text-white/45'
                                        }`}>
                                            {theme.name}
                                        </span>

                                        {/* checkmark badge on the selected theme */}
                                        {isSelected && (
                                            <span className="absolute top-0.5 right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-white/90">
                                                <svg className="h-1.5 w-1.5 text-zinc-900" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    </div>

                    {/* ---- footer — shows theme count, clear button when searching ---- */}
                    <div className="mt-3 flex items-center justify-between border-t border-white/[0.04] pt-2.5 shrink-0">
                        <span className="text-[9px] text-white/10 tabular-nums">
                            {search.trim() ? `${filtered.length} / ${allThemes.length}` : `${allThemes.length}`} themes
                        </span>
                        {search.trim() && (
                            <button
                                onClick={() => setSearch('')}
                                className="text-[9px] text-white/20 hover:text-white/40 transition-colors"
                                aria-label="Clear search"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(ThemeModal);