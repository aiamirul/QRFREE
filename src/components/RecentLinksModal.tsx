import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Search, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  ArrowRight, 
  Globe, 
  MessageCircle, 
  Apple, 
  Share2, 
  Wifi, 
  User, 
  Mail, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { HistoryItem, QRState } from '../types/qr';
import { renderQRCodeToCanvas } from '../utils/qrRenderer';

interface RecentLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export const RecentLinksModal: React.FC<RecentLinksModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onDeleteItem,
  onClearAll
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const filtered = history.filter(item => {
    const q = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.rawText.toLowerCase().includes(q) ||
      item.contentType.toLowerCase().includes(q)
    );
  });

  const handleCopyLink = async (item: HistoryItem) => {
    try {
      await navigator.clipboard.writeText(item.rawText);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const handleQuickDownload = async (item: HistoryItem, format: 'png' | 'jpg') => {
    setDownloadingId(`${item.id}-${format}`);
    try {
      const offscreen = document.createElement('canvas');
      if (format === 'jpg') {
        await renderQRCodeToCanvas(offscreen, item.state, 1024, {
          forceOpaqueBackground: true,
          opaqueBackgroundColor: item.state.colors.background || '#ffffff'
        });
        const link = document.createElement('a');
        link.download = `qrcode-${item.contentType}-${Date.now()}.jpg`;
        link.href = offscreen.toDataURL('image/jpeg', 0.95);
        link.click();
      } else {
        await renderQRCodeToCanvas(offscreen, item.state, 1024);
        const link = document.createElement('a');
        link.download = `qrcode-${item.contentType}-${Date.now()}.png`;
        link.href = offscreen.toDataURL('image/png');
        link.click();
      }
    } catch (e) {
      console.error('Quick download failed:', e);
    } finally {
      setDownloadingId(null);
    }
  };

  const formatTimestamp = (ts: number): string => {
    const diffSec = Math.floor((Date.now() - ts) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    const date = new Date(ts);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'whatsapp': return <MessageCircle className="w-4 h-4 text-emerald-400" />;
      case 'appstore': return <Apple className="w-4 h-4 text-sky-400" />;
      case 'social': return <Share2 className="w-4 h-4 text-pink-400" />;
      case 'wifi': return <Wifi className="w-4 h-4 text-cyan-400" />;
      case 'vcard': return <User className="w-4 h-4 text-violet-400" />;
      case 'email': return <Mail className="w-4 h-4 text-amber-400" />;
      case 'text': return <FileText className="w-4 h-4 text-slate-400" />;
      default: return <Globe className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white font-display flex items-center gap-2">
                <span>Recent Generated Links</span>
                <span className="text-xs font-normal text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded-full">
                  {history.length} saved
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically stored in browser local storage. Load back into studio or re-download anytime.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search destination, title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {history.length > 0 && (
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {confirmClear ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-300">Delete all history?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClearAll();
                      setConfirmClear(false);
                    }}
                    className="px-2.5 py-1 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All History</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-400">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-200">No Recent Links Saved Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                As you build, test, and export QR codes, each unique link and styling will be automatically saved here in your browser.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              No recent links matched &ldquo;{searchTerm}&rdquo;
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="group p-4 bg-slate-950/70 hover:bg-slate-950 rounded-xl border border-slate-800/80 hover:border-indigo-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
              >
                {/* Left info */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                    {getContentTypeIcon(item.contentType)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-200 truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400">
                        {item.contentType}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono shrink-0">
                        {formatTimestamp(item.timestamp)}
                      </span>
                    </div>

                    <div className="font-mono text-xs text-indigo-300/80 truncate mt-1 flex items-center gap-1.5">
                      <span className="truncate">{item.rawText}</span>
                    </div>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-850">
                  {/* Copy Link */}
                  <button
                    type="button"
                    onClick={() => handleCopyLink(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    title="Copy destination link to clipboard"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {/* Quick Export PNG */}
                  <button
                    type="button"
                    onClick={() => handleQuickDownload(item, 'png')}
                    disabled={downloadingId !== null}
                    className="px-2 py-1 rounded-lg text-[11px] font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-1"
                    title="Download PNG at 1024px"
                  >
                    <Download className="w-3 h-3 text-indigo-400" />
                    <span>PNG</span>
                  </button>

                  {/* Quick Export JPG */}
                  <button
                    type="button"
                    onClick={() => handleQuickDownload(item, 'jpg')}
                    disabled={downloadingId !== null}
                    className="px-2 py-1 rounded-lg text-[11px] font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-1"
                    title="Download JPG at 1024px"
                  >
                    <Download className="w-3 h-3 text-emerald-400" />
                    <span>JPG</span>
                  </button>

                  {/* Restore / Load into Studio */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectHistoryItem(item);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all shadow-sm shadow-indigo-600/20 active:scale-98"
                    title="Load this QR code into studio editor"
                  >
                    <span>Load</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete from history */}
                  <button
                    type="button"
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete item from history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px]">
            <AlertCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Private browser storage (stays on your device)</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
