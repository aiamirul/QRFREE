import React, { useState, useRef, useEffect } from 'react';
import { QrCode, Download, Copy, Sparkles, Check, ChevronDown, Maximize2, Clock, Terminal } from 'lucide-react';
import { KanikaLogo } from './KanikaLogo';

interface TopBarProps {
  onOpenTemplates: () => void;
  onOpenHistory: () => void;
  onOpenApiDocs?: () => void;
  onOpenSwaggerDocs?: () => void;
  historyCount: number;
  onCopyImage: () => void;
  onExportPng: () => void;
  onExportJpg: () => void;
  onExportSvg: () => void;
  copySuccess: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenTemplates,
  onOpenHistory,
  onOpenApiDocs,
  onOpenSwaggerDocs,
  historyCount,
  onCopyImage,
  onExportPng,
  onExportJpg,
  onExportSvg,
  copySuccess
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-slate-950/85 backdrop-blur-md border-b border-slate-800">
      {/* Zone 1: Brand Wordmark & AmirulQR Logo */}
      <div className="flex items-center gap-2.5">
        <KanikaLogo size={32} />
        <a href="/" className="flex items-center gap-2 text-lg font-bold font-display tracking-tight text-white hover:text-emerald-300 transition-colors group">
          <span>AmirulQR</span>
          <span className="text-xs font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 group-hover:bg-emerald-500/30">
            Free Foreva
          </span>
        </a>
      </div>

      {/* Zone 2: 4-6 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-400">
        <a href="#content-section" className="hover:text-slate-100 transition-colors">
          Content
        </a>
        <a href="#logo-section" className="hover:text-slate-100 transition-colors">
          Logo Hub
        </a>
        <a href="#style-section" className="hover:text-slate-100 transition-colors">
          Styling
        </a>
        <button
          onClick={onOpenTemplates}
          className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors text-slate-300"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Presets</span>
        </button>
        {onOpenSwaggerDocs && (
          <button
            onClick={onOpenSwaggerDocs}
            className="flex items-center gap-1.5 text-slate-200 hover:text-emerald-300 transition-colors px-2 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/30 group"
            title="Open Interactive Swagger & OpenAPI 3.1 Documentation"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 group-hover:animate-ping" />
            <span className="font-semibold text-xs text-emerald-200">Swagger Docs</span>
            <span className="text-[9px] font-mono px-1 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-bold">
              OAS 3.1
            </span>
          </button>
        )}
        {onOpenApiDocs && (
          <button
            onClick={onOpenApiDocs}
            className="flex items-center gap-1.5 text-slate-300 hover:text-indigo-300 transition-colors px-2 py-1 rounded-md bg-indigo-950/40 border border-indigo-500/20"
            title="API Endpoint Engine (?mode=api&url=mystery.com&centerlogo=website)"
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold text-xs text-indigo-200">API Endpoint</span>
            <span className="text-[9px] font-mono px-1 py-0.2 bg-indigo-500/30 text-indigo-300 rounded font-bold">
              GET
            </span>
          </button>
        )}
        <button
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors text-slate-300"
          title="View recent generated QR codes and links"
        >
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Recent</span>
          {historyCount > 0 && (
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded-full font-mono font-semibold">
              {historyCount}
            </span>
          )}
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onCopyImage}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800/90 border border-slate-700/80 rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap shadow-sm"
          title="Copy QR image directly to clipboard"
        >
          {copySuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy Image</span>
            </>
          )}
        </button>

        {/* Dropdown for Download PNG / JPG / SVG */}
        <div className="relative" ref={dropdownRef}>
          <div className="inline-flex rounded-lg shadow-sm shadow-indigo-600/20">
            <button
              onClick={onExportPng}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-l-lg hover:bg-indigo-500 transition-all active:scale-98"
              title="Download as PNG"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-2 py-1.5 text-white bg-indigo-700 hover:bg-indigo-600 border-l border-indigo-500/50 rounded-r-lg transition-colors"
              title="More export formats (JPG, SVG)"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1.5 z-50 text-xs animate-in fade-in duration-150">
              <button
                onClick={() => {
                  onExportPng();
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-2 flex items-center justify-between text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>Download PNG</span>
                </div>
                <span className="text-[10px] text-slate-400">Lossless</span>
              </button>

              <button
                onClick={() => {
                  onExportJpg();
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-2 flex items-center justify-between text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Download JPG</span>
                </div>
                <span className="text-[10px] text-slate-400">Photo / Print</span>
              </button>

              <div className="my-1 border-t border-slate-800" />

              <button
                onClick={() => {
                  onExportSvg();
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-2 flex items-center justify-between text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Download SVG</span>
                </div>
                <span className="text-[10px] text-slate-400">Vector</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
